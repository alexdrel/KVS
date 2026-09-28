package format_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/ast"
	"github.com/microsoft/TypeScript/tsc/internal/core"
	"github.com/microsoft/TypeScript/tsc/internal/format"
	"github.com/microsoft/TypeScript/tsc/internal/ls/lsutil"
	"github.com/microsoft/TypeScript/tsc/internal/parser"
	"github.com/microsoft/TypeScript/tsc/internal/printer"
	"github.com/microsoft/TypeScript/tsc/internal/repo"
	"github.com/microsoft/TypeScript/tsc/internal/tspath"
	"gotest.tools/v3/assert"
)

func applyBulkEdits(text string, edits []core.TextChange) string {
	b := strings.Builder{}
	b.Grow(len(text))
	lastEnd := 0
	for _, e := range edits {
		start := e.TextRange.Pos()
		if start != lastEnd {
			b.WriteString(text[lastEnd:e.TextRange.Pos()])
		}
		b.WriteString(e.NewText)

		lastEnd = e.TextRange.End()
	}
	b.WriteString(text[lastEnd:])

	return b.String()
}

func TestFormat(t *testing.T) {
	t.Parallel()

	t.Run("format checker.ts", func(t *testing.T) {
		t.Parallel()
		ctx := format.WithFormatCodeSettings(t.Context(), lsutil.FormatCodeSettings{
			TabSize:                         4,
			IndentSize:                      4,
			BaseIndentSize:                  4,
			NewLineCharacter:                "\n",
			ConvertTabsToSpaces:             core.TSTrue,
			IndentStyle:                     lsutil.IndentStyleSmart,
			TrimTrailingWhitespace:          core.TSTrue,
			InsertSpaceBeforeTypeAnnotation: core.TSTrue,
		}, "\n")
		filePath := filepath.Join(repo.TestDataPath(), "fixtures/compiler/checker.ts")
		fileContent, err := os.ReadFile(filePath)
		assert.NilError(t, err)
		text := string(fileContent)
		sourceFile := parser.ParseSourceFile(ast.SourceFileParseOptions{
			FileName: "/checker.ts",
			Path:     "/checker.ts",
		}, text, core.ScriptKindTS)
		edits := format.FormatDocument(ctx, sourceFile)
		newText := applyBulkEdits(text, edits)
		assert.Assert(t, len(newText) > 0)
		assert.Assert(t, text != newText)
	})
}

func TestFormatKvsPlaceholderLambda(t *testing.T) {
	t.Parallel()

	ctx := format.WithFormatCodeSettings(t.Context(), lsutil.GetDefaultFormatCodeSettings(), "\n")
	text := "const link = \"docs\"\n    |>    aliases.get(  % )   |?>\n    encodeURI   |%>   console.log;\n"
	sourceFile := parser.ParseSourceFile(ast.SourceFileParseOptions{
		FileName: "/pipeline.ts",
		Path:     "/pipeline.ts",
	}, text, core.ScriptKindTS)

	edits := format.FormatDocument(ctx, sourceFile)
	assert.Equal(t, applyBulkEdits(text, edits), "const link = \"docs\"\n    |> aliases.get(%) |?>\n    encodeURI |%> console.log;\n")
}

func TestFormatKvsRecordTypeShorthand(t *testing.T) {
	t.Parallel()

	ctx := format.WithFormatCodeSettings(t.Context(), lsutil.GetDefaultFormatCodeSettings(), "\n")
	text := "type Users={readonly   * :User;version : number};\n"
	sourceFile := parser.ParseSourceFile(ast.SourceFileParseOptions{
		FileName: "/record.ts",
		Path:     "/record.ts",
	}, text, core.ScriptKindTS)

	edits := format.FormatDocument(ctx, sourceFile)
	assert.Equal(t, applyBulkEdits(text, edits), "type Users = { readonly *: User; version: number };\n")
}

func TestFormatKvsErasedDomains(t *testing.T) {
	t.Parallel()

	ctx := format.WithFormatCodeSettings(t.Context(), lsutil.GetDefaultFormatCodeSettings(), "\n")
	text := "type Pixel=distinct   number;type UserId=branded   string;\n"
	sourceFile := parser.ParseSourceFile(ast.SourceFileParseOptions{
		FileName: "/domains.ts",
		Path:     "/domains.ts",
	}, text, core.ScriptKindTS)

	edits := format.FormatDocument(ctx, sourceFile)
	assert.Equal(t, applyBulkEdits(text, edits), "type Pixel = distinct number; type UserId = branded string;\n")
}

func TestFormatKvsAllInOne(t *testing.T) {
	t.Parallel()

	fixturePath := filepath.Join(repo.TestDataPath(), "fixtures/kvs")
	input, err := os.ReadFile(filepath.Join(fixturePath, "format-all-in-one.input.ts"))
	assert.NilError(t, err)
	expected, err := os.ReadFile(filepath.Join(fixturePath, "format-all-in-one.expected.ts"))
	assert.NilError(t, err)
	text := string(input)
	ctx := format.WithFormatCodeSettings(t.Context(), lsutil.GetDefaultFormatCodeSettings(), "\n")
	parse := func(text string) *ast.SourceFile {
		return parser.ParseSourceFile(ast.SourceFileParseOptions{
			FileName: "/format-all-in-one.ts",
			Path:     "/format-all-in-one.ts",
		}, text, core.ScriptKindTS)
	}

	formatted := applyBulkEdits(text, format.FormatDocument(ctx, parse(text)))
	assert.Equal(t, formatted, string(expected))
	assert.DeepEqual(t, format.FormatDocument(ctx, parse(formatted)), []core.TextChange(nil))
}

func TestFormatKvsExamples(t *testing.T) {
	t.Parallel()

	examplesPath := filepath.Join(repo.RootPath(), "..", "kvs", "examples")
	patterns := []string{
		filepath.Join(examplesPath, "*.ts"),
		filepath.Join(examplesPath, "showcase", "*.ts"),
	}
	var files []string
	for _, pattern := range patterns {
		matches, err := filepath.Glob(pattern)
		assert.NilError(t, err)
		files = append(files, matches...)
	}
	ctx := format.WithFormatCodeSettings(t.Context(), lsutil.GetDefaultFormatCodeSettings(), "\n")
	for _, filePath := range files {
		t.Run(filepath.Base(filePath), func(t *testing.T) {
			t.Parallel()

			textBytes, err := os.ReadFile(filePath)
			assert.NilError(t, err)
			text := string(textBytes)
			fileName := tspath.NormalizePath(filePath)
			parse := func(text string) *ast.SourceFile {
				return parser.ParseSourceFile(ast.SourceFileParseOptions{
					FileName: fileName,
					Path:     tspath.Path(fileName),
				}, text, core.ScriptKindTS)
			}

			formatted := applyBulkEdits(text, format.FormatDocument(ctx, parse(text)))
			assert.DeepEqual(t, format.FormatDocument(ctx, parse(formatted)), []core.TextChange(nil))
		})
	}
}

func BenchmarkFormat(b *testing.B) {
	ctx := format.WithFormatCodeSettings(b.Context(), lsutil.FormatCodeSettings{
		TabSize:                         4,
		IndentSize:                      4,
		BaseIndentSize:                  4,
		NewLineCharacter:                "\n",
		ConvertTabsToSpaces:             core.TSTrue,
		IndentStyle:                     lsutil.IndentStyleSmart,
		TrimTrailingWhitespace:          core.TSTrue,
		InsertSpaceBeforeTypeAnnotation: core.TSTrue,
	}, "\n")
	filePath := filepath.Join(repo.TestDataPath(), "fixtures/compiler/checker.ts")
	fileContent, err := os.ReadFile(filePath)
	assert.NilError(b, err)
	text := string(fileContent)
	sourceFile := parser.ParseSourceFile(ast.SourceFileParseOptions{
		FileName: "/checker.ts",
		Path:     "/checker.ts",
	}, text, core.ScriptKindTS)

	b.Run("format checker.ts", func(b *testing.B) {
		for b.Loop() {
			edits := format.FormatDocument(ctx, sourceFile)
			newText := applyBulkEdits(text, edits)
			assert.Assert(b, len(newText) > 0)
		}
	})

	b.Run("format checker.ts (no edit application)", func(b *testing.B) { // for comparison (how long does applying many edits take?)
		for b.Loop() {
			edits := format.FormatDocument(ctx, sourceFile)
			assert.Assert(b, len(edits) > 0)
		}
	})

	p := printer.NewPrinter(printer.PrinterOptions{}, printer.PrintHandlers{}, printer.NewEmitContext())
	b.Run("pretty print checker.ts", func(b *testing.B) { // for comparison
		for b.Loop() {
			newText := p.EmitSourceFile(sourceFile)
			assert.Assert(b, len(newText) > 0)
		}
	})
}
