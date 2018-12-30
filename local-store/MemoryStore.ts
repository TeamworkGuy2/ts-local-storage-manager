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
    /** returns true if adding the 'value' is valid, false if not, 'existingValue' is the existing value mapped to 'key', undefined if there is no existing value */
    private validateBeforeSet: ((key: string, value: string, existingValue: string) => boolean) | null;


    /**
     * @param maxDataSize optional inclusive limit on the total size (sum of string lengths) of all the data stored in this store, if this value is exceeded when calling setItem() an error is thrown
     * @param maxItems optional inclusive limit on the total number of items stored in this store, if this value is exceeded when calling setItem() an error is thrown
     */
    constructor(maxDataSize?: number, maxItems?: number) {
        // copied from clear() to appease TS compiler
        this.data = {};
        this.keys = [];
        this.len = 0;
        this.totalDataSize = 0;
        this.modCount = 0;

        this.validateBeforeSet = null;
        this.setValidation(maxDataSize, maxItems);
    }


    /**
     * @param maxDataSize optional inclusive limit on the total size (sum of string lengths) of all the data stored in this store, if this value is exceeded when calling setItem() an error is thrown
     * @param maxItems optional inclusive limit on the total number of items stored in this store, if this value is exceeded when calling setItem() an error is thrown
     */
    public setValidation(maxDataSize?: number, maxItems?: number) {
        if (maxDataSize != null || maxItems != null) {
            if (maxDataSize != null) {
                this.validateBeforeSet = (key, value, existingValue) => {
                    return this.totalDataSize + value.length - (existingValue !== undefined ? existingValue.length : 0) <= maxDataSize;
                };
            }
            else if (maxItems != null) {
                this.validateBeforeSet = (key, value, existingValue) => {
                    return this.len + (existingValue === undefined ? 1 : 0) <= maxItems;
                };
            }
        }
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

        this.checkLimitsBeforeAdd(key, dataStr, existingData);

        this.data[key] = dataStr;

        this.logItemAdded(key, dataStr, existingData);
    }


    public getKeys(): string[] {
        return this.keys;
    }


    /** Checks that default and user specified limits are enforced and throws errors otherwise
     */
    private checkLimitsBeforeAdd(key: string, value: string, existingValue: string): void {
        var allow = this.validateBeforeSet == null || this.validateBeforeSet(key, value, existingValue);
        if (!allow) {
            throw new Error("in-memory store size limit quota reached");
        }
    }


    private logItemAdded(key: string, value: string, existingValue: string): void {
        if (existingValue === undefined) {
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
        if (existingValue !== undefined) {
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


    /** Create a memory store with optional limits on the stored data
     * @param maxDataSize optional inclusive limit on the total size (sum of string lengths) of all the data stored in this store, if this value is exceeded when calling setItem() an error is thrown
     * @param maxItems optional inclusive limit on the total number of items stored in this store, if this value is exceeded when calling setItem() an error is thrown
     */
    public static newInst(maxDataSize?: number, maxItems?: number) {
        return new MemoryStore(maxDataSize, maxItems);
    }

}

export = MemoryStore;