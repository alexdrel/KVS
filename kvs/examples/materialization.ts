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

let published = new Map<string, Release>().get("winter");

// All three operations are abandoned, so their defaults are never stored.
published?.title = "Winter";
published!.tags!.push?(null as string?);
published!.title ?= null as string?;

console.log(published); // undefined
