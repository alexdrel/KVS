package kvs

import (
	"slices"
	"strconv"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/printer"
	"github.com/microsoft/TypeScript/tsc/internal/scanner"
	"github.com/microsoft/TypeScript/tsc/internal/transformers"
)

type transformer struct {
	transformers.Transformer
	resolver printer.EmitResolver
	// The following fields describe the producer currently being lowered. Yield
	// statements use them to append to a collect result or complete a select.
	producerResult      *ast.IdentifierNode
	producerTemporaries []*ast.IdentifierNode
	selectProducer      bool
	lazyProducer        bool
	lazyLabels          map[string]bool
	selectLabel         *ast.IdentifierNode
	// Head effects are lowered into statements before their containing value. The
	// original effect node is then replaced by its generated result temporary
	// while the rest of that value is visited.
	headReplacements map[*ast.Node]*ast.Node
	placeholderNames []*ast.IdentifierNode
}

func NewTransformer(opts *transformers.TransformOptions) *transformers.Transformer {
	tx := &transformer{resolver: opts.EmitResolver}
	return tx.NewTransformer(tx.visit, opts.Context)
}

func (tx *transformer) declareTemp(temp *ast.IdentifierNode) {
	if tx.lazyProducer {
		tx.producerTemporaries = append(tx.producerTemporaries, temp)
	} else {
		tx.EmitContext().AddVariableDeclaration(temp)
	}
}

func (tx *transformer) visit(node *ast.Node) *ast.Node {
	if replacement := tx.headReplacements[node]; replacement != nil {
		return replacement
	}
	switch node.Kind {
	case ast.KindIdentifier:
		if node.AsIdentifier().Text == "__kvsPlaceholder" {
			if len(tx.placeholderNames) != 0 {
				return tx.placeholderNames[len(tx.placeholderNames)-1]
			}
			return tx.Factory().NewIdentifier("undefined")
		}
	case ast.KindSourceFile:
		return tx.Visitor().VisitEachChild(node)
	case ast.KindForOfStatement:
		return tx.transformForOfStatement(node.AsForInOrOfStatement())
	case ast.KindKvsIfBindingStatement:
		return tx.transformIfBindingStatement(node.AsKvsIfBindingStatement())
	case ast.KindKvsExtantReturnStatement:
		if result := tx.lowerHeadEffects(node.Expression(), func(expression *ast.Expression) *ast.Node {
			return tx.transformExtantReturnValue(expression)
		}); result != nil {
			return result
		}
		return tx.transformExtantReturn(node.AsKvsExtantReturnStatement())
	case ast.KindReturnStatement:
		if result := tx.lowerHeadEffects(node.Expression(), func(expression *ast.Expression) *ast.Node {
			return tx.Factory().NewReturnStatement(expression)
		}); result != nil {
			return result
		}
	case ast.KindBreakStatement, ast.KindContinueStatement:
		if tx.lazyProducer && node.Label() != nil && !tx.lazyLabels[node.Label().Text()] {
			if node.Kind == ast.KindBreakStatement {
				return tx.Factory().NewBreakStatement(nil)
			}
			return tx.Factory().NewContinueStatement(nil)
		}
	case ast.KindVariableStatement:
		if result := tx.transformHeadVariableStatement(node.AsVariableStatement()); result != nil {
			return result
		}
	case ast.KindVariableDeclaration:
		if ast.IsBindingPattern(node.Name()) && node.Initializer() != nil {
			if result := transformers.RewriteNullableDestructuringBinding(&tx.Transformer, node, tx.resolver.KvsDestructuringPatternSourceNullable); result != nil {
				return result
			}
		}
		if ast.IsKvsCatchSplitBindingPattern(node.AsVariableDeclaration().Name()) {
			declaration := node.AsVariableDeclaration()
			pattern := declaration.Name().AsBindingPattern()
			name := tx.Factory().NewBindingPattern(ast.KindArrayBindingPattern, tx.Visitor().VisitNodes(pattern.Elements))
			return tx.Factory().UpdateVariableDeclaration(
				declaration,
				name,
				declaration.ExclamationToken,
				tx.Visitor().VisitNode(declaration.Type),
				tx.Visitor().VisitNode(declaration.Initializer),
			)
		}
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
		if result := tx.transformHeadExpressionStatement(node.AsExpressionStatement()); result != nil {
			return result
		}
	case ast.KindKvsYieldStatement:
		if result := tx.lowerHeadEffects(node.Expression(), func(expression *ast.Expression) *ast.Node {
			return tx.transformYieldValue(expression, false)
		}); result != nil {
			return result
		}
		return tx.transformYield(node.Expression(), false)
	case ast.KindKvsExtantYieldStatement:
		if result := tx.lowerHeadEffects(node.Expression(), func(expression *ast.Expression) *ast.Node {
			return tx.transformYieldValue(expression, true)
		}); result != nil {
			return result
		}
		return tx.transformYield(node.Expression(), true)
	case ast.KindKvsExtantAssignmentExpression:
		return tx.transformExtantAssignment(node.AsKvsExtantAssignmentExpression())
	case ast.KindKvsDefaultExpression:
		return tx.transformDefault(node.AsKvsDefaultExpression())
	case ast.KindKvsSieveExpression:
		return tx.transformSieve(node.AsKvsSieveExpression().Expression)
	case ast.KindKvsPlaceholderLambdaExpression:
		placeholder := node.AsKvsPlaceholderLambdaExpression()
		if tx.resolver.IsKvsPlaceholderBoundary(node) {
			return tx.transformPlaceholderLambda(placeholder)
		}
		return tx.Visitor().VisitNode(placeholder.Arrow.AsArrowFunction().Body)
	case ast.KindKvsSieveBindingInitializer:
		return tx.transformSieve(node.AsKvsSieveBindingInitializer().Expression)
	case ast.KindKvsSieveAssignmentExpression:
		return tx.transformSieveAssignment(node.AsKvsSieveAssignmentExpression())
	case ast.KindKvsTypedSpreadAssignmentExpression:
		return tx.transformTypedSpreadAssignment(node.AsKvsTypedSpreadAssignmentExpression())
	case ast.KindKvsFailureDemotionExpression:
		return tx.transformFailureDemotion(node.AsKvsFailureDemotionExpression())
	case ast.KindKvsFailurePromotionExpression:
		// Unsupported placements are diagnosed by the checker. Preserve the left
		// expression for recovery so KVS-only syntax never reaches JavaScript emit.
		return tx.Visitor().VisitNode(node.AsKvsFailurePromotionExpression().Expression)
	case ast.KindKvsCatchSplitExpression:
		return tx.transformCatchSplit(node.AsKvsCatchSplitExpression().Expression)
	case ast.KindKvsCatchSplitAssignmentExpression:
		return tx.transformCatchSplitAssignment(node.AsKvsCatchSplitAssignmentExpression())
	case ast.KindKvsComparisonAlternativesExpression:
		return tx.transformComparisonAlternatives(node.AsKvsComparisonAlternativesExpression())
	case ast.KindKvsComparisonChainExpression:
		return tx.transformComparisonChain(node.AsKvsComparisonChainExpression())
	case ast.KindKvsNullingExpression:
		return tx.transformNullingExpression(node.AsKvsNullingExpression())
	case ast.KindArrayLiteralExpression:
		return tx.transformArrayExpression(node.AsArrayLiteralExpression())
	case ast.KindKvsCompactArrayExpression:
		return tx.transformCompactArrayExpression(node.AsKvsCompactArrayExpression())
	case ast.KindObjectLiteralExpression:
		return tx.transformObjectExpression(node.AsObjectLiteralExpression().AsNode(), node.Properties(), node.AsObjectLiteralExpression().MultiLine, false)
	case ast.KindKvsCompactObjectExpression:
		return tx.transformObjectExpression(node, node.Properties(), node.AsKvsCompactObjectExpression().MultiLine, true)
	case ast.KindKvsTypedObjectExpression:
		return tx.transformTypedObjectExpression(node.AsKvsTypedObjectExpression())
	case ast.KindKvsRangeExpression:
		return tx.transformRangeExpression(node.AsKvsRangeExpression())
	case ast.KindKvsLazyCollectExpression:
		return tx.transformLazyCollectExpression(node.AsKvsLazyCollectExpression())
	case ast.KindKvsNullableAssertionExpression, ast.KindKvsExtantAssertionExpression:
		return tx.Visitor().VisitNode(node.Expression())
	case ast.KindPropertyAccessExpression, ast.KindElementAccessExpression:
		if tx.resolver.IsKvsNullableAccess(node) {
			return tx.transformNullableAccess(node)
		}
	case ast.KindCallExpression:
		if ast.IsKvsExtantCall(node) {
			return tx.transformExtantCall(node.AsCallExpression())
		}
	case ast.KindPrefixUnaryExpression:
		expression := node.AsPrefixUnaryExpression()
		if (expression.Operator == ast.KindPlusPlusToken || expression.Operator == ast.KindMinusMinusToken) && ast.IsKvsOptionalWritePath(expression.Operand) {
			return tx.transformOptionalMutation(expression.Operand, func(target *ast.Node) *ast.Node {
				return tx.Factory().NewPrefixUnaryExpression(expression.Operator, target)
			})
		}
	case ast.KindPostfixUnaryExpression:
		expression := node.AsPostfixUnaryExpression()
		if ast.IsKvsOptionalWritePath(expression.Operand) {
			return tx.transformOptionalMutation(expression.Operand, func(target *ast.Node) *ast.Node {
				return tx.Factory().NewPostfixUnaryExpression(target, expression.Operator)
			})
		}
	case ast.KindBinaryExpression:
		if ast.IsKvsOptionalWritePath(node.AsBinaryExpression().Left) && node.AsBinaryExpression().OperatorToken.Kind == ast.KindEqualsToken {
			return tx.transformOptionalWrite(node.AsBinaryExpression())
		}
		if tx.resolver.IsKvsLiftedBinaryExpression(node) {
			return tx.transformLiftedBinaryExpression(node.AsBinaryExpression())
		}
	case ast.KindKvsCollectExpression, ast.KindKvsSelectExpression, ast.KindKvsForExpression:
		// Unsupported placements are diagnosed by the checker. Emit an empty
		// recovery value instead of leaking KVS syntax into later transformers.
		if node.Kind == ast.KindKvsSelectExpression {
			return tx.Factory().NewKeywordExpression(ast.KindNullKeyword)
		}
		if node.Kind == ast.KindKvsForExpression {
			return tx.Factory().NewIdentifier("undefined")
		}
		return tx.Factory().NewArrayLiteralExpression(nil, false)
	}
	return tx.Visitor().VisitEachChild(node)
}

type optionalWriteSegment struct {
	node      *ast.Node
	optional  bool
	isDefault bool
}

func (tx *transformer) transformOptionalWrite(node *ast.BinaryExpression) *ast.Node {
	return tx.transformOptionalMutation(node.Left, func(target *ast.Node) *ast.Node {
		return tx.Factory().NewAssignmentExpression(target, tx.Visitor().VisitNode(node.Right))
	})
}

func (tx *transformer) transformOptionalMutation(target *ast.Node, mutate func(*ast.Node) *ast.Node) *ast.Node {
	factory := tx.Factory()
	segments := make([]optionalWriteSegment, 0, 4)
	current := target
	for {
		if ast.IsAccessExpression(current) {
			segments = append(segments, optionalWriteSegment{node: current, optional: current.QuestionDotToken() != nil})
			current = current.Expression()
			continue
		}
		if current.Kind == ast.KindKvsDefaultExpression {
			segments = append(segments, optionalWriteSegment{node: current, isDefault: true})
			current = current.Expression()
			continue
		}
		break
	}
	slices.Reverse(segments)
	var lower func(int, *ast.Node, []*ast.Node) *ast.Node
	lower = func(index int, receiver *ast.Node, commits []*ast.Node) *ast.Node {
		if index == len(segments) {
			result := mutate(receiver)
			for _, commit := range slices.Backward(commits) {
				result = factory.NewCommaExpression(commit, result)
			}
			return result
		}
		segment := segments[index]
		if segment.isDefault {
			staged := false
			for _, later := range segments[index+1:] {
				if later.optional {
					staged = true
					break
				}
			}
			if !staged || !tx.resolver.KvsDefaultWritesBack(segment.node) {
				return lower(index+1, tx.transformDefaultValue(segment.node.AsKvsDefaultExpression(), receiver), commits)
			}

			capture, stableReceiver := tx.captureOptionalMutationTarget(receiver)
			valueTemp := factory.NewTempVariable()
			missingTemp := factory.NewTempVariable()
			tx.declareTemp(valueTemp)
			tx.declareTemp(missingTemp)
			value := factory.NewAssignmentExpression(valueTemp, stableReceiver)
			if capture != nil {
				value = factory.NewCommaExpression(capture, value)
			}
			missing := factory.NewAssignmentExpression(missingTemp, factory.NewBinaryExpression(nil, value, nil, factory.NewToken(ast.KindEqualsEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword)))
			fallback := tx.makeDefaultValue(segment.node.AsKvsDefaultExpression())
			resolved := factory.NewConditionalExpression(missing, factory.NewToken(ast.KindQuestionToken), factory.NewAssignmentExpression(valueTemp, fallback), factory.NewToken(ast.KindColonToken), valueTemp)
			commit := factory.NewConditionalExpression(missingTemp, factory.NewToken(ast.KindQuestionToken), factory.NewAssignmentExpression(stableReceiver, valueTemp), factory.NewToken(ast.KindColonToken), valueTemp)
			return lower(index+1, resolved, append(commits, commit))
		}
		makeAccess := func(base *ast.Node) *ast.Node {
			if ast.IsPropertyAccessExpression(segment.node) {
				return factory.NewPropertyAccessExpression(base, nil, tx.Visitor().VisitNode(segment.node.Name()), ast.NodeFlagsNone)
			}
			return factory.NewElementAccessExpression(base, nil, tx.Visitor().VisitNode(segment.node.AsElementAccessExpression().ArgumentExpression), ast.NodeFlagsNone)
		}
		if !segment.optional {
			return lower(index+1, makeAccess(receiver), commits)
		}
		temp := factory.NewTempVariable()
		tx.declareTemp(temp)
		captured := factory.NewAssignmentExpression(temp, receiver)
		condition := factory.NewBinaryExpression(nil, captured, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		return factory.NewConditionalExpression(condition, factory.NewToken(ast.KindQuestionToken), lower(index+1, makeAccess(temp), commits), factory.NewToken(ast.KindColonToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	}
	return lower(0, tx.Visitor().VisitNode(current), nil)
}

func (tx *transformer) captureOptionalMutationTarget(target *ast.Node) (prefix *ast.Node, stable *ast.Node) {
	factory := tx.Factory()
	if ast.IsPropertyAccessExpression(target) {
		base := factory.NewTempVariable()
		tx.declareTemp(base)
		prefix = factory.NewAssignmentExpression(base, target.Expression())
		stable = factory.NewPropertyAccessExpression(base, nil, target.Name(), ast.NodeFlagsNone)
		return prefix, stable
	}
	if ast.IsElementAccessExpression(target) {
		base := factory.NewTempVariable()
		index := factory.NewTempVariable()
		tx.declareTemp(base)
		tx.declareTemp(index)
		prefix = factory.NewCommaExpression(
			factory.NewAssignmentExpression(base, target.Expression()),
			factory.NewAssignmentExpression(index, target.AsElementAccessExpression().ArgumentExpression),
		)
		stable = factory.NewElementAccessExpression(base, nil, index, ast.NodeFlagsNone)
		return prefix, stable
	}
	return nil, target
}

func (tx *transformer) transformStagedCallReceiver(target *ast.Node) (*ast.Node, []*ast.Node) {
	factory := tx.Factory()
	segments := make([]optionalWriteSegment, 0, 4)
	current := target
	for {
		if ast.IsAccessExpression(current) {
			segments = append(segments, optionalWriteSegment{node: current})
			current = current.Expression()
			continue
		}
		if current.Kind == ast.KindKvsDefaultExpression {
			segments = append(segments, optionalWriteSegment{node: current, isDefault: true})
			current = current.Expression()
			continue
		}
		break
	}
	slices.Reverse(segments)
	value := tx.Visitor().VisitNode(current)
	commits := make([]*ast.Node, 0, 2)
	for _, segment := range segments {
		if !segment.isDefault {
			var questionDot *ast.Node
			flags := ast.NodeFlagsNone
			if segment.node.QuestionDotToken() != nil {
				questionDot = factory.NewToken(ast.KindQuestionDotToken)
				flags = ast.NodeFlagsOptionalChain
			}
			if ast.IsPropertyAccessExpression(segment.node) {
				value = factory.NewPropertyAccessExpression(value, questionDot, tx.Visitor().VisitNode(segment.node.Name()), flags)
			} else {
				value = factory.NewElementAccessExpression(value, questionDot, tx.Visitor().VisitNode(segment.node.AsElementAccessExpression().ArgumentExpression), flags)
			}
			continue
		}
		defaultNode := segment.node.AsKvsDefaultExpression()
		if !tx.resolver.KvsDefaultWritesBack(segment.node) {
			value = tx.transformDefaultValueWithoutWriteback(defaultNode, value)
			continue
		}
		capture, stable := tx.captureOptionalMutationTarget(value)
		valueTemp := factory.NewTempVariable()
		missingTemp := factory.NewTempVariable()
		tx.declareTemp(valueTemp)
		tx.declareTemp(missingTemp)
		read := factory.NewAssignmentExpression(valueTemp, stable)
		if capture != nil {
			read = factory.NewCommaExpression(capture, read)
		}
		missing := factory.NewAssignmentExpression(missingTemp, factory.NewBinaryExpression(nil, read, nil, factory.NewToken(ast.KindEqualsEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword)))
		fallback := tx.makeDefaultValue(defaultNode)
		value = factory.NewConditionalExpression(missing, factory.NewToken(ast.KindQuestionToken), factory.NewAssignmentExpression(valueTemp, fallback), factory.NewToken(ast.KindColonToken), valueTemp)
		commits = append(commits, factory.NewConditionalExpression(missingTemp, factory.NewToken(ast.KindQuestionToken), factory.NewAssignmentExpression(stable, valueTemp), factory.NewToken(ast.KindColonToken), valueTemp))
	}
	return value, commits
}

func (tx *transformer) prependMaterializationCommits(result *ast.Node, commits []*ast.Node) *ast.Node {
	for _, commit := range slices.Backward(commits) {
		result = tx.Factory().NewCommaExpression(commit, result)
	}
	return result
}

func (tx *transformer) transformExtantCall(node *ast.CallExpression) *ast.Node {
	factory := tx.Factory()
	info := tx.resolver.GetKvsExtantCallInfo(node.AsNode())
	if info == nil {
		info = &printer.KvsExtantCallInfo{}
	}

	guarded := make(map[int]bool, len(info.GuardedArguments))
	for _, index := range info.GuardedArguments {
		guarded[index] = true
	}
	nullArguments := make(map[int]bool, len(info.NullArguments))
	for _, index := range info.NullArguments {
		nullArguments[index] = true
	}
	undefinedArguments := make(map[int]bool, len(info.UndefinedArguments))
	for _, index := range info.UndefinedArguments {
		undefinedArguments[index] = true
	}
	requiresArgumentHandling := len(guarded) != 0 || len(nullArguments) != 0 || len(undefinedArguments) != 0

	if !requiresArgumentHandling && !info.CallableNullable {
		callee := tx.Visitor().VisitNode(node.Expression)
		return factory.NewCallExpression(callee, nil, tx.Visitor().VisitNodes(node.TypeArguments), tx.Visitor().VisitNodes(node.Arguments), ast.NodeFlagsNone)
	}

	specializedArguments := len(node.Arguments.Nodes) <= 2 && !slices.ContainsFunc(node.Arguments.Nodes, ast.IsSpreadElement)
	var argsTemp *ast.Node
	if requiresArgumentHandling && !specializedArguments {
		temp := factory.NewTempVariable()
		tx.declareTemp(temp)
		argsTemp = temp
	}
	var callee *ast.Node
	var prefix *ast.Node
	var receiver *ast.Node
	var materializationCommits []*ast.Node
	if info.CallableNullable {
		callableTemp := factory.NewTempVariable()
		tx.declareTemp(callableTemp)
		if ast.IsPropertyAccessExpression(node.Expression) || ast.IsElementAccessExpression(node.Expression) {
			receiverTemp := factory.NewTempVariable()
			tx.declareTemp(receiverTemp)
			receiver = receiverTemp
			base := node.Expression.Expression()
			transformedBase, commits := tx.transformStagedCallReceiver(base)
			materializationCommits = commits
			receiverAssignment := factory.NewAssignmentExpression(receiverTemp, transformedBase)
			questionDot := factory.NewToken(ast.KindQuestionDotToken)
			var member *ast.Node
			if ast.IsPropertyAccessExpression(node.Expression) {
				member = factory.NewPropertyAccessExpression(receiverTemp, questionDot, tx.Visitor().VisitNode(node.Expression.Name()), ast.NodeFlagsOptionalChain)
			} else {
				member = factory.NewElementAccessExpression(receiverTemp, questionDot, tx.Visitor().VisitNode(node.Expression.AsElementAccessExpression().ArgumentExpression), ast.NodeFlagsOptionalChain)
			}
			prefix = factory.NewCommaExpression(receiverAssignment, factory.NewAssignmentExpression(callableTemp, member))
		} else {
			prefix = factory.NewAssignmentExpression(callableTemp, tx.Visitor().VisitNode(node.Expression))
		}
		callee = callableTemp
	} else {
		callee = tx.Visitor().VisitNode(node.Expression)
	}
	if specializedArguments && requiresArgumentHandling {
		lastGuard := -1
		if len(info.GuardedArguments) != 0 {
			lastGuard = info.GuardedArguments[len(info.GuardedArguments)-1]
		}
		callArgs := make([]*ast.Node, len(node.Arguments.Nodes))
		type directCallStep struct {
			assignment *ast.Node
			guarded    bool
		}
		steps := make([]directCallStep, 0, lastGuard+1)
		for i, arg := range node.Arguments.Nodes {
			value := tx.Visitor().VisitNode(arg)
			if nullArguments[i] || undefinedArguments[i] {
				value = tx.normalizeExtantCallArgument(value, undefinedArguments[i])
			}
			if i <= lastGuard {
				temp := factory.NewTempVariable()
				tx.declareTemp(temp)
				callArgs[i] = temp
				steps = append(steps, directCallStep{
					assignment: factory.NewAssignmentExpression(temp, value),
					guarded:    guarded[i],
				})
			} else {
				callArgs[i] = value
			}
		}
		if receiver != nil {
			callArgs = append([]*ast.Node{receiver}, callArgs...)
			callee = factory.NewPropertyAccessExpression(callee, nil, factory.NewIdentifier("call"), ast.NodeFlagsNone)
		}
		result := factory.NewCallExpression(callee, nil, tx.Visitor().VisitNodes(node.TypeArguments), factory.NewNodeList(callArgs), ast.NodeFlagsNone)
		result = tx.prependMaterializationCommits(result, materializationCommits)
		for _, step := range slices.Backward(steps) {
			if step.guarded {
				present := factory.NewBinaryExpression(nil, step.assignment, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
				result = factory.NewConditionalExpression(present, factory.NewToken(ast.KindQuestionToken), result, factory.NewToken(ast.KindColonToken), factory.NewKeywordExpression(ast.KindNullKeyword))
			} else {
				result = factory.NewCommaExpression(step.assignment, result)
			}
		}
		if info.CallableNullable {
			present := factory.NewBinaryExpression(nil, prefix, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
			result = factory.NewConditionalExpression(present, factory.NewToken(ast.KindQuestionToken), result, factory.NewToken(ast.KindColonToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		}
		return result
	}

	callArgs := tx.Visitor().VisitNodes(node.Arguments).Nodes
	if argsTemp != nil {
		callArgs = []*ast.Node{factory.NewSpreadElement(argsTemp)}
	}
	if receiver != nil {
		callArgs = append([]*ast.Node{receiver}, callArgs...)
		callee = factory.NewPropertyAccessExpression(callee, nil, factory.NewIdentifier("call"), ast.NodeFlagsNone)
	}
	result := factory.NewCallExpression(callee, nil, tx.Visitor().VisitNodes(node.TypeArguments), factory.NewNodeList(callArgs), ast.NodeFlagsNone)
	result = tx.prependMaterializationCommits(result, materializationCommits)

	if argsTemp == nil {
		present := factory.NewBinaryExpression(nil, prefix, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		return factory.NewConditionalExpression(present, factory.NewToken(ast.KindQuestionToken), result, factory.NewToken(ast.KindColonToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	}

	effectiveIndex := 0
	type callStep struct {
		push    *ast.Node
		present *ast.Node
	}
	steps := make([]callStep, 0, len(node.Arguments.Nodes))
	for i, arg := range node.Arguments.Nodes {
		width := 1
		if i < len(info.ArgumentWidths) {
			width = info.ArgumentWidths[i]
		}
		var pushArg *ast.Node
		spread := ast.IsSpreadElement(arg)
		if spread {
			pushArg = factory.NewSpreadElement(tx.Visitor().VisitNode(arg.Expression()))
		} else {
			pushArg = tx.Visitor().VisitNode(arg)
			if nullArguments[effectiveIndex] || undefinedArguments[effectiveIndex] {
				pushArg = tx.normalizeExtantCallArgument(pushArg, undefinedArguments[effectiveIndex])
			}
		}
		push := factory.NewCallExpression(factory.NewPropertyAccessExpression(argsTemp, nil, factory.NewIdentifier("push"), ast.NodeFlagsNone), nil, nil, factory.NewNodeList([]*ast.Node{pushArg}), ast.NodeFlagsNone)
		effect := push
		for offset := range width {
			index := effectiveIndex + offset
			if spread && (nullArguments[index] || undefinedArguments[index]) {
				value := factory.NewElementAccessExpression(argsTemp, nil, factory.NewNumericLiteral(strconv.Itoa(index), ast.TokenFlagsNone), ast.NodeFlagsNone)
				normalized := tx.normalizeExtantCallArgument(value, undefinedArguments[index])
				effect = factory.NewCommaExpression(effect, factory.NewAssignmentExpression(value, normalized))
			}
		}
		var present *ast.Node
		for offset := range width {
			if guarded[effectiveIndex+offset] {
				value := factory.NewElementAccessExpression(argsTemp, nil, factory.NewNumericLiteral(strconv.Itoa(effectiveIndex+offset), ast.TokenFlagsNone), ast.NodeFlagsNone)
				check := factory.NewBinaryExpression(nil, value, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
				if present == nil {
					present = check
				} else {
					present = factory.NewBinaryExpression(nil, present, nil, factory.NewToken(ast.KindAmpersandAmpersandToken), check)
				}
			}
		}
		steps = append(steps, callStep{push: effect, present: present})
		effectiveIndex += width
	}
	for _, step := range slices.Backward(steps) {
		next := result
		if step.present != nil {
			next = factory.NewConditionalExpression(step.present, factory.NewToken(ast.KindQuestionToken), next, factory.NewToken(ast.KindColonToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		}
		result = factory.NewCommaExpression(step.push, next)
	}
	result = factory.NewCommaExpression(factory.NewAssignmentExpression(argsTemp, factory.NewArrayLiteralExpression(nil, false)), result)
	if info.CallableNullable {
		present := factory.NewBinaryExpression(nil, prefix, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		result = factory.NewConditionalExpression(present, factory.NewToken(ast.KindQuestionToken), result, factory.NewToken(ast.KindColonToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	}
	return result
}

func (tx *transformer) normalizeExtantCallArgument(value *ast.Node, toUndefined bool) *ast.Node {
	factory := tx.Factory()
	temp := factory.NewTempVariable()
	tx.declareTemp(temp)
	assignment := factory.NewAssignmentExpression(temp, value)
	absent := factory.NewKeywordExpression(ast.KindNullKeyword)
	if toUndefined {
		absent = factory.NewVoidExpression(factory.NewNumericLiteral("0", ast.TokenFlagsNone))
	}
	test := factory.NewBinaryExpression(nil, assignment, nil, factory.NewToken(ast.KindEqualsEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	return factory.NewConditionalExpression(test, factory.NewToken(ast.KindQuestionToken), absent, factory.NewToken(ast.KindColonToken), temp)
}

func (tx *transformer) transformNullableAccess(node *ast.Node) *ast.Node {
	factory := tx.Factory()
	questionDot := factory.NewToken(ast.KindQuestionDotToken)
	flags := node.Flags | ast.NodeFlagsOptionalChain
	if node.Kind == ast.KindPropertyAccessExpression {
		access := node.AsPropertyAccessExpression()
		updated := factory.UpdatePropertyAccessExpression(
			access,
			tx.Visitor().VisitNode(access.Expression),
			questionDot,
			tx.Visitor().VisitNode(access.Name()),
			flags,
		)
		updated.Flags |= ast.NodeFlagsOptionalChain
		return updated
	}
	access := node.AsElementAccessExpression()
	updated := factory.UpdateElementAccessExpression(
		access,
		tx.Visitor().VisitNode(access.Expression),
		questionDot,
		tx.Visitor().VisitNode(access.ArgumentExpression),
		flags,
	)
	updated.Flags |= ast.NodeFlagsOptionalChain
	return updated
}

func (tx *transformer) transformRangeExpression(node *ast.KvsRangeExpression) *ast.Node {
	return tx.Factory().NewKvsRangeHelper(
		tx.Visitor().VisitNode(node.Lower),
		tx.Visitor().VisitNode(node.Upper),
		node.OperatorToken.Kind == ast.KindDotDotEqualsToken,
	)
}

func (tx *transformer) transformLazyCollectExpression(node *ast.KvsLazyCollectExpression) *ast.Node {
	factory := tx.Factory()
	sourceName := factory.NewUniqueName("source")
	parameter := factory.NewParameterDeclaration(nil, nil, sourceName, nil, nil, nil)

	savedLazy := tx.lazyProducer
	savedLabels := tx.lazyLabels
	savedTemporaries := tx.producerTemporaries
	tx.lazyProducer = true
	tx.lazyLabels = collectLazyLabels(node.Statement)
	tx.producerTemporaries = nil
	body := tx.Visitor().VisitNode(node.Statement)
	temporaries := tx.producerTemporaries
	tx.lazyProducer = savedLazy
	tx.lazyLabels = savedLabels
	tx.producerTemporaries = savedTemporaries

	statements := make([]*ast.Node, 0, 2)
	if len(temporaries) != 0 {
		declarations := make([]*ast.Node, 0, len(temporaries))
		for _, temp := range temporaries {
			declarations = append(declarations, factory.NewVariableDeclaration(temp, nil, nil, nil))
		}
		statements = append(statements, factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(factory.NewNodeList(declarations), ast.NodeFlagsNone)))
	}
	source := factory.NewBinaryExpression(nil, sourceName, nil, factory.NewToken(ast.KindQuestionQuestionToken), factory.NewArrayLiteralExpression(nil, false))
	loop := factory.NewForInOrOfStatement(ast.KindForOfStatement, nil, tx.transformIterationInitializer(node.Initializer, node.Flags&ast.NodeFlagsKvsImplicitSubject != 0), source, body)
	statements = append(statements, loop)
	function := factory.NewFunctionExpression(nil, factory.NewToken(ast.KindAsteriskToken), nil, nil, factory.NewNodeList([]*ast.Node{parameter}), nil, nil, factory.NewBlock(factory.NewNodeList(statements), true))
	return factory.NewCallExpression(function, nil, nil, factory.NewNodeList([]*ast.Node{tx.Visitor().VisitNode(node.Expression)}), ast.NodeFlagsNone)
}

func collectLazyLabels(statement *ast.Node) map[string]bool {
	labels := make(map[string]bool)
	var visit func(*ast.Node) bool
	visit = func(node *ast.Node) bool {
		if node != statement && (ast.IsFunctionLike(node) || node.Kind == ast.KindKvsCollectExpression || node.Kind == ast.KindKvsLazyCollectExpression || node.Kind == ast.KindKvsSelectExpression) {
			return false
		}
		if node.Kind == ast.KindLabeledStatement {
			labels[node.AsLabeledStatement().Label.Text()] = true
		}
		node.ForEachChild(visit)
		return false
	}
	statement.ForEachChild(visit)
	return labels
}

func (tx *transformer) transformPlaceholderLambda(node *ast.KvsPlaceholderLambdaExpression) *ast.Node {
	factory := tx.Factory()
	arrow := node.Arrow.AsArrowFunction()
	name := factory.NewUniqueName("_arg")
	originalParameter := arrow.Parameters.Nodes[0].AsParameterDeclaration()
	parameter := factory.UpdateParameterDeclaration(originalParameter, originalParameter.Modifiers(), originalParameter.DotDotDotToken, name, originalParameter.QuestionToken, originalParameter.Type, originalParameter.Initializer)
	parameters := factory.NewNodeList([]*ast.Node{parameter})
	tx.placeholderNames = append(tx.placeholderNames, name)
	body := tx.Visitor().VisitNode(arrow.Body)
	tx.placeholderNames = tx.placeholderNames[:len(tx.placeholderNames)-1]

	return factory.UpdateArrowFunction(arrow, arrow.Modifiers(), arrow.TypeParameters, parameters, arrow.Type, arrow.FullSignature, arrow.EqualsGreaterThanToken, body)
}

func (tx *transformer) transformComparisonAlternatives(node *ast.KvsComparisonAlternativesExpression) *ast.Node {
	factory := tx.Factory()
	temp := factory.NewTempVariable()
	tx.declareTemp(temp)
	assignSubject := factory.NewAssignmentExpression(temp, tx.Visitor().VisitNode(node.Subject))
	var membership *ast.Node
	if node.SpreadToken != nil || len(node.Alternatives.Nodes) >= 3 {
		var array *ast.Node
		if node.SpreadToken != nil {
			allowed := tx.Visitor().VisitNode(node.Alternatives.Nodes[0])
			allowedOrEmpty := factory.NewBinaryExpression(nil, allowed, nil, factory.NewToken(ast.KindQuestionQuestionToken), factory.NewArrayLiteralExpression(nil, false))
			spread := factory.NewSpreadElement(allowedOrEmpty)
			array = factory.NewArrayLiteralExpression(factory.NewNodeList([]*ast.Node{spread}), false)
		} else {
			array = factory.NewArrayLiteralExpression(factory.NewNodeList(tx.Visitor().VisitNodes(node.Alternatives).Nodes), false)
		}
		includes := factory.NewPropertyAccessExpression(array, nil, factory.NewIdentifier("includes"), ast.NodeFlagsNone)
		membership = factory.NewCallExpression(includes, nil, nil, factory.NewNodeList([]*ast.Node{temp}), ast.NodeFlagsNone)
		if node.OperatorToken.Kind == ast.KindExclamationEqualsToken {
			membership = factory.NewPrefixUnaryExpression(ast.KindExclamationToken, membership)
		}
	} else {
		join := ast.KindBarBarToken
		if node.OperatorToken.Kind == ast.KindExclamationEqualsToken {
			join = ast.KindAmpersandAmpersandToken
		}
		for _, alternative := range node.Alternatives.Nodes {
			comparison := factory.NewBinaryExpression(nil, temp, nil, factory.NewToken(node.OperatorToken.Kind), tx.Visitor().VisitNode(alternative))
			if membership == nil {
				membership = comparison
			} else {
				membership = factory.NewBinaryExpression(nil, membership, nil, factory.NewToken(join), comparison)
			}
		}
	}
	return factory.NewCommaExpression(assignSubject, membership)
}

func (tx *transformer) transformComparisonChain(node *ast.KvsComparisonChainExpression) *ast.Node {
	factory := tx.Factory()
	left := tx.Visitor().VisitNode(node.Operands.Nodes[0])
	var result *ast.Node
	for i, operator := range node.Operators.Nodes {
		right := tx.Visitor().VisitNode(node.Operands.Nodes[i+1])
		if i+1 < len(node.Operands.Nodes)-1 {
			temp := factory.NewTempVariable()
			tx.declareTemp(temp)
			right = factory.NewAssignmentExpression(temp, right)
			comparison := factory.NewBinaryExpression(nil, left, nil, factory.NewToken(operator.Kind), right)
			left = temp
			if result == nil {
				result = comparison
			} else {
				result = factory.NewLogicalANDExpression(result, comparison)
			}
			continue
		}
		comparison := factory.NewBinaryExpression(nil, left, nil, factory.NewToken(operator.Kind), right)
		if result == nil {
			result = comparison
		} else {
			result = factory.NewLogicalANDExpression(result, comparison)
		}
	}
	return result
}

func (tx *transformer) transformSieve(expression *ast.Expression) *ast.Node {
	factory := tx.Factory()
	kind := tx.resolver.GetKvsSieveKind(expression)
	value := tx.Visitor().VisitNode(expression)
	if kind == printer.KvsSieveDynamic {
		return factory.NewKvsSieveHelper(value)
	}
	if kind == printer.KvsSieveIdentity {
		if tx.resolver.IsKvsNullableExpression(expression) {
			return factory.NewBinaryExpression(nil, value, nil, factory.NewToken(ast.KindQuestionQuestionToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		}
		return value
	}
	temp := factory.NewTempVariable()
	tx.declareTemp(temp)
	assigned := factory.NewAssignmentExpression(temp, value)
	var test *ast.Node
	switch kind {
	case printer.KvsSieveString:
		test = assigned
	case printer.KvsSieveNumber:
		notNaN := factory.NewBinaryExpression(nil, temp, nil, factory.NewToken(ast.KindEqualsEqualsEqualsToken), temp)
		if tx.resolver.IsKvsNullableExpression(expression) {
			present := factory.NewBinaryExpression(nil, assigned, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
			test = factory.NewBinaryExpression(nil, present, nil, factory.NewToken(ast.KindAmpersandAmpersandToken), notNaN)
		} else {
			test = factory.NewCommaExpression(assigned, notNaN)
		}
	case printer.KvsSieveLength, printer.KvsSieveSize:
		property := "length"
		if kind == printer.KvsSieveSize {
			property = "size"
		}
		member := factory.NewPropertyAccessExpression(temp, nil, factory.NewIdentifier(property), ast.NodeFlagsNone)
		if tx.resolver.IsKvsNullableExpression(expression) {
			present := factory.NewBinaryExpression(nil, assigned, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
			test = factory.NewBinaryExpression(nil, present, nil, factory.NewToken(ast.KindAmpersandAmpersandToken), member)
		} else {
			test = factory.NewCommaExpression(assigned, member)
		}
	case printer.KvsSieveRecord:
		keys := factory.NewCallExpression(factory.NewPropertyAccessExpression(factory.NewIdentifier("Object"), nil, factory.NewIdentifier("keys"), ast.NodeFlagsNone), nil, nil, factory.NewNodeList([]*ast.Node{temp}), ast.NodeFlagsNone)
		length := factory.NewPropertyAccessExpression(keys, nil, factory.NewIdentifier("length"), ast.NodeFlagsNone)
		if tx.resolver.IsKvsNullableExpression(expression) {
			present := factory.NewBinaryExpression(nil, assigned, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
			test = factory.NewBinaryExpression(nil, present, nil, factory.NewToken(ast.KindAmpersandAmpersandToken), length)
		} else {
			test = factory.NewCommaExpression(assigned, length)
		}
	}
	return factory.NewConditionalExpression(test, factory.NewToken(ast.KindQuestionToken), temp, factory.NewToken(ast.KindColonToken), factory.NewKeywordExpression(ast.KindNullKeyword))
}

func (tx *transformer) transformSieveAssignment(node *ast.KvsSieveAssignmentExpression) *ast.Node {
	return tx.Factory().NewAssignmentExpression(
		tx.Visitor().VisitNode(node.Left),
		tx.transformSieve(node.Right),
	)
}

func (tx *transformer) transformTypedSpreadAssignment(node *ast.KvsTypedSpreadAssignmentExpression) *ast.Node {
	factory := tx.Factory()
	names := tx.resolver.GetKvsTypedSpreadProperties(node.AsNode())
	fields := make([]*ast.Node, 0, len(names))
	for _, name := range names {
		fields = append(fields, factory.NewStringLiteral(name, ast.TokenFlagsNone))
	}
	return factory.NewKvsProjectHelper(
		tx.Visitor().VisitNode(node.Left),
		tx.Visitor().VisitNode(node.Right),
		fields,
	)
}

func (tx *transformer) transformFailureDemotion(node *ast.KvsFailureDemotionExpression) *ast.Node {
	factory := tx.Factory()
	if !tx.resolver.IsKvsFailureDemotionErrorPattern(node.Pattern) {
		value := factory.NewTempVariable()
		tx.declareTemp(value)
		capture := factory.NewAssignmentExpression(value, tx.Visitor().VisitNode(node.Expression))
		objectIs := factory.NewPropertyAccessExpression(factory.NewIdentifier("Object"), nil, factory.NewIdentifier("is"), ast.NodeFlagsNone)
		matches := factory.NewCallExpression(objectIs, nil, nil, factory.NewNodeList([]*ast.Node{capture, tx.Visitor().VisitNode(node.Pattern)}), ast.NodeFlagsNone)
		return factory.NewConditionalExpression(matches, factory.NewToken(ast.KindQuestionToken), factory.NewKeywordExpression(ast.KindNullKeyword), factory.NewToken(ast.KindColonToken), value)
	}

	caught := factory.NewTempVariable()
	tryBlock := factory.NewBlock(factory.NewNodeList([]*ast.Node{
		factory.NewReturnStatement(tx.Visitor().VisitNode(node.Expression)),
	}), true)
	matches := factory.NewBinaryExpression(nil, caught, nil, factory.NewToken(ast.KindInstanceOfKeyword), tx.Visitor().VisitNode(node.Pattern))
	catchBlock := factory.NewBlock(factory.NewNodeList([]*ast.Node{
		factory.NewIfStatement(matches, factory.NewReturnStatement(factory.NewKeywordExpression(ast.KindNullKeyword)), nil),
		factory.NewThrowStatement(caught),
	}), true)
	catchClause := factory.NewCatchClause(factory.NewVariableDeclaration(caught, nil, nil, nil), catchBlock)
	statements := []*ast.Node{factory.NewTryStatement(tryBlock, catchClause, nil)}
	if node.Expression.SubtreeFacts()&ast.SubtreeContainsAwait == 0 {
		return factory.NewImmediatelyInvokedArrowFunction(statements)
	}
	arrow := factory.NewArrowFunction(
		factory.NewModifierList([]*ast.Node{factory.NewModifier(ast.KindAsyncKeyword)}),
		nil,
		factory.NewNodeList(nil),
		nil,
		nil,
		factory.NewToken(ast.KindEqualsGreaterThanToken),
		factory.NewBlock(factory.NewNodeList(statements), true),
	)
	call := factory.NewCallExpression(factory.NewParenthesizedExpression(arrow), nil, nil, factory.NewNodeList(nil), ast.NodeFlagsNone)
	return factory.NewAwaitExpression(call)
}

func (tx *transformer) transformCatchSplit(expression *ast.Expression) *ast.Node {
	factory := tx.Factory()
	caught := factory.NewTempVariable()
	valueResult := factory.NewArrayLiteralExpression(factory.NewNodeList([]*ast.Node{
		tx.Visitor().VisitNode(expression),
		factory.NewKeywordExpression(ast.KindNullKeyword),
	}), false)
	errorResult := factory.NewArrayLiteralExpression(factory.NewNodeList([]*ast.Node{
		factory.NewKeywordExpression(ast.KindNullKeyword),
		caught,
	}), false)
	tryBlock := factory.NewBlock(factory.NewNodeList([]*ast.Node{factory.NewReturnStatement(valueResult)}), true)
	catchBlock := factory.NewBlock(factory.NewNodeList([]*ast.Node{factory.NewReturnStatement(errorResult)}), true)
	catchClause := factory.NewCatchClause(factory.NewVariableDeclaration(caught, nil, nil, nil), catchBlock)
	statements := []*ast.Node{factory.NewTryStatement(tryBlock, catchClause, nil)}
	if expression.SubtreeFacts()&ast.SubtreeContainsAwait == 0 {
		return factory.NewImmediatelyInvokedArrowFunction(statements)
	}
	arrow := factory.NewArrowFunction(
		factory.NewModifierList([]*ast.Node{factory.NewModifier(ast.KindAsyncKeyword)}),
		nil,
		factory.NewNodeList(nil),
		nil,
		nil,
		factory.NewToken(ast.KindEqualsGreaterThanToken),
		factory.NewBlock(factory.NewNodeList(statements), true),
	)
	call := factory.NewCallExpression(factory.NewParenthesizedExpression(arrow), nil, nil, factory.NewNodeList(nil), ast.NodeFlagsNone)
	return factory.NewAwaitExpression(call)
}

func (tx *transformer) transformCatchSplitAssignment(node *ast.KvsCatchSplitAssignmentExpression) *ast.Node {
	factory := tx.Factory()
	target := factory.NewArrayLiteralExpression(factory.NewNodeList([]*ast.Node{
		tx.Visitor().VisitNode(node.ValueTarget),
		tx.Visitor().VisitNode(node.ErrorTarget),
	}), false)
	assignment := factory.NewAssignmentExpression(target, tx.transformCatchSplit(node.Expression))
	return factory.NewCommaExpression(assignment, tx.Visitor().VisitNode(node.ValueTarget))
}

func (tx *transformer) transformArrayExpression(node *ast.ArrayLiteralExpression) *ast.Node {
	hasConditional := slices.ContainsFunc(node.Elements.Nodes, ast.IsKvsConditionalElement)
	if !hasConditional {
		return tx.Visitor().VisitEachChild(node.AsNode())
	}
	return tx.transformArrayElements(node.Elements.Nodes, node.MultiLine, false)
}

func (tx *transformer) transformCompactArrayExpression(node *ast.KvsCompactArrayExpression) *ast.Node {
	return tx.transformArrayElements(node.Elements.Nodes, node.MultiLine, true)
}

func (tx *transformer) transformArrayElements(sourceElements []*ast.Node, multiLine bool, compact bool) *ast.Node {
	factory := tx.Factory()
	var temp *ast.IdentifierNode
	elements := make([]*ast.Node, 0, len(sourceElements))
	for _, element := range sourceElements {
		if ast.IsSpreadElement(element) {
			source := element.Expression()
			nullableSource := tx.resolver.IsKvsNullableIterableSource(source)
			nullableElement := tx.resolver.IsKvsNullableIterableElement(source)
			visitedSource := tx.Visitor().VisitNode(source)
			if nullableSource {
				visitedSource = factory.NewBinaryExpression(nil, visitedSource, nil, factory.NewToken(ast.KindQuestionQuestionToken), factory.NewArrayLiteralExpression(nil, false))
			}
			if nullableElement {
				materialized := factory.NewArrayLiteralExpression(factory.NewNodeList([]*ast.Node{factory.NewSpreadElement(visitedSource)}), false)
				parameter := factory.NewParameterDeclaration(nil, nil, factory.NewIdentifier("value"), nil, nil, nil)
				present := factory.NewBinaryExpression(nil, factory.NewIdentifier("value"), nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
				predicate := factory.NewArrowFunction(nil, nil, factory.NewNodeList([]*ast.Node{parameter}), nil, nil, factory.NewToken(ast.KindEqualsGreaterThanToken), present)
				visitedSource = factory.NewCallExpression(
					factory.NewPropertyAccessExpression(materialized, nil, factory.NewIdentifier("filter"), ast.NodeFlagsNone),
					nil,
					nil,
					factory.NewNodeList([]*ast.Node{predicate}),
					ast.NodeFlagsNone,
				)
			}
			elements = append(elements, factory.NewSpreadElement(visitedSource))
			continue
		}
		expression := element
		conditional := ast.IsKvsConditionalElement(element)
		if conditional {
			expression = element.Expression()
		}
		visited := tx.Visitor().VisitNode(expression)
		if !conditional && (!compact || !tx.resolver.IsKvsNullableExpression(expression)) {
			elements = append(elements, visited)
			continue
		}
		if temp == nil {
			temp = factory.NewTempVariable()
			tx.declareTemp(temp)
		}
		assigned := factory.NewAssignmentExpression(temp, visited)
		present := factory.NewBinaryExpression(nil, assigned, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		one := factory.NewArrayLiteralExpression(factory.NewNodeList([]*ast.Node{temp}), false)
		none := factory.NewArrayLiteralExpression(nil, false)
		choice := factory.NewConditionalExpression(present, factory.NewToken(ast.KindQuestionToken), one, factory.NewToken(ast.KindColonToken), none)
		elements = append(elements, factory.NewSpreadElement(choice))
	}
	return factory.NewArrayLiteralExpression(factory.NewNodeList(elements), multiLine)
}

func (tx *transformer) transformObjectExpression(node *ast.Node, sourceProperties []*ast.Node, multiLine bool, compact bool) *ast.Node {
	factory := tx.Factory()
	if !compact && node.Kind != ast.KindKvsTypedObjectExpression {
		hasConditional := slices.ContainsFunc(sourceProperties, ast.IsKvsConditionalObjectProperty)
		if !hasConditional {
			return tx.Visitor().VisitEachChild(node)
		}
	}

	var valueTemp *ast.IdentifierNode
	var keyTemp *ast.IdentifierNode
	properties := make([]*ast.Node, 0, len(sourceProperties))
	for _, property := range sourceProperties {
		if ast.IsSpreadAssignment(property) && compact {
			properties = append(properties, factory.NewSpreadAssignment(tx.compactObjectSpread(property.Expression())))
			continue
		}
		if !ast.IsPropertyAssignment(property) && !ast.IsShorthandPropertyAssignment(property) {
			properties = append(properties, tx.Visitor().VisitNode(property))
			continue
		}

		var expression *ast.Node
		if ast.IsPropertyAssignment(property) {
			expression = property.Initializer()
		} else {
			expression = property.Name()
		}
		conditional := ast.IsKvsConditionalObjectProperty(property)
		if !conditional && (!compact || !tx.resolver.IsKvsNullableExpression(expression)) {
			properties = append(properties, tx.Visitor().VisitNode(property))
			continue
		}
		if valueTemp == nil {
			valueTemp = factory.NewTempVariable()
			tx.declareTemp(valueTemp)
		}

		name := tx.Visitor().VisitNode(property.Name())
		var keyAssignment *ast.Node
		if ast.IsComputedPropertyName(property.Name()) {
			if keyTemp == nil {
				keyTemp = factory.NewTempVariable()
				tx.declareTemp(keyTemp)
			}
			keyAssignment = factory.NewAssignmentExpression(keyTemp, tx.Visitor().VisitNode(property.Name().Expression()))
			name = factory.NewComputedPropertyName(keyTemp)
		}
		value := tx.Visitor().VisitNode(expression)
		assigned := factory.NewAssignmentExpression(valueTemp, value)
		present := factory.NewBinaryExpression(nil, assigned, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		included := factory.NewObjectLiteralExpression(factory.NewNodeList([]*ast.Node{factory.NewPropertyAssignment(nil, name, nil, nil, valueTemp)}), false)
		empty := factory.NewObjectLiteralExpression(nil, false)
		choice := factory.NewConditionalExpression(present, factory.NewToken(ast.KindQuestionToken), included, factory.NewToken(ast.KindColonToken), empty)
		if keyAssignment != nil {
			choice = factory.NewCommaExpression(keyAssignment, choice)
		}
		properties = append(properties, factory.NewSpreadAssignment(choice))
	}
	return factory.NewObjectLiteralExpression(factory.NewNodeList(properties), multiLine)
}

func (tx *transformer) transformTypedObjectExpression(node *ast.KvsTypedObjectExpression) *ast.Node {
	factory := tx.Factory()
	written := make(map[string]bool)
	for _, property := range node.Properties.Nodes {
		if (ast.IsPropertyAssignment(property) || ast.IsShorthandPropertyAssignment(property)) && !ast.IsKvsConditionalObjectProperty(property) && property.Name() != nil && !ast.IsComputedPropertyName(property.Name()) {
			written[property.Name().Text()] = true
		}
	}
	properties := make([]*ast.Node, 0)
	for _, item := range tx.resolver.GetKvsTypedObjectDefaults(node.AsNode()) {
		if written[item.Name] {
			continue
		}
		properties = append(properties, factory.NewPropertyAssignment(nil, tx.makeTypedObjectPropertyName(item.Name), nil, nil, tx.makeTypedObjectDefault(item)))
	}
	for _, property := range node.Properties.Nodes {
		if ast.IsSpreadAssignment(property) {
			properties = append(properties, tx.makeTypedObjectSpread(property))
		} else {
			properties = append(properties, property)
		}
	}
	return tx.transformObjectExpression(node.AsNode(), properties, node.MultiLine, false)
}

func (tx *transformer) makeTypedObjectSpread(node *ast.Node) *ast.Node {
	factory := tx.Factory()
	names := tx.resolver.GetKvsTypedSpreadProperties(node)
	fields := make([]*ast.Node, 0, len(names))
	for _, name := range names {
		fields = append(fields, factory.NewStringLiteral(name, ast.TokenFlagsNone))
	}
	return factory.NewSpreadAssignment(factory.NewKvsProjectHelper(
		factory.NewObjectLiteralExpression(nil, false),
		tx.Visitor().VisitNode(node.Expression()),
		fields,
	))
}

func (tx *transformer) makeTypedObjectDefault(item printer.KvsTypedObjectDefault) *ast.Node {
	factory := tx.Factory()
	switch item.Kind {
	case ast.KvsDefaultKindString:
		return factory.NewStringLiteral("", ast.TokenFlagsNone)
	case ast.KvsDefaultKindNumber:
		return factory.NewNumericLiteral("0", ast.TokenFlagsNone)
	case ast.KvsDefaultKindBoolean:
		return factory.NewKeywordExpression(ast.KindFalseKeyword)
	case ast.KvsDefaultKindBigInt:
		return factory.NewBigIntLiteral("0n", ast.TokenFlagsNone)
	case ast.KvsDefaultKindArray:
		return factory.NewArrayLiteralExpression(factory.NewNodeList(nil), false)
	case ast.KvsDefaultKindConstructor:
		return tx.makeDefaultConstructor(item.ConstructorSymbol, nil)
	default:
		properties := make([]*ast.Node, 0, len(item.Properties))
		for _, child := range item.Properties {
			properties = append(properties, factory.NewPropertyAssignment(nil, tx.makeTypedObjectPropertyName(child.Name), nil, nil, tx.makeTypedObjectDefault(child)))
		}
		return factory.NewObjectLiteralExpression(factory.NewNodeList(properties), false)
	}
}

func (tx *transformer) makeDefaultConstructor(symbol *ast.Symbol, node *ast.Node) *ast.Node {
	constructor := tx.resolver.CreateKvsDefaultConstructor(tx.EmitContext(), node, symbol)
	return tx.Factory().NewNewExpression(constructor, nil, tx.Factory().NewNodeList(nil))
}

func (tx *transformer) makeTypedObjectPropertyName(name string) *ast.Node {
	if scanner.IsIdentifierText(name, core.LanguageVariantStandard) {
		return tx.Factory().NewIdentifier(name)
	}
	return tx.Factory().NewStringLiteral(name, ast.TokenFlagsNone)
}

func (tx *transformer) compactObjectSpread(source *ast.Node) *ast.Node {
	factory := tx.Factory()
	visited := tx.Visitor().VisitNode(source)
	if tx.resolver.IsKvsNullableExpression(source) {
		visited = factory.NewBinaryExpression(nil, visited, nil, factory.NewToken(ast.KindQuestionQuestionToken), factory.NewObjectLiteralExpression(nil, false))
	}
	entries := factory.NewCallExpression(factory.NewPropertyAccessExpression(factory.NewIdentifier("Object"), nil, factory.NewIdentifier("entries"), ast.NodeFlagsNone), nil, nil, factory.NewNodeList([]*ast.Node{visited}), ast.NodeFlagsNone)
	parameter := factory.NewParameterDeclaration(nil, nil, factory.NewIdentifier("entry"), nil, nil, nil)
	value := factory.NewElementAccessExpression(factory.NewIdentifier("entry"), nil, factory.NewNumericLiteral("1", ast.TokenFlagsNone), ast.NodeFlagsNone)
	present := factory.NewBinaryExpression(nil, value, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	predicate := factory.NewArrowFunction(nil, nil, factory.NewNodeList([]*ast.Node{parameter}), nil, nil, factory.NewToken(ast.KindEqualsGreaterThanToken), present)
	filtered := factory.NewCallExpression(factory.NewPropertyAccessExpression(entries, nil, factory.NewIdentifier("filter"), ast.NodeFlagsNone), nil, nil, factory.NewNodeList([]*ast.Node{predicate}), ast.NodeFlagsNone)
	return factory.NewCallExpression(factory.NewPropertyAccessExpression(factory.NewIdentifier("Object"), nil, factory.NewIdentifier("fromEntries"), ast.NodeFlagsNone), nil, nil, factory.NewNodeList([]*ast.Node{filtered}), ast.NodeFlagsNone)
}

func (tx *transformer) transformLiftedBinaryExpression(node *ast.BinaryExpression) *ast.Node {
	// Evaluate operands from left to right, stopping when a required operand is
	// absent. Each operand is captured because either may have observable effects.
	factory := tx.Factory()
	leftTemp := factory.NewTempVariable()
	tx.declareTemp(leftTemp)

	left := tx.Visitor().VisitNode(node.Left)
	right := tx.Visitor().VisitNode(node.Right)
	leftValue := factory.NewAssignmentExpression(leftTemp, left)
	operationRight := right
	rightResult := (*ast.Node)(nil)
	if tx.resolver.IsKvsLiftedBinaryRightNullable(node.AsNode()) {
		rightTemp := factory.NewTempVariable()
		tx.declareTemp(rightTemp)
		rightValue := factory.NewAssignmentExpression(rightTemp, right)
		rightPresent := factory.NewBinaryExpression(nil, rightValue, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		operationRight = rightTemp
		operation := factory.NewBinaryExpression(nil, leftTemp, nil, factory.NewToken(node.OperatorToken.Kind), operationRight)
		rightResult = factory.NewConditionalExpression(rightPresent, factory.NewToken(ast.KindQuestionToken), operation, factory.NewToken(ast.KindColonToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	} else {
		rightResult = factory.NewBinaryExpression(nil, leftTemp, nil, factory.NewToken(node.OperatorToken.Kind), operationRight)
	}
	if !tx.resolver.IsKvsLiftedBinaryLeftNullable(node.AsNode()) {
		return factory.NewCommaExpression(leftValue, rightResult)
	}
	leftPresent := factory.NewBinaryExpression(nil, leftValue, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	return factory.NewConditionalExpression(leftPresent, factory.NewToken(ast.KindQuestionToken), rightResult, factory.NewToken(ast.KindColonToken), factory.NewKeywordExpression(ast.KindNullKeyword))
}

func (tx *transformer) transformForOfStatement(node *ast.ForInOrOfStatement) *ast.Node {
	implicitSubject := node.Flags&ast.NodeFlagsKvsImplicitSubject != 0
	// An empty declaration list is parser recovery for malformed TypeScript such
	// as `for (var of source)`. It may not have reached semantic checking, so an
	// emit-resolver query here could introduce diagnostics after the pre-emit
	// snapshot.
	validInitializer := !ast.IsVariableDeclarationList(node.Initializer) || len(node.Initializer.AsVariableDeclarationList().Declarations.Nodes) != 0
	nullableSource := validInitializer && tx.resolver.IsKvsNullableIterableSource(node.Expression)
	if !implicitSubject && !nullableSource {
		return tx.Visitor().VisitEachChild(node.AsNode())
	}
	factory := tx.Factory()
	source := tx.Visitor().VisitNode(node.Expression)
	spillSource := implicitSubject && containsImplicitSubjectReference(node.Expression)
	var sourceStatement *ast.Node
	if spillSource {
		temp := factory.NewTempVariable()
		declaration := factory.NewVariableDeclaration(temp, nil, nil, source)
		sourceStatement = factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(factory.NewNodeList([]*ast.Node{declaration}), ast.NodeFlagsNone))
		source = temp
	}
	if nullableSource {
		source = factory.NewBinaryExpression(nil, source, nil, factory.NewToken(ast.KindQuestionQuestionToken), factory.NewArrayLiteralExpression(nil, false))
	}
	result := factory.UpdateForInOrOfStatement(
		node,
		node.AwaitModifier,
		tx.transformIterationInitializer(node.Initializer, implicitSubject),
		source,
		tx.Visitor().VisitNode(node.Statement),
	)
	if implicitSubject {
		if result == node.AsNode() {
			result = node.AsNode().Clone(factory)
		}
		result.Flags &^= ast.NodeFlagsKvsImplicitSubject
	}
	if sourceStatement != nil {
		return factory.NewBlock(factory.NewNodeList([]*ast.Node{sourceStatement, result}), true)
	}
	return result
}

func (tx *transformer) transformIterationInitializer(initializer *ast.Node, implicitSubject bool) *ast.Node {
	if !implicitSubject {
		return tx.Visitor().VisitNode(initializer)
	}
	factory := tx.Factory()
	name := factory.NewIdentifier("_")
	declaration := factory.NewVariableDeclaration(name, nil, nil, nil)
	return factory.NewVariableDeclarationList(factory.NewNodeList([]*ast.Node{declaration}), ast.NodeFlagsConst)
}

func containsImplicitSubjectReference(node *ast.Node) bool {
	var visit func(*ast.Node, *ast.Node) bool
	visit = func(current *ast.Node, parent *ast.Node) bool {
		if current.Kind == ast.KindIdentifier && current.Text() == "_" && (parent == nil || transformers.IsIdentifierReference(current, parent)) {
			return true
		}
		found := false
		current.ForEachChild(func(child *ast.Node) bool {
			found = visit(child, current)
			return found
		})
		return found
	}
	return visit(node, nil)
}

func (tx *transformer) transformDefault(node *ast.KvsDefaultExpression) *ast.Node {
	value := tx.Visitor().VisitNode(node.Expression)
	return tx.transformDefaultValue(node, value)
}

func (tx *transformer) transformDefaultValue(node *ast.KvsDefaultExpression, value *ast.Node) *ast.Node {
	return tx.transformDefaultValueWithWriteback(node, value, tx.resolver.KvsDefaultWritesBack(node.AsNode()))
}

func (tx *transformer) transformDefaultValueWithoutWriteback(node *ast.KvsDefaultExpression, value *ast.Node) *ast.Node {
	return tx.transformDefaultValueWithWriteback(node, value, false)
}

func (tx *transformer) transformDefaultValueWithWriteback(node *ast.KvsDefaultExpression, value *ast.Node, writeback bool) *ast.Node {
	fallback := tx.makeDefaultValue(node)
	if fallback == nil {
		return value
	}
	operator := ast.KindQuestionQuestionToken
	if writeback {
		operator = ast.KindQuestionQuestionEqualsToken
	}
	return tx.Factory().NewBinaryExpression(nil, value, nil, tx.Factory().NewToken(operator), fallback)
}

func (tx *transformer) makeDefaultValue(node *ast.KvsDefaultExpression) *ast.Node {
	factory := tx.Factory()
	switch tx.resolver.GetKvsDefaultKind(node.AsNode()) {
	case ast.KvsDefaultKindString:
		return factory.NewStringLiteral("", ast.TokenFlagsNone)
	case ast.KvsDefaultKindNumber:
		return factory.NewNumericLiteral("0", ast.TokenFlagsNone)
	case ast.KvsDefaultKindBoolean:
		return factory.NewKeywordExpression(ast.KindFalseKeyword)
	case ast.KvsDefaultKindBigInt:
		return factory.NewBigIntLiteral("0n", ast.TokenFlagsNone)
	case ast.KvsDefaultKindArray:
		return factory.NewArrayLiteralExpression(nil, false)
	case ast.KvsDefaultKindConstructor:
		return tx.makeDefaultConstructor(nil, node.AsNode())
	case ast.KvsDefaultKindObject:
		return tx.makeTypedObjectDefaults(tx.resolver.GetKvsTypedObjectDefaults(node.AsNode()))
	default:
		return nil
	}
}

func (tx *transformer) makeTypedObjectDefaults(items []printer.KvsTypedObjectDefault) *ast.Node {
	properties := make([]*ast.Node, 0, len(items))
	for _, item := range items {
		properties = append(properties, tx.Factory().NewPropertyAssignment(nil, tx.makeTypedObjectPropertyName(item.Name), nil, nil, tx.makeTypedObjectDefault(item)))
	}
	return tx.Factory().NewObjectLiteralExpression(tx.Factory().NewNodeList(properties), false)
}

func (tx *transformer) transformIfBindingStatement(node *ast.KvsIfBindingStatement) *ast.Node {
	//     if (const value = initializer) body
	// becomes
	//     const _a = initializer;
	//     if (_a) { const value = _a; body }
	//
	// The temporary evaluates the initializer once. Keeping the source binding
	// inside the successful block preserves its intentionally one-sided scope.
	// Ordinary bindings use JavaScript truthiness. Sieve bindings instead test
	// the sieved result for presence, so accepted zero and false values succeed.
	factory := tx.Factory()
	clause := node.Clause.AsKvsIfBindingClause()
	declaration := clause.DeclarationList.AsVariableDeclarationList().Declarations.Nodes[0].AsVariableDeclaration()
	sieveBinding := declaration.Initializer != nil && declaration.Initializer.Kind == ast.KindKvsSieveBindingInitializer
	var temp *ast.IdentifierNode
	if tx.lazyProducer {
		// The iterator body owns its hoisted expression temporaries. Keep this
		// block-scoped capture out of the temporary-name pool so it cannot shadow
		// one of those declarations inside its own initializer.
		temp = factory.NewUniqueName("binding")
	} else {
		temp = factory.NewTempVariable()
	}
	tempDeclaration := factory.NewVariableDeclaration(temp, nil, nil, tx.Visitor().VisitNode(declaration.Initializer))
	tempStatement := factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(factory.NewNodeList([]*ast.Node{tempDeclaration}), ast.NodeFlagsConst))

	binding := factory.NewVariableDeclaration(
		tx.Visitor().VisitNode(declaration.Name()),
		nil,
		tx.Visitor().VisitNode(declaration.Type),
		temp,
	)
	bindingStatement := factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(factory.NewNodeList([]*ast.Node{binding}), ast.NodeFlagsConst))
	body := tx.Visitor().VisitNode(clause.Statement)
	statements := []*ast.Node{bindingStatement}
	if ast.IsBlock(body) {
		statements = append(statements, body.AsBlock().Statements.Nodes...)
	} else {
		statements = append(statements, body)
	}
	thenBlock := factory.NewBlock(factory.NewNodeList(statements), true)
	condition := temp.AsNode()
	if sieveBinding {
		condition = factory.NewBinaryExpression(nil, temp, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	}
	ifStatement := factory.NewIfStatement(condition, thenBlock, tx.Visitor().VisitNode(node.ElseStatement))
	return factory.NewSyntaxList([]*ast.Node{tempStatement, ifStatement})
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
	tx.declareTemp(temp)
	right := tx.Visitor().VisitNode(node.Right)
	left := tx.Visitor().VisitNode(node.Left)
	value := factory.NewAssignmentExpression(temp, right)
	condition := factory.NewBinaryExpression(nil, value, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	assignment := factory.NewAssignmentExpression(left, temp)
	conditional := factory.NewConditionalExpression(condition, factory.NewToken(ast.KindQuestionToken), assignment, factory.NewToken(ast.KindColonToken), temp)
	return conditional
}

func (tx *transformer) transformNullingExpression(node *ast.KvsNullingExpression) *ast.Node {
	//     condition ?: value
	// becomes
	//     condition ? value : null
	//
	// The ordinary conditional preserves lazy RHS evaluation. Until KVS
	// truthiness has its own lowering, the emitted condition intentionally uses
	// JavaScript truthiness; that is a recorded prototype limitation.
	factory := tx.Factory()
	return factory.NewConditionalExpression(
		tx.Visitor().VisitNode(node.Condition),
		factory.NewToken(ast.KindQuestionToken),
		tx.Visitor().VisitNode(node.WhenTrue),
		factory.NewToken(ast.KindColonToken),
		factory.NewKeywordExpression(ast.KindNullKeyword),
	)
}

func isKvsProducer(node *ast.Node) bool {
	return node != nil && (node.Kind == ast.KindKvsCollectExpression || node.Kind == ast.KindKvsSelectExpression || node.Kind == ast.KindKvsForExpression)
}

func (tx *transformer) transformHeadExpressionStatement(node *ast.ExpressionStatement) *ast.Node {
	return tx.lowerHeadEffects(node.Expression, func(expression *ast.Expression) *ast.Node {
		return tx.Factory().NewExpressionStatement(expression)
	})
}

func (tx *transformer) transformHeadVariableStatement(node *ast.VariableStatement) *ast.Node {
	declarationList := node.DeclarationList.AsVariableDeclarationList()
	if len(declarationList.Declarations.Nodes) != 1 {
		return nil
	}
	declaration := declarationList.Declarations.Nodes[0].AsVariableDeclaration()
	return tx.lowerHeadEffects(declaration.Initializer, func(result *ast.Expression) *ast.Node {
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

func (tx *transformer) lowerHeadEffects(root *ast.Expression, continuation func(*ast.Expression) *ast.Node) *ast.Node {
	// Producers and failure promotion require statements. Find each effect that
	// heads a permitted value path, lower it, then resume construction of the
	// original value with the effect replaced by its result temporary.
	// Function bodies and nested effects start separate lowering scopes.
	if root == nil {
		return nil
	}
	var effects []*ast.Node
	var collect func(*ast.Node) bool
	collect = func(node *ast.Node) bool {
		if node != root && ast.IsFunctionLike(node) {
			return false
		}
		// A lazy collector becomes a generator function. Effects in its body must
		// be lowered while that body is transformed, never hoisted to the scope
		// where the iterator is created.
		if node.Kind == ast.KindKvsLazyCollectExpression {
			return false
		}
		if isKvsProducer(node) || node.Kind == ast.KindKvsFailurePromotionExpression {
			if ast.IsKvsStatementHeadPosition(node) {
				effects = append(effects, node)
			}
			return false
		}
		node.ForEachChild(collect)
		return false
	}
	collect(root)
	if len(effects) == 0 {
		return nil
	}
	if tx.headReplacements == nil {
		tx.headReplacements = make(map[*ast.Node]*ast.Node)
	}
	var lower func(int) *ast.Node
	lower = func(index int) *ast.Node {
		if index == len(effects) {
			return continuation(tx.Visitor().VisitNode(root))
		}
		effect := effects[index]
		lowerEffect := tx.lowerProducer
		if effect.Kind == ast.KindKvsFailurePromotionExpression {
			lowerEffect = tx.lowerFailurePromotion
		}
		return lowerEffect(effect, func(result *ast.Expression) *ast.Node {
			tx.headReplacements[effect] = result
			return lower(index + 1)
		})
	}
	return lower(0)
}

func (tx *transformer) lowerFailurePromotion(effect *ast.Node, continuation func(*ast.Expression) *ast.Node) *ast.Node {
	node := effect.AsKvsFailurePromotionExpression()
	factory := tx.Factory()
	value := factory.NewTempVariable()
	cause := factory.NewTempVariable()
	caught := factory.NewTempVariable()
	replacement := factory.NewTempVariable()
	null := factory.NewKeywordExpression(ast.KindNullKeyword)

	declarations := factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(factory.NewNodeList([]*ast.Node{
		factory.NewVariableDeclaration(value, nil, nil, null),
		factory.NewVariableDeclaration(cause, nil, nil, factory.NewKeywordExpression(ast.KindNullKeyword)),
	}), ast.NodeFlagsNone))
	tryBlock := factory.NewBlock(factory.NewNodeList([]*ast.Node{
		factory.NewExpressionStatement(factory.NewAssignmentExpression(value, tx.Visitor().VisitNode(node.Expression))),
	}), true)
	catchBlock := factory.NewBlock(factory.NewNodeList([]*ast.Node{
		factory.NewExpressionStatement(factory.NewAssignmentExpression(cause, caught)),
	}), true)
	catchClause := factory.NewCatchClause(factory.NewVariableDeclaration(caught, nil, nil, nil), catchBlock)
	tryStatement := factory.NewTryStatement(tryBlock, catchClause, nil)

	replacementDeclaration := factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(factory.NewNodeList([]*ast.Node{
		factory.NewVariableDeclaration(replacement, nil, nil, tx.Visitor().VisitNode(node.Replacement)),
	}), ast.NodeFlagsNone))
	causePresent := factory.NewBinaryExpression(nil, cause, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	hasCause := factory.NewBinaryExpression(nil, factory.NewStringLiteral("cause", ast.TokenFlagsNone), nil, factory.NewToken(ast.KindInKeyword), replacement)
	attachCause := factory.NewBinaryExpression(nil, causePresent, nil, factory.NewToken(ast.KindAmpersandAmpersandToken), factory.NewPrefixUnaryExpression(ast.KindExclamationToken, hasCause))
	descriptor := factory.NewObjectLiteralExpression(factory.NewNodeList([]*ast.Node{
		factory.NewPropertyAssignment(nil, factory.NewIdentifier("value"), nil, nil, cause),
		factory.NewPropertyAssignment(nil, factory.NewIdentifier("writable"), nil, nil, factory.NewKeywordExpression(ast.KindTrueKeyword)),
		factory.NewPropertyAssignment(nil, factory.NewIdentifier("configurable"), nil, nil, factory.NewKeywordExpression(ast.KindTrueKeyword)),
	}), false)
	defineProperty := factory.NewCallExpression(
		factory.NewPropertyAccessExpression(factory.NewIdentifier("Object"), nil, factory.NewIdentifier("defineProperty"), ast.NodeFlagsNone),
		nil,
		nil,
		factory.NewNodeList([]*ast.Node{replacement, factory.NewStringLiteral("cause", ast.TokenFlagsNone), descriptor}),
		ast.NodeFlagsNone,
	)
	promoteBlock := factory.NewBlock(factory.NewNodeList([]*ast.Node{
		replacementDeclaration,
		factory.NewIfStatement(attachCause, factory.NewExpressionStatement(defineProperty), nil),
		factory.NewThrowStatement(replacement),
	}), true)
	absent := factory.NewBinaryExpression(nil, value, nil, factory.NewToken(ast.KindEqualsEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
	promote := factory.NewIfStatement(absent, promoteBlock, nil)

	return factory.NewSyntaxList([]*ast.Node{declarations, tryStatement, promote, continuation(value)})
}

func (tx *transformer) lowerProducer(producer *ast.Node, continuation func(*ast.Expression) *ast.Node) *ast.Node {
	if producer.Kind == ast.KindKvsForExpression {
		return tx.lowerKvsFor(producer.AsKvsForExpression(), continuation)
	}
	// Lower the common producer shape
	//
	//     collect/select (const item of source) { body }
	//
	// into a result declaration, any yield? temporaries, an ordinary for-of
	// loop, and finally the surrounding statement supplied by continuation.
	// A nullable source is captured once and guards the loop. Collect changes
	// its initial null result to [] only on that present-source path; select
	// remains null until its first production.
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
	nullableSource := tx.resolver.IsKvsNullableIterableSource(expression)
	captureSource := nullableSource || producer.Flags&ast.NodeFlagsKvsImplicitSubject != 0 && containsImplicitSubjectReference(expression)
	result := factory.NewTempVariable()
	resultInitializer := factory.NewArrayLiteralExpression(nil, false)
	if selectProducer || nullableSource {
		resultInitializer = factory.NewKeywordExpression(ast.KindNullKeyword)
	}
	resultDeclaration := factory.NewVariableDeclaration(result, nil, nil, resultInitializer)
	resultStatement := factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(factory.NewNodeList([]*ast.Node{resultDeclaration}), ast.NodeFlagsNone))
	// Yield lowering consults transformer state. Save and restore it because a
	// producer body may itself contain another producer.
	savedResult := tx.producerResult
	savedTemporaries := tx.producerTemporaries
	savedSelectProducer := tx.selectProducer
	savedLazyProducer := tx.lazyProducer
	savedLabel := tx.selectLabel
	tx.producerResult = result
	tx.producerTemporaries = nil
	tx.selectProducer = selectProducer
	tx.lazyProducer = false
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
	tx.lazyProducer = savedLazyProducer
	tx.selectLabel = savedLabel
	var visitedSource *ast.Node
	var sourceTemp *ast.IdentifierNode
	if captureSource {
		sourceTemp = factory.NewTempVariable()
		visitedSource = sourceTemp
	} else {
		visitedSource = tx.Visitor().VisitNode(expression)
	}
	loop := factory.NewForInOrOfStatement(ast.KindForOfStatement, nil, tx.transformIterationInitializer(initializer, producer.Flags&ast.NodeFlagsKvsImplicitSubject != 0), visitedSource, body)
	if label != nil {
		loop = factory.NewLabeledStatement(label, loop)
	}
	statements := make([]*ast.Node, 0, 4)
	if captureSource {
		sourceDeclaration := factory.NewVariableDeclaration(sourceTemp, nil, nil, tx.Visitor().VisitNode(expression))
		statements = append(statements, factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(factory.NewNodeList([]*ast.Node{sourceDeclaration}), ast.NodeFlagsNone)))
	}
	statements = append(statements, resultStatement)
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
	if nullableSource {
		presentStatements := make([]*ast.Node, 0, 2)
		if !selectProducer {
			presentStatements = append(presentStatements, factory.NewExpressionStatement(factory.NewAssignmentExpression(result, factory.NewArrayLiteralExpression(nil, false))))
		}
		presentStatements = append(presentStatements, loop)
		condition := factory.NewBinaryExpression(nil, sourceTemp, nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		statements = append(statements, factory.NewIfStatement(condition, factory.NewBlock(factory.NewNodeList(presentStatements), true), nil))
	} else {
		statements = append(statements, loop)
	}
	continued := continuation(result)
	if continued.Kind == ast.KindSyntaxList {
		statements = append(statements, continued.AsSyntaxList().Children...)
	} else {
		statements = append(statements, continued)
	}
	return factory.NewSyntaxList(statements)
}

func (tx *transformer) lowerKvsFor(producer *ast.KvsForExpression, continuation func(*ast.Expression) *ast.Node) *ast.Node {
	factory := tx.Factory()
	carrier := factory.NewTempVariable()
	carrierDeclaration := factory.NewVariableDeclaration(carrier, nil, nil, nil)
	carrierStatement := factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(
		factory.NewNodeList([]*ast.Node{carrierDeclaration}), ast.NodeFlagsNone,
	))

	resultList := tx.Visitor().VisitNode(producer.Result)
	resultStatement := factory.NewVariableStatement(nil, resultList)
	body := tx.Visitor().VisitNode(producer.Statement)
	blockStatements := []*ast.Node{resultStatement}

	var loop *ast.Node
	if producer.Expression != nil {
		nullableSource := !producer.ForIn && tx.resolver.IsKvsNullableIterableSource(producer.Expression)
		source := tx.Visitor().VisitNode(producer.Expression)
		if producer.Flags&ast.NodeFlagsKvsImplicitSubject != 0 && containsImplicitSubjectReference(producer.Expression) {
			sourceTemp := factory.NewTempVariable()
			sourceDeclaration := factory.NewVariableDeclaration(sourceTemp, nil, nil, source)
			blockStatements = append(blockStatements, factory.NewVariableStatement(nil, factory.NewVariableDeclarationList(
				factory.NewNodeList([]*ast.Node{sourceDeclaration}), ast.NodeFlagsConst,
			)))
			source = sourceTemp
		}
		if nullableSource {
			source = factory.NewBinaryExpression(nil, source, nil, factory.NewToken(ast.KindQuestionQuestionToken), factory.NewArrayLiteralExpression(nil, false))
		}
		kind := ast.KindForOfStatement
		if producer.ForIn {
			kind = ast.KindForInStatement
		}
		loop = factory.NewForInOrOfStatement(
			kind,
			nil,
			tx.transformIterationInitializer(producer.Initializer, producer.Flags&ast.NodeFlagsKvsImplicitSubject != 0),
			source,
			body,
		)
	} else {
		loop = factory.NewForStatement(
			tx.Visitor().VisitNode(producer.Initializer),
			tx.Visitor().VisitNode(producer.Condition),
			tx.Visitor().VisitNode(producer.Incrementor),
			body,
		)
	}
	blockStatements = append(blockStatements, loop)

	declarations := producer.Result.AsVariableDeclarationList().Declarations.Nodes
	var value *ast.Node
	if producer.TupleResult {
		elements := make([]*ast.Node, 0, len(declarations))
		for _, declaration := range declarations {
			elements = append(elements, factory.NewIdentifier(declaration.Name().Text()))
		}
		value = factory.NewArrayLiteralExpression(factory.NewNodeList(elements), false)
	} else if producer.ObjectResult {
		properties := make([]*ast.Node, 0, len(declarations))
		for _, declaration := range declarations {
			name := factory.NewIdentifier(declaration.Name().Text())
			properties = append(properties, factory.NewShorthandPropertyAssignment(nil, name, nil, nil, nil, nil))
		}
		value = factory.NewObjectLiteralExpression(factory.NewNodeList(properties), false)
	} else {
		value = factory.NewIdentifier(declarations[0].Name().Text())
	}
	blockStatements = append(blockStatements, factory.NewExpressionStatement(factory.NewAssignmentExpression(carrier, value)))
	block := factory.NewBlock(factory.NewNodeList(blockStatements), true)

	continued := continuation(carrier)
	statements := []*ast.Node{carrierStatement, block}
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
		if node == nil || ast.IsFunctionLike(node) || node.Kind == ast.KindKvsCollectExpression || node.Kind == ast.KindKvsLazyCollectExpression || node.Kind == ast.KindKvsSelectExpression {
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
	if tx.lazyProducer {
		yieldValue := func(value *ast.Expression) *ast.Node {
			return factory.NewExpressionStatement(factory.NewYieldExpression(nil, value))
		}
		if !extant {
			return yieldValue(value)
		}
		temp := factory.NewTempVariable()
		tx.producerTemporaries = append(tx.producerTemporaries, temp)
		condition := factory.NewBinaryExpression(nil, factory.NewAssignmentExpression(temp, value), nil, factory.NewToken(ast.KindExclamationEqualsToken), factory.NewKeywordExpression(ast.KindNullKeyword))
		return factory.NewIfStatement(condition, yieldValue(temp), nil)
	}
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
	tx.declareTemp(temp)
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
