# Failure Policy

Handling a failed operation often requires moving a variable declaration outside a `try` block and
putting the recovery in a separate `catch`. KVS provides expression-level forms for common recovery
decisions, so the operation and its handling can stay together:

```kvs
const config = JSON.parse(text) ~ SyntaxError;
```

Here a syntax error becomes absence. KVS adds local failure policies without checked exceptions or a
`Result<T, E>` carrier: unmatched exceptions continue to propagate. Use catch-and-split when the
reason matters, or `~~` to require a value while preserving an underlying cause.

## Catch and split: `const value~error = expression`

```kvs
const value~error = operation();
```

This catches an exception from the right-hand expression and separates its outcome:

| Operation outcome | `value` | `error`               |
| ----------------- | ------- | --------------------- |
| value             | value   | null                  |
| plain null        | null    | null                  |
| thrown value      | null    | original thrown value |

The error binding has type `unknown?` because JavaScript permits throwing arbitrary values. KVS
preserves the caught value exactly and does not wrap or normalize non-`Error` throws.

The value binding is nullable because an exception leaves it absent. The pair supports both
declaration and assignment:

```kvs
let value~error = firstAttempt();
value~error = retry();
```

It works identically with asynchronous operations:

```kvs
const invoice~error = await create_invoice(id);

await Audit.invoice_failure?(id, error)

if (error != null) {
    throw error;
}

return invoice
```

The `?` permits the audit call to be skipped when `error` is absent.

The compiler should warn when a captured error binding is unused.

## Demoting outcomes to null: `~`

`~` converts a selected returned value or exception into plain null:

```kvs
const number = parseInt(text) ~ NaN;
const config = JSON.parse(text) ~ SyntaxError;
const index = items.findIndex(test) ~ -1;
```

The rule is:

> If the expression returns a value matching the pattern, or throws an exception matching the
> exception pattern, produce null. Other returned values remain values; other exceptions propagate.

This unifies two common JavaScript conventions:

- sentinel results such as `NaN` or `-1`;
- exceptions such as `SyntaxError` from `JSON.parse`.

The static type of the pattern determines which outcome it matches. An `Error` constructor matches a
thrown instance of that constructor, including subclasses, using JavaScript `instanceof`. Every
other pattern matches only a normally returned value, using `Object.is`. Thus `NaN` works without a
special case, object sentinels use identity, and `0` and `-0` remain distinct.

A value pattern is evaluated only after the left expression returns; an error-constructor pattern
only after it throws. A pattern is not evaluated for an outcome it cannot match. Unmatched returned
values remain values, and unmatched thrown values propagate unchanged.

`~` is left-associative, so policies compose without pattern-list syntax:

```kvs
const result = operation() ~ NaN ~ MathError;
```

This means `(operation() ~ NaN) ~ MathError`. Consequently the outer policy also sees a matching
error thrown while evaluating the complete inner operation.

## Infix promotion of absence or failure

Infix `~~` requires an extant value:

```kvs
const user = find_user(id) ~~ UserNotFound(id);
```

| Outcome of the left expression | Behavior                                                               |
| ------------------------------ | ---------------------------------------------------------------------- |
| value                          | produce the value                                                      |
| null or undefined              | throw the supplied exception                                           |
| thrown value                   | throw the supplied replacement error with the thrown value as `.cause` |

The result type is the left expression's non-nullable type. Code after `~~` therefore uses the
promoted value directly, without another presence check.

An absent result throws the replacement error without a cause. A non-null caught value is installed
automatically as the replacement error's `.cause`:

```kvs
const config = parse_config(text)
    ~~ InvalidConfiguration("Unable to parse configuration");
```

If the replacement already has a `cause` property, that explicit cause wins:

```kvs
const config = parse_config(text)
    ~~ new Error("Unable to parse configuration", { cause: upstreamError });
```

The replacement expression must produce an `Error` and is evaluated only after absence or a thrown
value. KVS does not preserve a distinction between returned absence and `throw null` or `throw
undefined`, so those unusual throws do not acquire an automatic cause.

This operation currently lowers only at the head of a statement-owned value path: a single
declaration initializer, assignment right-hand side, return or KVS yield, or object property
initializer. Member and call continuations along the first-evaluated path are supported. Placement
in a call argument, array element, conditional branch, or other nested expression is rejected
because the protected operation lowers directly to statements, without an IIFE or happy-path
closure.

This infix failure-policy operation is distinct from [prefix `~~value`](values.md#sieve), which
converts absence, `NaN`, empty strings, and empty collections to null and does not catch exceptions.

The two forms are complementary:

```kvs
expression ~ pattern // selected returned value/error -> null
expression ~~ error  // absence/any error -> propagating error
```

## Deliberate omissions

The current proposal does not include:

- expression-level `try`;
- a visible `Fallible<T>` carrier;
- `~result` side-channel access;
- special return forwarding;
- transparent propagation of captured errors into derived values.

The direct binding form handles local inspection without introducing another value category.

---

[← Calls, composition, and callbacks](calls.md) · [Contents](README.md#reading-guide) ·
[Next: Lightweight type-system additions →](types.md)
