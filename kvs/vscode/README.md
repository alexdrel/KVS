# KVS syntax highlighting for VS Code

This small extension supplements VS Code's TypeScript grammar with KVS punctuation that the stock
grammar otherwise mistakes for ordinary TypeScript syntax. It currently recognizes nullable
primitive types, presence assertions (`as?` and `as!`), extant assignment (`?=`), optional
invocation (`?(`), extant production (`return?` and `yield?`), compact array and object prefixes
(`?[` and `?{`), pipelines (`|>`, `|?>`, and `|%>`), and the canonically spaced nulling operator
(`?:`). It also restores `const`/`let` bindings, keyword, and numeric scopes inside producer forms
and KVS `if`/`switch` declaration headers that the stock grammar cannot parse structurally.

The extension provides syntax highlighting only. The TypeScript 7 extension and local KVS compiler
remain responsible for diagnostics, formatting, hover, navigation, and other language features.

## Install

From the repository root:

```sh
cd kvs/vscode
../../node_modules/.bin/vsce package --no-dependencies --skip-license --out kvs-syntax-preview.vsix
code --install-extension kvs-syntax-preview.vsix --force
```

Reload the VS Code window after installation. Re-run both commands after changing the grammar;
`--force` replaces the previously installed local build.

## Uninstall

```sh
code --uninstall-extension kvs-local.kvs-syntax-preview
```
