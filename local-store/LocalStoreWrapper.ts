import LocalStoreByTimestamp = require("./LocalStoreByTimestamp");
import MemoryStore = require("./MemoryStore");

/** A 'LocalStore' wrapper over an existing LocalStore for encapsulation, additional storage/retrival logic, etc.
 * @author TeamworkGuy2
 * @since 2016-3-24
 */
class LocalStoreWrapper implements LocalStore {
    private MAX_ITEM_SIZE_BYTES = 1000000;
    private store: LocalStore;
    private handleFullStore: FullStoreHandler;
    private trackTotalSize: boolean;
    private len: number;
    private totalDataSize: number;
    private modCount: number;
    private keys: string[];


    /**
     * @param store the underlying data store, this could be a string based store (i.e. native browser 'localStorage' or a MemoryStore instance) or it could be another LocalStore
     * @param handleFullStore the handler to call when 'store' fails to store an item
     * @param trackKeysAndLen true to track the number of items and item keys added to this store
     * @param trackTotalSize true to track the total data size of the items in this store
     * @param maxValueSizeBytes an optional maximum size of values stored in this store
     * @param [loadExistingData] true to filter the keys from the 'store' and load those which match the 'keyFilter'
     * @param [keyFilter] an optional key filter used if 'loadExistingData'
     */
    constructor(store: LocalStore, handleFullStore: FullStoreHandler, trackKeysAndLen: boolean, trackTotalSize: boolean, maxValueSizeBytes: number = 1000000, loadExistingData?: boolean, keyFilter?: (key: string) => boolean) {
        this.store = store;
        this.handleFullStore = handleFullStore;
        this.MAX_ITEM_SIZE_BYTES = maxValueSizeBytes;
        this.trackTotalSize = trackTotalSize;
        this.len = 0;
        this.keys = trackKeysAndLen ? [] : null;
        this.modCount = 0;

        if (loadExistingData) {
            this.loadDataFrom(store, keyFilter);
        }
    }


    public get length() { return this.len; }


    public get totalSizeChars() { return this.totalDataSize; }


    public clear(): void {
        this.store.clear();
        this.keys = this.keys != null ? [] : null;
        this.len = 0;
        this.totalDataSize = 0;
        this.modCount = 0;
    }


    public key(index: number): string {
        return this.store.key(index);
    }


    public getItem(key: string, plainString?: boolean): any {
        if (!key) { throw new Error("cannot access item from store without an identifier key"); }

        var value = this.store.getItem(key, true);
        return plainString === true ? value : (value != null ? JSON.parse(value) : null);
    }


    public hasItem(key: string): boolean {
        return this.getItem(key, true) != null;
    }


    public setItem(key: string, value: any, plainString?: boolean) {
        var jsonString = this.prepAndValidateValue(key, value, plainString);
        this.trySetItem(key, jsonString);
    }


    public removeItem(key: string, plainString?: boolean): void {
        if (!key) { throw new Error("cannot remove item from store without an identifier key"); }

        if (this.keys != null) {
            var existingData = <string>this.store.getItem(key, true);
            this.logItemRemoved(key, existingData);
        }

        this.store.removeItem(key);
    }


    public getKeys(): string[] {
        var store = this.store;
        return this.keys != null ? this.keys : (store.getKeys ? store.getKeys() : Object.keys(store));
    }


    public getData(plainString?: boolean): any[] {
        var store = this.store;
        var resData: any[] = [];
        if (this.keys != null) {
            for (var i = 0, size = this.keys.length; i < size; i++) {
                resData.push(this.getItem(this.keys[i], plainString));
            }
        }
        else {
            for (var i = 0, size = store.length; i < size; i++) {
                resData.push(this.getItem(store.key(i), plainString));
            }
        }
        return resData;
    }


    private prepAndValidateValue(key: string, value: any, plainString: boolean) {
        if (!key) { throw new Error("cannot store item without an identifier key"); }

        if (plainString === true && typeof value !== "string") {
            throw new Error("local store value = '" + value + "', plain string = true, but value is not a string");
        }
        var jsonString = plainString === true ? <string>value : JSON.stringify(value);

        if (jsonString.length > this.MAX_ITEM_SIZE_BYTES) {
            var errMsg = "attempting to save too large a value to localStorage, key='" + key + "' size is " + jsonString.length + ", value='" + jsonString.substr(0, 100) + (jsonString.length > 100 ? "..." : "") + "'";
            if (console && typeof console.error === "function") {
                console.error(errMsg);
            }
            throw new Error(errMsg);
        }
        return jsonString;
    }


    private trySetItem(key: string, value: string, retryAttempts: number = 1): void {
        for (var attempt = 0; attempt <= retryAttempts; attempt++) {
            try {
                if (this.keys != null) {
                    var existingData = <string>this.store.getItem(key, true);
                }

                // try setting the value (possibly multiple times)
                this.store.setItem(key, value, true);

                if (this.keys != null) {
                    this.logItemAdded(key, value, existingData);
                }

                return;
            } catch (err) {
                try {
                    // clean out old data in-case the error was the local store running out of space
                    this.handleFullStore(this, err);
                } catch (e2) {
                    if (attempt >= retryAttempts) {
                        var errMsg = "problem: storing key-value '" + key + "' = '" + (value && value.substr ? value.substr(0, 100) : value) + "' in key-value store;" +
                            "context: storing the item threw an error, attempted to recover" + (retryAttempts > 1 ? " " + retryAttempts + " times" : "") + " from: " + err + ", " +
                            "but attempting to recover threw another error: " + e2;
                        if (console && typeof console.error === "function") {
                            console.error(errMsg, err.message, err.stack);
                        }
                        throw new Error(errMsg);
                    }
                }
            }
        }
    }


    private logItemAdded(key: string, value: string, existingValue: string): void {
        if (existingValue == null) {
            this.len++;
            this.modCount++;
            this.keys.push(key);
        }
        else {
            if (this.trackTotalSize) {
                this.totalDataSize -= existingValue.length;
            }
        }
        if (this.trackTotalSize) {
            this.totalDataSize += value.length;
        }
    }


    private logItemRemoved(key: string, existingValue: string): void {
        if (existingValue != null) {
            this.len--;
            if (this.trackTotalSize) {
                this.totalDataSize -= existingValue.length;
            }
            this.modCount++;
            MemoryStore.removeAryItem(key, this.keys);
        }
    }


    private loadDataFrom(store: StorageLike & { getKeys?: () => string[]; }, keyFilter?: (key: string) => boolean): void {
        var keys = store.getKeys ? store.getKeys() : Object.keys(store);
        for (var i = 0, size = keys.length; i < size; i++) {
            var key = keys[i];
            if (keyFilter == null || keyFilter(key) == true) {
                this.logItemAdded(key, store.getItem(key), undefined);
            }
        }
    }


    /**
     * @param store the underlying data store, this could be a string based store (i.e. native browser 'localStorage' or a MemoryStore instance) or it could be another LocalStore
     * @param handleFullStore the handler to call when 'store' fails to store an item
     * @param trackKeysAndLen true to track the number of items and item keys added to this store
     * @param trackTotalSize true to track the total data size of the items in this store
     * @param maxValueSizeBytes an optional maximum size of values stored in this store
     * @param [loadExistingData] true to filter the keys from the 'store' and load those which match the 'keyFilter'
     * @param [keyFilter] an optional key filter used if 'loadExistingData'
     */
    public static newInst(store: LocalStore, handleFullStore: FullStoreHandler, trackKeysAndLen: boolean, trackTotalSize: boolean,
            maxValueSizeBytes: number = 1000000, loadExistingData: boolean, keyFilter?: (key: string) => boolean) {
        return new LocalStoreWrapper(store, handleFullStore, trackKeysAndLen, trackTotalSize, maxValueSizeBytes, loadExistingData, keyFilter);
    }

}

export = LocalStoreWrapper;