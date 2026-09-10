function resolve(arg?: string): string {
    return? arg;
    return "fallback";
}

interface MissionPatch {
    callSign?: string;
    retryCount?: number;
}

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

let destination? = "Earth orbit";
destination = null;

const launchSite! = "Baikonur";
let activeDestination! = "Moon orbit";

const possibleFlightHours: number | null = 6;
const missionDuration = possibleFlightHours as! + 2;

const possibleDestinations = [destination, activeDestination as?];
console.log(launchSite, missionDuration, possibleDestinations);
