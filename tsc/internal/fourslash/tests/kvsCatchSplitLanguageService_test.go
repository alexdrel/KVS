package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestKvsCatchSplitLanguageService(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `async function loadLabel(): Promise<string> {
    throw "offline";
}

async function reportLabel() {
    const label~/*errorBinding*/labelError = await loadLabel();
    console.log(label, labelError);
}`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyBaselineDocumentHighlights(t, nil /*preferences*/, "errorBinding")
}
