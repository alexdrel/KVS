package kvs

import (
	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/transformers"
)

type transformer struct {
	transformers.Transformer
	// The following fields describe the producer currently being lowered. Yield
	// statements use them to append to a collect result or complete a select.
	producerResult      *ast.IdentifierNode
	producerTemporaries []*ast.IdentifierNode
	selectProducer      bool
	selectLabel         *ast.IdentifierNode
	// Producers are lowered into statements before their containing value. The
	// original producer node is then replaced by its generated result temporary
	// while the rest of that value is visited.
	headReplacements    map[*ast.Node]*ast.Node
}

func NewTransformer(opts *transformers.TransformOptions) *transformers.Transformer {
	tx := &transformer{}
	return tx.NewTransformer(tx.visit, opts.Context)
}

func (tx *transformer) visit(node *ast.Node) *ast.Node {
	if replacement := tx.headReplacements[node]; replacement != nil {
		return replacement
	}
	switch node.Kind {
	case ast.KindKvsExtantReturnStatement:
		if result := tx.lowerHeadProducers(node.Expression(), func(expression *ast.Expression) *ast.Node {
			return tx.transformExtantReturnValue(expression)
		}); result != nil {
			return result
		}
		return tx.transformExtantReturn(node.AsKvsExtantReturnStatement())
	case ast.KindReturnStatement:
		if result := tx.lowerHeadProducers(node.Expression(), func(expression *ast.Expression) *ast.Node {
			return tx.Factory().NewReturnStatement(expression)
		}); result != nil {
			return result
		}
	case ast.KindVariableStatement:
		if result := tx.transformProducerVariableStatement(node.AsVariableStatement()); result != nil {
			return result
		}
	case ast.KindVariableDeclaration:
		if node.Flags&(ast.NodeFlagsKvsNullableBinding|ast.NodeFlagsKvsExtantBinding) != 0 {
			// KVS binding suffixes affect checking but have no runtime behavior.
			// Remove their flags (and the reused definite-assignment token for `!`)
			// before ordinary TypeScript transforms and emission continue.
			declaration := node.AsVariableDeclaration()
			exclamationToken := declaration.ExclamationToken
			if node.Flags&ast.NodeFlagsKvsExtantBinding != 0 {
				exclamationToken = nil
			}
			updated := tx.Factory().UpdateVariableDeclaration(
				declaration,
				tx.Visitor().VisitNode(declaration.Name()),
				exclamationToken,
				tx.Visitor().VisitNode(declaration.Type),
				tx.Visitor().VisitNode(declaration.Initializer),
			)
			if updated == node {
				updated = node.Clone(tx.Factory())
			}
			updated.Flags &^= ast.NodeFlagsKvsNullableBinding | ast.NodeFlagsKvsExtantBinding
			return updated
		}
	case ast.KindExpressionStatement:
		if result := tx.transformProducerExpressionStatement(node.AsExpressionStatement()); result != nil {
			return result
		}
	case ast.KindKvsYieldStatement:
		if result := tx.lowerHeadProducers(node.Expression(), func(expression *ast.Expression) *ast.Node {
			return tx.transformYieldValue(expression, false)
		}); result != nil {
			return result
		}
		return tx.transformYield(node.Expression(), false)
	case ast.KindKvsExtantYieldStatement:
		if result := tx.lowerHeadProducers(node.Expression(), func(expression *ast.Expression) *ast.Node {
			return tx.transformYieldValue(expression, true)
		}); result != nil {
			return result
		}
		return tx.transformYield(node.Expression(), true)
	case ast.KindKvsExtantAssignmentExpression:
		return tx.transformExtantAssignment(node.AsKvsExtantAssignmentExpression())
	case ast.KindKvsNullableAssertionExpression, ast.KindKvsExtantAssertionExpression:
		return tx.Visitor().VisitNode(node.Expression())
	case ast.KindKvsCollectExpression, ast.KindKvsSelectExpression:
		// Unsupported placements are diagnosed by the checker. Emit an empty
		// recovery value instead of leaking KVS syntax into later transformers.
		if node.Kind == ast.KindKvsSelectExpression {
			return tx.Factory().NewKeywordExpression(ast.KindNullKeyword)
		}
		return tx.Factory().NewArrayLiteralExpression(nil, false)
	}
	return tx.Visitor().VisitEachChild(node)
}

func (tx *transformer) transformExtantAssignment(node *ast.KvsExtantAssignmentExpression) *ast.Node {
	//     left ?= right
	// becomes
	//     (_a = right) != null ? left = _a : _a
	//
	// The temporary evaluates the candidate once and makes the whole expression
	// produce that candidate whether or not assignment occurs. This prototype
	// deliberately evaluates the RHS before a nontrivial assignment target; the
	// target-spilling needed to preserve JavaScript evaluation order is pending.
	factory := tx.Factory()
	temp := factory.NewTempVariable()
	tx.EmitContext().AddVariableDeclaration(temp)
	right := tx.Visitor().VisitNode(node.Right)
	left := tx.Visitor().VisitNode(node.Left)
	value := factory.NewAssignmentExpression(temp, right)
	condition := factory.NewBinaryExpression(nil, value, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	assignment := factory.NewAssignmentExpression(left, temp)
	conditional := factory.NewConditionalExpression(condition, factory.NewToken(ast.KindQuestionToken), assignment, factory.NewToken(ast.KindColonToken), temp)
	return conditional
}

func isKvsProducer(node *ast.Node) bool {
	return node != nil && (node.Kind == ast.KindKvsCollectExpression || node.Kind == ast.KindKvsSelectExpression)
}

func (tx *transformer) transformProducerExpressionStatement(node *ast.ExpressionStatement) *ast.Node {
	return tx.lowerHeadProducers(node.Expression, func(expression *ast.Expression) *ast.Node {
		return tx.Factory().NewExpressionStatement(expression)
	})
}

func (tx *transformer) transformProducerVariableStatement(node *ast.VariableStatement) *ast.Node {
	declarationList := node.DeclarationList.AsVariableDeclarationList()
	if len(declarationList.Declarations.Nodes) != 1 {
		return nil
	}
	declaration := declarationList.Declarations.Nodes[0].AsVariableDeclaration()
	return tx.lowerHeadProducers(declaration.Initializer, func(result *ast.Expression) *ast.Node {
		factory := tx.Factory()
		updatedDeclaration := factory.UpdateVariableDeclaration(
			declaration,
			declaration.Name(),
			declaration.ExclamationToken,
			declaration.Type,
			result,
		)
		updatedList := factory.UpdateVariableDeclarationList(
			declarationList,
			factory.NewNodeList([]*ast.Node{updatedDeclaration}),
			declarationList.Flags,
		)
		return factory.UpdateVariableStatement(node, node.Modifiers(), updatedList)
	})
}

func (tx *transformer) lowerHeadProducers(root *ast.Expression, continuation func(*ast.Expression) *ast.Node) *ast.Node {
	// A producer cannot remain inside a JavaScript expression because its loop
	// lowers to statements. Find every producer that heads a permitted value
	// path, lower those producers in source order, then resume construction of
	// the original value with each producer replaced by its result temporary.
	// Function bodies and nested producers start separate lowering scopes.
	if root == nil {
		return nil
	}
	var producers []*ast.Node
	var collect func(*ast.Node) bool
	collect = func(node *ast.Node) bool {
		if node != root && ast.IsFunctionLike(node) {
			return false
		}
		if isKvsProducer(node) {
			if ast.IsKvsProducerHeadPosition(node) {
				producers = append(producers, node)
			}
			return false
		}
		node.ForEachChild(collect)
		return false
	}
	collect(root)
	if len(producers) == 0 {
		return nil
	}
	if tx.headReplacements == nil {
		tx.headReplacements = make(map[*ast.Node]*ast.Node)
	}
	var lower func(int) *ast.Node
	lower = func(index int) *ast.Node {
		if index == len(producers) {
			return continuation(tx.Visitor().VisitNode(root))
		}
		producer := producers[index]
		return tx.lowerProducer(producer, func(result *ast.Expression) *ast.Node {
			tx.headReplacements[producer] = result
			return lower(index + 1)
		})
	}
	return lower(0)
}

func (tx *transformer) lowerProducer(producer *ast.Node, continuation func(*ast.Expression) *ast.Node) *ast.Node {
	// Lower the common producer shape
	//
	//     collect/select (const item of source) { body }
	//
	// into a result declaration, any yield? temporaries, an ordinary for-of
	// loop, and finally the surrounding statement supplied by continuation.
	// collect starts with [], while select starts with null and exits its loop
	// after the first production.
	factory := tx.Factory()
	selectProducer := producer.Kind == ast.KindKvsSelectExpression
	var initializer *ast.ForInitializer
	var expression *ast.Expression
	var statement *ast.Statement
	if selectProducer {
		data := producer.AsKvsSelectExpression()
		initializer, expression, statement = data.Initializer, data.Expression, data.Statement
	} else {
		data := producer.AsKvsCollectExpression()
		initializer, expression, statement = data.Initializer, data.Expression, data.Statement
	}
	result := factory.NewTempVariable()
	resultInitializer := factory.NewArrayLiteralExpression(nil, false)
	if selectProducer {
		resultInitializer = factory.NewKeywordExpression(ast.KindNullKeyword)
	}
	resultDeclaration := factory.NewVariableDeclaration(result, nil, nil, resultInitializer)
	resultStatement := factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(factory.NewNodeList([]*ast.Node{resultDeclaration}), ast.NodeFlagsNone))
	// Yield lowering consults transformer state. Save and restore it because a
	// producer body may itself contain another producer.
	savedResult := tx.producerResult
	savedTemporaries := tx.producerTemporaries
	savedSelectProducer := tx.selectProducer
	savedLabel := tx.selectLabel
	tx.producerResult = result
	tx.producerTemporaries = nil
	tx.selectProducer = selectProducer
	if selectProducer && selectNeedsLabel(statement) {
		tx.selectLabel = factory.NewUniqueName("select")
	} else {
		tx.selectLabel = nil
	}
	label := tx.selectLabel
	body := tx.Visitor().VisitNode(statement)
	temporaries := tx.producerTemporaries
	tx.producerResult = savedResult
	tx.producerTemporaries = savedTemporaries
	tx.selectProducer = savedSelectProducer
	tx.selectLabel = savedLabel
	loop := factory.NewForInOrOfStatement(ast.KindForOfStatement, nil, tx.Visitor().VisitNode(initializer), tx.Visitor().VisitNode(expression), body)
	if label != nil {
		loop = factory.NewLabeledStatement(label, loop)
	}
	statements := []*ast.Node{resultStatement}
	if len(temporaries) != 0 {
		declarations := make([]*ast.Node, 0, len(temporaries))
		for _, temp := range temporaries {
			declarations = append(declarations, factory.NewVariableDeclaration(temp, nil, nil, nil))
		}
		statements = append(statements, factory.NewVariableStatement(
			nil,
			factory.NewVariableDeclarationList(factory.NewNodeList(declarations), ast.NodeFlagsNone),
		))
	}
	statements = append(statements, loop)
	continued := continuation(result)
	if continued.Kind == ast.KindSyntaxList {
		statements = append(statements, continued.AsSyntaxList().Children...)
	} else {
		statements = append(statements, continued)
	}
	return factory.NewSyntaxList(statements)
}

func selectNeedsLabel(statement *ast.Node) bool {
	// An unlabeled break is sufficient for a yield directly inside select's
	// generated loop. A yield beneath another loop or switch must instead break
	// a label on the select loop. Do not inspect nested functions or producers:
	// their yields belong to a different control-flow scope.
	var visit func(*ast.Node, bool) bool
	visit = func(node *ast.Node, beneathBreakTarget bool) bool {
		if node == nil || ast.IsFunctionLike(node) || isKvsProducer(node) {
			return false
		}
		if node.Kind == ast.KindKvsYieldStatement || node.Kind == ast.KindKvsExtantYieldStatement {
			return beneathBreakTarget
		}
		switch node.Kind {
		case ast.KindDoStatement,
			ast.KindWhileStatement,
			ast.KindForStatement,
			ast.KindForInStatement,
			ast.KindForOfStatement,
			ast.KindSwitchStatement:
			beneathBreakTarget = true
		}
		found := false
		node.ForEachChild(func(child *ast.Node) bool {
			found = visit(child, beneathBreakTarget)
			return found
		})
		return found
	}
	return visit(statement, false)
}

func (tx *transformer) transformYield(expression *ast.Expression, extant bool) *ast.Node {
	return tx.transformYieldValue(tx.Visitor().VisitNode(expression), extant)
}

func (tx *transformer) transformYieldValue(value *ast.Expression, extant bool) *ast.Node {
	// In collect, yield appends to the result array. In select, it assigns the
	// result and exits the producer loop. The extant form first captures its
	// value and performs the shared KVS presence test (`value != null`), so the
	// expression is evaluated exactly once and absent values are skipped.
	factory := tx.Factory()
	if tx.selectProducer {
		selectValue := func(value *ast.Expression) *ast.Node {
			assignment := factory.NewExpressionStatement(factory.NewAssignmentExpression(tx.producerResult, value))
			return factory.NewSyntaxList([]*ast.Node{assignment, factory.NewBreakStatement(tx.selectLabel)})
		}
		if !extant {
			return selectValue(value)
		}
		temp := factory.NewTempVariable()
		tx.producerTemporaries = append(tx.producerTemporaries, temp)
		condition := factory.NewBinaryExpression(nil, factory.NewAssignmentExpression(temp, value), nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		return factory.NewIfStatement(condition, selectValue(temp), nil)
	}
	push := func(value *ast.Expression) *ast.Node {
		return factory.NewExpressionStatement(factory.NewCallExpression(
			factory.NewPropertyAccessExpression(tx.producerResult, nil, factory.NewIdentifier("push"), ast.NodeFlagsNone),
			nil,
			nil,
			factory.NewNodeList([]*ast.Node{value}),
			ast.NodeFlagsNone,
		))
	}
	if !extant {
		return push(value)
	}
	temp := factory.NewTempVariable()
	tx.producerTemporaries = append(tx.producerTemporaries, temp)
	condition := factory.NewBinaryExpression(
		nil,
		factory.NewAssignmentExpression(temp, value),
		nil,
		factory.NewToken(ast.KindExclamationEqualsToken),
		factory.NewKeywordExpression(ast.KindNullKeyword),
	)
	return factory.NewIfStatement(condition, push(temp), nil)
}

func (tx *transformer) transformExtantReturn(node *ast.KvsExtantReturnStatement) *ast.Node {
	return tx.transformExtantReturnValue(tx.Visitor().VisitNode(node.Expression))
}

func (tx *transformer) transformExtantReturnValue(value *ast.Expression) *ast.Node {
	//     return? value
	// becomes
	//     if ((_a = value) != null) return _a;
	//
	// Capturing the value once also leaves ordinary TypeScript control-flow and
	// downstream transforms with an ordinary conditional return.
	factory := tx.Factory()
	temp := factory.NewTempVariable()
	tx.EmitContext().AddVariableDeclaration(temp)
	assignment := factory.NewAssignmentExpression(temp, value)
	condition := factory.NewBinaryExpression(
		nil,
		assignment,
		nil,
		factory.NewToken(ast.KindExclamationEqualsToken),
		factory.NewKeywordExpression(ast.KindNullKeyword),
	)
	return factory.NewIfStatement(condition, factory.NewReturnStatement(temp), nil)
}
