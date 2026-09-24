//// [tests/cases/conformance/kvs/kvsNullableDestructuring.ts] ////

//// [kvsNullableDestructuring.ts]
interface Metadata {
    label: string;
}

interface Card {
    id: string;
    metadata: Metadata?;
    tags: string[];
}

declare const card: Card?;
declare const presentCard: Card;
declare const tuple: [string, number]?;

const { id, metadata } = card;
const { metadata: { label } } = card;
const { metadata: { label: nestedNullableLabel } } = presentCard;
const { id: idWithDefault = "missing" } = card;
const { id: renamed, ...rest } = card;
const [firstTag, ...remainingTags] = card.tags;
const { tags: [nestedFirstTag, ...nestedRemainingTags] } = card;
const [tupleName, tupleCount] = tuple;
const {} = card;
const [] = tuple;
const { metadata: {} } = presentCard;

function rejectNullableParameter({ id }: Card?) {
    return id;
}

function rejectNestedNullableParameter({ metadata: { label } }: Card) {
    return label;
}

function acceptNullableLeaf({ metadata }: Card) {
    return metadata;
}


//// [kvsNullableDestructuring.js]
"use strict";
const { id, metadata } = card ?? {};
const { metadata: _a } = card ?? {}, { label } = _a ?? {};
const { metadata: _b } = presentCard, { label: nestedNullableLabel } = _b ?? {};
const { id: idWithDefault = "missing" } = card ?? {};
const { id: renamed, ...rest } = card ?? {};
const [firstTag, ...remainingTags] = card?.tags ?? [];
const { tags: _c } = card ?? {}, [nestedFirstTag, ...nestedRemainingTags] = _c ?? [];
const [tupleName, tupleCount] = tuple ?? [];
const {} = card ?? {};
const [] = tuple ?? [];
const { metadata: _d } = presentCard, {} = _d ?? {};
function rejectNullableParameter({ id }) {
    return id;
}
function rejectNestedNullableParameter({ metadata: { label } }) {
    return label;
}
function acceptNullableLeaf({ metadata }) {
    return metadata;
}
