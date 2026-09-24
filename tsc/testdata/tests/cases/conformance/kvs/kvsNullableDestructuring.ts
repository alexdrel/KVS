// @strict: true
// @target: es2020

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
