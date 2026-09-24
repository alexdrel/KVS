interface Release {
    title: string;
    tags: string[]?;
}

let drafts: Release[]? = null;

// This release is required, so create the missing array and indexed draft.
drafts![0]!.title = "Autumn";

// The method call likewise creates and stores the missing tag array.
drafts[0].tags!.push("preview");

console.log(drafts[0]); // { title: 'Autumn', tags: [ 'preview' ] }

const published = new Map<string, Release>().get("winter");

// An absent published release should stay absent.
published?.title = "Winter";

console.log(published); // undefined
