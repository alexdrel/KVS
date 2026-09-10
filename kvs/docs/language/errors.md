# Failure Policy

Handling a failed operation often requires moving a variable declaration outside a `try` block and putting the recovery in a separate `catch`. KVS provides expression-level forms for common recovery decisions, so the operation and its handling can stay together:

```kvs
const config = JSON.parse(text) ~ SyntaxError;
```

Here a syntax error produces absence, which the following code can handle like any other missing value. Other exceptions propagate normally. For more involved recovery, ordinary `try`/`catch` remains available.

## Why ordinary exceptions?

KVS keeps the JavaScript exception model so that ordinary computations and library calls compose directly. Synchronous exceptions propagate normally, and exceptions from asynchronous operations reject their promises. Local error policy does not require a `Result<T, E>` carrier throughout the call chain.

Exceptions are not part of KVS's static function types, and callers are not required to declare or handle them. Documentation and tooling may describe expected exceptions, as they do for JavaScript APIs, but that information does not participate in type checking.

Demoting a selected failure with `~` means choosing absence as sufficient information for subsequent computation. When the reason matters, retain the exception or inspect it with a catch-and-split binding. `~~` establishes a boundary that requires a value and preserves an underlying thrown cause.

## Catch and split: `const value~error = expression`

```kvs
const value~error = operation();
```

This catches an exception from the right-hand expression and separates its outcome:

| Operation outcome | `value` | `error` |
| --- | --- | --- |
| value | value | null |
| plain null | null | null |
| thrown value | null | original thrown value |

The error binding has type `unknown?` because JavaScript permits throwing arbitrary values. KVS preserves the caught value exactly and does not wrap or normalize non-`Error` throws.

The value binding is nullable because an exception leaves it absent. Ordinary declaration and assignment forms apply to the pair:

```kvs
let value~error = firstAttempt();
value~error = retry();
```

It works identically with asynchronous operations:

```kvs
const invoice~error = await create_invoice(id);

await Audit.invoice_failure?(id, error)

if (error?) {
    throw error;
}

return invoice
```

The `?` explicitly permits the audit call to be skipped when `error` is absent. Forwarding uses ordinary `throw` and `return`; KVS has no special fallible return or forwarding rule.

The compiler should warn when a captured error binding is unused.

## Demoting outcomes to null: `~`

`~` converts a selected returned value or exception into plain null:

```kvs
const number = parseInt(text) ~ NaN;
const config = JSON.parse(text) ~ SyntaxError;
const index = items.findIndex(test) ~ -1;
```

The rule is:

> If the expression returns a value matching the pattern, or throws an exception matching the exception pattern, produce null. Other returned values remain values; other exceptions propagate.

This unifies two common JavaScript conventions:

- sentinel results such as `NaN` or `-1`;
- exceptions such as `SyntaxError` from `JSON.parse`.

Patterns use type-appropriate exact matching. Literals and distinguished constants match returned sentinel values. A distinguished constant may require an intrinsic runtime check: `NaN`, for example, behaves like a singleton or `as const` pattern even though JavaScript requires `Number.isNaN` to recognize it.

An error-type pattern matches a thrown instance of that type, including subclasses. Unmatched returned values remain values, and unmatched thrown values propagate unchanged. The transpiler's emitted checks are an implementation detail.

## Promoting absence or failure: `~~`

`~~` requires a usable value:

```kvs
const user = find_user(id) ~~ UserNotFound(id);
```

| Outcome of the left expression | Behavior |
| --- | --- |
| value | produce the value |
| null or undefined | throw the supplied exception |
| thrown value | throw the supplied replacement error with the thrown value as `.cause` |

An absent result throws the replacement error without a cause. A caught value is installed automatically as the replacement error's `.cause`; it may be any JavaScript value, including null or undefined:

```kvs
const config = parse_config(text)
    ~~ InvalidConfiguration("Unable to parse configuration");
```

If the error construction API supports an explicit cause, a supplied cause overrides automatic propagation. Explicit null therefore suppresses a caught cause:

```kvs
const config = parse_config(text)
    ~~ InvalidConfiguration("Unable to parse configuration", { cause: null });
```

The replacement expression is evaluated only after absence or a thrown value. KVS preserves whether it is handling absence or a catch even when the caught value itself is null.

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

The direct binding form handles local inspection, and ordinary `throw` handles forwarding, without introducing another value category.

---

[← Calls, composition, and callbacks](calls.md) · [Contents](README.md#reading-guide) · [Next: Lightweight type-system additions →](types.md)
