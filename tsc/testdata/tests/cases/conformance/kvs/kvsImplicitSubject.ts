// @strict: true

interface Group {
    name: string;
    values: (number | null)[];
}

function visitGroups(groups: Group[]) {
    const names: string[] = [];
    for (groups) {
        names.push(_.name);
    }
    return names;
}

function collectNames(groups: Group[]) {
    return collect (groups) {
        yield _.name;
    };
}

function selectValue(groups: Group[]) {
    return select (groups) {
        for (const value of _.values) {
            yield? value;
        }
    };
}

function nestedSubjects(groups: Group[]) {
    return collect (groups) {
        const groupName = _.name;
        for (_.values) {
            yield `${groupName}:${_!}`;
        }
    };
}

function explicitLoopKeepsOuterSubject(groups: Group[]) {
    return collect (groups) {
        for (const value of _.values) {
            if (value != null) yield _.name;
        }
    };
}
