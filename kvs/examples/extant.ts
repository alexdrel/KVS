// Extant return: return the value when present, otherwise continue.
function resolve(arg?: string): string {
    return? arg;
    return "fallback";
}

interface MissionPatch {
    callSign?: string;
    retryCount?: number;
}

// Extant assignment: assign only a present right-hand value.
const mission = {
    callSign: "Odyssey",
    retryCount: 3,
};

function applyMissionPatch(patch: MissionPatch) {
    mission.callSign ?= patch.callSign;
    mission.retryCount ?= patch.retryCount;
}

applyMissionPatch({ retryCount: 0 });
console.log(mission);

// Inferred binding suffixes: nullable `let?` and required `const!` / `let!`.
let destination? = "Earth orbit";
destination = null;

const launchSite! = "Baikonur";
let activeDestination! = "Moon orbit";

// Static nullability assertions: locally remove or add absence.
const possibleFlightHours: number | null = 6;
const missionDuration = possibleFlightHours as! + 2;

const possibleDestinations = [destination, activeDestination as?];
console.log(launchSite, missionDuration, possibleDestinations);

// An explicit nullish comparison tests presence and narrows the successful branch.
function announceLaunchWindow(launchWindow: string | number | undefined) {
    if (launchWindow != null) {
        const displayWindow = typeof launchWindow === "string"
            ? launchWindow.toUpperCase()
            : launchWindow.toFixed(1);
        console.log(displayWindow);
    }
}

announceLaunchWindow("night");

// Terminal defaults: replace absence using the value type's default.
function announceCrew(callSign: string | null, crew: readonly string[] | undefined) {
    const displayCallSign = callSign!;
    const assignedCrew = crew!;
    console.log(displayCallSign.toUpperCase(), assignedCrew.join(", "));
}

announceCrew(null, ["Mae", "Guion"]);
