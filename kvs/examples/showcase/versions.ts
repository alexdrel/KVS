/// <reference types="node" />
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

interface Manifest {
    name: string?;
    displayName: string?;
    version: string?;
}

type Path = distinct string;

interface VersionFile extends Manifest {
    path: Path;
    system: "Deno" | "Node";
}

// Lazy recursive discovery.
function manifests(dir: Path): Iterable<Path> {
    return collect* (readdirSync(dir, { withFileTypes: true })) {
        if (_.name == ".git" | "node_modules") continue;

        const path = join(dir, _.name);

        if (_.isFile() && _.name == "package.json" | "deno.json") {
            yield path;
        } else if (_.isDirectory()) {
            for (manifests(path)) yield _;
        }
    };
}

// A manifest without a version contributes no version file
function readVersionFile(path: Path): VersionFile? {
    const manifest = JSON.parse(readFileSync(path, "utf8")) as Manifest;
    return manifest?.version ?: VersionFile{
        path,
        system: path.endsWith("deno.json") ? "Deno" : "Node",
        ...manifest
    };
}

// Nullable results disappear without a separate filtering pass.
function findVersionFiles(root: Path) {
    return (
        collect (manifests(root)) yield? readVersionFile(_);
    ) |> %.sort((a, b) => a.path.localeCompare(b.path));
}

function formatVersionFile(file: VersionFile) {
    const folder = relative(".", dirname(file.path)) || ".";
    return `${folder} [${file.system}]: ${file.displayName ?? file.name ?? "(unnamed)"} ${file.version!}`;
}

function checkVersions(files: VersionFile[]): boolean {
    const versions = new Set(files.map(%.version));

    if (versions.size === 1) {
        for (files) console.log(formatVersionFile(_));
        console.log(`All ${files.length} versions match.`);
        return true;
    }

    for (const version of versions) {
        console.error(`Version ${version!} found in:`);
        for (files) {
            if (_.version == version!) console.error("   " + formatVersionFile(_));
        }
    }
    return false;
}

const root: Path = process.argv[2] ?? ".";

if (const files ~= findVersionFiles(root)) {
    process.exitCode = checkVersions(files) ? 0 : 1;
} else {
    console.error("No versioned package.json or deno.json files found.");
}
