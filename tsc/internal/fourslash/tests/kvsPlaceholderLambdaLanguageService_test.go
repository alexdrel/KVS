package fourslash_test

import (
	"testing"

	"github.com/microsoft/TypeScript/tsc/internal/fourslash"
	"github.com/microsoft/TypeScript/tsc/internal/testutil"
)

func TestKvsPlaceholderLambdaLanguageService(t *testing.T) {
	t.Parallel()
	defer testutil.RecoverAndFail(t, "Panic on fourslash test")
	const content = `interface WeatherStation {
    name: string;
    active: boolean;
    readings: number[];
}

declare const stations: WeatherStation[];

const stationNames = stations.map(/*initializer*/%.name);
const activeStations = stations.filter(%.active);
console.log(activeStations.map(/*nested*/%.name).join(", "));

const report = activeStations.map({
    station: /*outerFirst*/%.name,
    active: /*outerRepeated*/%.active,
    readings: %.readings.map(Math.round(/*inner*/%)),
});`
	f, done := fourslash.NewFourslash(t, nil /*capabilities*/, content)
	defer done()
	f.VerifyQuickInfoAt(t, "initializer", "(parameter) %: WeatherStation", "")
	f.VerifyQuickInfoAt(t, "nested", "(parameter) %: WeatherStation", "")
	f.VerifyQuickInfoAt(t, "outerFirst", "(parameter) %: WeatherStation", "")
	f.VerifyQuickInfoAt(t, "outerRepeated", "(parameter) %: WeatherStation", "")
	f.VerifyQuickInfoAt(t, "inner", "(parameter) %: number", "")
}
