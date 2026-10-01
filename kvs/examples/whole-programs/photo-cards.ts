interface Metadata {
    width: number?;
    height: number?;
    background: string?;
}
interface Photo {
    caption: string?;
    metadata: Metadata?;
}
interface ImportedPhoto extends Photo {
    sourcePath: string;
}
interface Card {
    title: string;
    area: number;
    background: string;
}

class InvalidColor extends Error {}

function parseColor(color: string): string {
    if (!color.startsWith("#")) throw new InvalidColor(color);
    return color;
}

function buildCards(photos: ImportedPhoto[]?): Card[] {
    const cards = collect (photos) {
        const photo = Photo{ ..._ }; // sourcePath is not copied
        const area = (photo.metadata.width * photo.metadata.height)!;
        if (area < 100) continue;

        const background = (parseColor?(photo.metadata.background) ~ InvalidColor)!;
        yield Card{ title: photo.caption!, area, background };
    };
    return cards!;
}

const photos: ImportedPhoto[] = [
    { sourcePath: "large.jpg", caption: "Garden", metadata: { width: 20, height: 10, background: "#fff" } },
    { sourcePath: "small.jpg", caption: "Icon", metadata: { width: 2, height: 2, background: null } },
    { sourcePath: "invalid.jpg", caption: null, metadata: { width: 20, height: 10, background: "red" } },
];
console.log(JSON.stringify(buildCards(photos)));
// [{"title":"Garden","area":200,"background":"#fff"},{"title":"","area":200,"background":""}]
console.log(JSON.stringify(buildCards(null))); // []
