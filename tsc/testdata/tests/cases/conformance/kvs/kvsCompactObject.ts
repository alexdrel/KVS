// @strict: true
// @target: es2020

declare const title: string?;
declare const count: number?;
declare const fixed: false;
declare const nullableOverrides: {
    color: string?;
    retries: number;
}?;

const options = ?{
    title,
    count,
    fixed,
    label: title,
    ...nullableOverrides,
};

const nested = ?{ options, child: ?{ title } };

