interface WeatherStation {
    name: string;
    active: boolean;
    readings: number[];
}

const stations: WeatherStation[] = [
    { name: "roof", active: true, readings: [18.2, 19.7, 21.1] },
    { name: "garage", active: false, readings: [16.4, 16.8] },
    { name: "garden", active: true, readings: [17.9, 20.3] },
];

// `%` is the callback value. A property projection needs no named parameter.
const stationNames = stations.map(%.name);
console.log(stationNames.join(", "));
// roof, garage, garden

// The same shorthand makes a predicate read directly.
const activeStations = stations.filter(%.active);
console.log(activeStations.map(%.name).join(", "));
// roof, garden

// `%` can participate directly in operators.
const warmReadings = stations[0].readings.filter(% >= 20);
console.log(warmReadings.join(", "));
// 21.1

// More elaborate callbacks can use the same value more than once.
// Repeated `%` occurrences share one station. The nested `map` callback
// gets its own `%`, so Math.round receives each reading rather than a station.
const report = activeStations.map({
    station: %.name,
    rounded: %.readings.map(Math.round(%)),
    spread: Math.round(Math.max(...%.readings) - Math.min(...%.readings)),
});

console.log(JSON.stringify(report, null, 2));
// [
//   {
//     "station": "roof",
//     "rounded": [
//       18,
//       20,
//       21
//     ],
//     "spread": 3
//   },
//   {
//     "station": "garden",
//     "rounded": [
//       18,
//       20
//     ],
//     "spread": 2
//   }
// ]
