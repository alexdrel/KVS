package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestKvsContextLanguageService(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `context /*declaration*/RequestId: string = "none";
context /*nullableDeclaration*/CurrentUser: string?;

context function read() {
    return /*read*/RequestId;
}

context function readCurrentUser() {
    return /*nullableRead*/CurrentUser;
}

type /*callable*/Handler = context (value: string) => string;

class Service {
    context /*method*/run(value: string) {
        return RequestId + value;
    }
}

context function use(service: Service) {
    return service./*methodCall*/run("x");
}

function entry(id: string) {
    context (/*binding*/RequestId = id) {
        read();
    }
}`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyQuickInfoAt(t, "read", "context RequestId: string", "")
	f.VerifyQuickInfoAt(t, "nullableDeclaration", "context CurrentUser: string?", "")
	f.VerifyQuickInfoAt(t, "nullableRead", "context CurrentUser: string?", "")
	f.VerifyQuickInfoAt(t, "callable", "type Handler = context (value: string) => string", "")
	f.VerifyBaselineGoToDefinition(t, true, "read", "binding")
	f.VerifyBaselineGoToDefinition(t, true, "method", "methodCall")
}
