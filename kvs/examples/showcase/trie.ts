class Trie {
    end = false;
    children: Trie?[] = [];
    
    ndx = (c: string) => c.charCodeAt(0) - 'a'.charCodeAt(0);
    add(word: string, i = 0) {
        if (i === word.length) {
            this.end = true;
            return;
        }

        const c = this.ndx(word[i]);
        this.children[c]!.add(word, i + 1);
    }

    has(word: string, i = 0): boolean {
        if (i === word.length) return this.end;

        const c = this.ndx(word[i]);
        return this.children[c]?.has(word, i + 1) ?? false;
    }
}

const words = new Trie();

for (["cat", "car", "dog"])
    words.add(_);

for (["cat", "can", "dog", "dot"])
    console.log(_, words.has(_));