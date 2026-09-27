package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestKvsRecordTypeShorthandLanguageService(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `interface User {
    name: string;
}

type /*users*/Users = { /*asterisk*/*: /*value*/User };
declare const users: Users;
const /*indexed*/user = users["ada"];
`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyQuickInfoAt(t, "value", "interface User", "")
	f.VerifyQuickInfoAt(t, "users", "type Users = { *: User; }", "")
	f.VerifyQuickInfoAt(t, "indexed", "const user: User", "")
	f.GoToMarker(t, "asterisk")
	f.VerifyNotQuickInfoExists(t)
}
