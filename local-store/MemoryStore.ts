/** An in-memory 'localStorage' like class
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
class MemoryStore implements StorageLike {
    private len: number;
    private totalDataSize: number;
    private modCount: number;
    private keys: string[];
    private data: { [key: string]: string };


    constructor() {
        this.data = {};
        this.len = 0;
        this.keys = [];
        this.modCount = 0;
    }


    public get length() { return this.len; }


    public get totalSizeChars() { return this.totalDataSize; }


    public clear(): void {
        this.data = {};
        this.keys = [];
        this.len = 0;
        this.totalDataSize = 0;
        this.modCount = 0;
    }


    public getItem(key: string): any {
        var value = this.data[key];
        return value;
    }


    public key(index: number): string {
        return this.keys[index];
    }


    public removeItem(key: string): void {
        var existingData = this.data[key];

        if (existingData !== undefined) {
            delete this.data[key];
        }

        this.logItemRemoved(key, existingData);
    }


    public setItem(key: string, data: string): void {
        key = key === undefined ? "undefined" : (key === null ? "null" : key);
        var existingData = this.data[key];

        var dataStr = data === undefined ? "undefined" : (data === null ? "null" : data.toString())
        this.data[key] = dataStr;

        this.logItemAdded(key, dataStr, existingData);
    }


    public getKeys(): string[] {
        return this.keys;
    }


    private logItemAdded(key: string, value: string, existingValue: string): void {
        var exists = existingValue !== undefined;
        if (!exists) {
            this.len++;
            this.modCount++;
            this.keys.push(key);
        }
        else {
            this.totalDataSize -= existingValue.length;
        }
        this.totalDataSize += value.length;
    }


    private logItemRemoved(key: string, existingValue: string): void {
        var exists = existingValue !== undefined;

        if (exists) {
            this.len--;
            this.totalDataSize -= existingValue.length;
            this.modCount++;
            MemoryStore.removeAryItem(key, this.keys);
        }
    }


    public static removeAryItem(key: string, keys: string[]): void {
        var idx = keys.indexOf(key);
        var size = keys.length;
        if (idx === size - 1) {
            keys.pop();
        }
        else if (idx === 0) {
            keys.shift();
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