package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestKvsPipelineLanguageService(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `interface Item { id: number; }
declare const items: Item[]?;
declare function combine(items: Item[], id: number): number;

const result = items |?>
    combine(/*pipeOuter*/%, [1].map(/*callbackInner*/% + 1)[0]) |>
    /*pipeRepeated*/% + 1;`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyQuickInfoAt(t, "pipeOuter", "(parameter) %: Item[]", "")
	f.VerifyQuickInfoAt(t, "callbackInner", "(parameter) %: number", "")
	f.VerifyQuickInfoAt(t, "pipeRepeated", "(parameter) %: number", "")
}
