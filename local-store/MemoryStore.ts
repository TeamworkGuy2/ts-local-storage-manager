/** An in-memory 'localStorage' like class
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
class MemoryStore implements StorageLike {
    private len: number;
    private modCount: number;
    private keys: string[];
    private data: { [key: string]: string };


    constructor() {
        this.data = {};
        this.len = 0;
        this.keys = [];
        this.modCount = 0;
    }


    public get length(): number { return this.len; }


    public clear(): void {
        this.data = {};
        this.keys = [];
        this.len = 0;
        this.modCount = 0;
    }


    public getItem(key: string): any {
        var value = this.data[key];
        return value === undefined ? null : value;
    }


    public key(index: number): string {
        return this.keys[index];
    }


    public removeItem(key: string): void {
        var exists = this.data[key] !== undefined;

        if (exists) {
            delete this.data[key];
            this.len--;
            this.modCount++;
            MemoryStore.removeAryItem(key, this.keys);
        }
    }


    public setItem(key: string, data: string): void {
        key = key === undefined ? "undefined" : (key === null ? "null" : key);
        var exists = this.data[key] !== undefined;

        this.data[key] = data === undefined ? "undefined" : (data === null ? "null" : data.toString());

        if (!exists) {
            this.len++;
            this.modCount++;
            this.keys.push(key);
        }
    }


    public getKeys(): string[] {
        return this.keys;
    }


    private static removeAryItem(key: string, keys: string[]): void {
        var idx = keys.indexOf(key);
        var size = keys.length;
        if (idx == size - 1) {
            keys.pop();
        }
        else {
            for (var i = idx; i < size - 1; i++) {
                keys[i] = keys[i + 1];
            }
            keys.pop();
        }
    }


    public static newInst() {
        return new MemoryStore();
    }

}

export = MemoryStore;