package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestKvsErasedDomainsLanguageService(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `interface User { name: string }
declare function rename(user: User, name: string): User;

type /*studentType*/Student = distinct User;
type /*userIdType*/UserId = branded string;

declare const student: Student;
declare const rawId: string;

const /*renamed*/renamed = rename(student, "Ada");
const /*branded*/branded = rawId as UserId;`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyQuickInfoAt(t, "studentType", "type Student = distinct User", "")
	f.VerifyQuickInfoAt(t, "userIdType", "type UserId = branded string", "")
	f.VerifyQuickInfoAt(t, "renamed", "const renamed: Student", "")
	f.VerifyQuickInfoAt(t, "branded", "const branded: UserId", "")
}
