function buildArgs(
    watch: boolean,
    output: string?,
    extra: (string?)[]?,
) {
    return ?[
        "build",
        watch === true ?: "--watch",
        output != null ?: `--out=${output}`,
        ...extra,
    ];
}

console.log(buildArgs(false, null, null));
// ["build"]

console.log(buildArgs(true, "dist", ["--minify", null, "--verbose"]));
// ["build", "--watch", "--out=dist", "--minify", "--verbose"]
