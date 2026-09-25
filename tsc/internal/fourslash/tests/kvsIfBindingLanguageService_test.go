package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestKvsIfBindingLanguageService(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `declare function realRoots(a: number, b: number, c: number): number[];
declare const eq: { a: number; b: number; c: number };

if (const roots ~= realRoots(eq.a, eq.b, eq/*property*/.c)) {
    console.log(roots);
}`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyBaselineDocumentHighlights(t, nil /*preferences*/, "property")
}
