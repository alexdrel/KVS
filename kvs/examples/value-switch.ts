type Delivery = "pickup" | "bike" | "van" | "express";

function shippingPrice(delivery: Delivery, subtotal: number): number {
    return switch (delivery) {
        case "pickup": 0;
        case "bike" | "van": subtotal >= 100 ? 0 : 8;
        case "express": {
            const surcharge = subtotal < 50 ? 5 : 0;
            yield 15 + surcharge;
        }
    }!;
}

function deliveryWindow(distanceKm: number): string {
    return switch {
        case distanceKm <= 2: "today";
        case distanceKm <= 20: "tomorrow";
        default: "this week";
    }!;
}

function parcelSize(width: number, height: number, depth: number): string {
    return switch (const volume = width * height * depth) {
        case volume < 1_000: "small";
        case volume < 10_000: "medium";
        default: "large";
    }!;
}

console.log("pickup:", shippingPrice("pickup", 40)); // pickup: 0
console.log("van:", shippingPrice("van", 120)); // van: 0
console.log("express:", shippingPrice("express", 40)); // express: 20
console.log("window:", deliveryWindow(12)); // window: tomorrow
console.log("parcel:", parcelSize(20, 20, 10)); // parcel: medium
