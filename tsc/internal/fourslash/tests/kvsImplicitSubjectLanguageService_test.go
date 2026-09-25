package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestKvsImplicitSubjectLanguageService(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `const histo: number?[] = [7, null, 18];

for (/*source*/histo) {
    console.log(/*coordinate*/#, /*subject*/_!);
}

interface Order {
    amount: number;
    paid: boolean;
}
declare const orders: Order[];

const summary = for (/*ordersSource*/orders; {count = 0, revenue = 0}) {
    if (!/*orderSubject*/_.paid) continue;
    count++;
    revenue += _.amount;
};`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyBaselineDocumentHighlights(t, nil /*preferences*/, "source")
	f.VerifyBaselineDocumentHighlights(t, nil /*preferences*/, "ordersSource")
	f.VerifyQuickInfoAt(t, "subject", "const _: number | null | undefined", "")
	f.VerifyQuickInfoAt(t, "coordinate", "#: number", "")
	f.VerifyQuickInfoAt(t, "orderSubject", "const _: Order", "")
}
