package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestKvsExplicitTypeHover(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `declare function maybeQuery(): string?;

interface Receiver {
    /*property*/channels: number?[];
}

function requestOptions(/*parameter*/query: string?) {
    const /*explicit*/copy: string? = query;
    const /*inferred*/inferred = maybeQuery();
    return ?{ query };
}

const options = requestOptions("compiler");
options./*compactProperty*/query;`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyQuickInfoAt(t, "parameter", "(parameter) query: string?", "")
	f.VerifyQuickInfoAt(t, "property", "(property) Receiver.channels: number?[]", "")
	f.VerifyQuickInfoAt(t, "explicit", "const copy: string?", "")
	f.VerifyQuickInfoAt(t, "inferred", "const inferred: string | null | undefined", "")
	f.VerifyQuickInfoAt(t, "compactProperty", "(property) query?: string", "")
}
