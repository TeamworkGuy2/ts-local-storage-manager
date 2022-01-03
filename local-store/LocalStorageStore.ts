import ClearFullStore = require("./ClearFullStore");
import MemoryStore = require("./MemoryStore");

/** LocalStore implementation wrapper for StorageLike objects (i.e. window.localStorage and window.sessionStorage)
 * @author TeamworkGuy2
 * @since 2016-3-24
 */
class LocalStorageStore implements LocalStore {
    public MAX_ITEM_SIZE_BYTES = 1000000;
    private store: StorageLike & { getKeys?: () => string[]; };
    private getStoreKeys: ((store: StorageLike) => string[]) | null | undefined;
    private handleFullStore: LocalStore.FullStoreHandler;
    private trackTotalSize: boolean;
    private len: number;
    private totalDataSize: number;
    private modCount: number;
    private keys: string[] | null;


    /**
     * @param store the underlying data store, this could be a string based store (i.e. native browser 'localStorage' or a MemoryStore instance) or it could be another LocalStore.
     * Note: the optional getKeys() function MUST return a new array each time it is called
     * @param getStoreKeys a function that gets the keys from the 'store' (Note: this function MUST return a new array each time it is called)
     * @param handleFullStore the handler to call when 'store' fails to store an item
     * @param trackKeysAndLen true to track the number of items and item keys added to this store
     * @param trackTotalSize true to track the total data size of the items in this store
     * @param maxValueSizeBytes an optional maximum size of values stored in this store
     * @param loadExistingData optional flag to enable filtering the keys from the 'store' and load those which match the 'keyFilter'
     * @param keyFilter optional storage key filter used if 'loadExistingData'
     */
    constructor(store: StorageLike & { getKeys?: () => string[]; }, getStoreKeys: ((store: StorageLike) => string[]) | null | undefined, handleFullStore: LocalStore.FullStoreHandler,
            trackKeysAndLen: boolean, trackTotalSize: boolean, maxValueSizeBytes: number = 1000000, loadExistingData?: boolean, keyFilter?: (key: string) => boolean) {
        this.store = store;
        this.getStoreKeys = getStoreKeys;
        this.handleFullStore = handleFullStore;
        this.MAX_ITEM_SIZE_BYTES = maxValueSizeBytes;
        this.trackTotalSize = trackTotalSize;
        this.keys = trackKeysAndLen ? [] : null;
        this.len = 0;
        this.totalDataSize = 0;
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

        var value = this.store.getItem(key);
        return plainString === true ? value : (value != null ? JSON.parse(value) : value);
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
            var existingData = <string>this.store.getItem(key);
            this.logItemRemoved(key, existingData);
        }

        this.store.removeItem(key);
    }


    public getKeys(): string[] {
        var store = this.store;
        return this.keys != null ? this.keys.slice() : (store.getKeys ? store.getKeys() : (this.getStoreKeys ? this.getStoreKeys(store) : Object.keys(store)));
    }


    public getData(plainString?: boolean): any[] {
        var store = this.store;
        var resData: any[] = [];
        for (var i = 0, size = store.length; i < size; i++) {
            resData.push(this.getItem(store.key(i), plainString));
        }
        return resData;
    }


    private prepAndValidateValue(key: string, value: any, plainString: boolean | undefined) {
        if (!key) { throw new Error("cannot store item without an identifier key"); }

        if (plainString === true && typeof value !== "string") {
            throw new Error("local store value = '" + value + "', plain string = true, but value is not a string");
        }
        var jsonString = plainString === true ? <string>value : JSON.stringify(value);

        if (jsonString.length > this.MAX_ITEM_SIZE_BYTES) {
            var errMsg = "attempting to save a local store value large than the specified limit of " + this.MAX_ITEM_SIZE_BYTES +
                ", key='" + key + "' size is " + jsonString.length + ", value='" + jsonString.substr(0, 100) + (jsonString.length > 100 ? "..." : "") + "'";
            throw new Error(errMsg);
        }
        return jsonString;
    }


    private trySetItem(key: string, value: string, retryAttempts: number = 1): void {
        for (var attempt = 0; attempt <= retryAttempts; attempt++) {
            try {
                var existingData: string = <never>undefined;
                if (this.keys != null) {
                    existingData = this.store.getItem(key);
                }

                // try setting the value (possibly multiple times)
                this.store.setItem(key, value);

                if (this.keys != null) {
                    this.logItemAdded(key, value, existingData);
                }

                return;
            } catch (err) {
                var err2: Error = <never>undefined;
                try {
                    // clean out old data in-case the error was the local store running out of space, if the full store handler fails, just let that generate a null error
                    this.handleFullStore(this, err);
                } catch (e2) {
                    err2 = <any>e2;
                }

                if (attempt >= retryAttempts) {
                    var errMsg = "problem: storing key-value '" + key + "' = '" + value.substr(0, 100) + "' (len: " + value.length + ") in key-value store;" +
                        "context: storing the item threw an error, attempted to recover" + (retryAttempts > 1 ? " " + retryAttempts + " times" : "") +
                        (err2 != null ? ", but clearing old data from the store threw another error; " : "; ") +
                        "error: storing: " + err + (err2 != null ? ",\nclearing: " + err2 : "");
                    throw new Error(errMsg);
                }
            }
        }
    }


    private logItemAdded(key: string, value: string, existingValue: string | null | undefined): void {
        if (existingValue == null) {
            this.len++;
            this.modCount++;
            (<string[]>this.keys).push(key);
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


    private logItemRemoved(key: string, existingValue: string | null | undefined): void {
        if (existingValue != null) {
            this.len--;
            if (this.trackTotalSize) {
                this.totalDataSize -= existingValue.length;
            }
            this.modCount++;
            MemoryStore.removeAryItem(key, <string[]>this.keys);
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


    /** Create a LocalStore object from a StorageLike object with additional options and handlers/callbacks
     * @param store the store that will be used to store data.
     * Note: the optional getKeys() function MUST return a new array each time it is called
     * @param itemsRemovedCallback optional callback to call when items are removed from the store to free up space
     * @param logInfo optional flag to log store clearing events to the key-value store
     * @param removeRatio optional percentage of items to remove from the store when it's full
     * @param keyParser optional function which parses a 'store' key and extracts a numeric sort order value (default: parseInt)
     */
    public static newTimestampInst(store: StorageLike & { getKeys?: () => string[]; }, itemsRemovedCallback?: LocalStore.ItemsRemovedCallback, logInfo?: boolean, removePercentage?: number, keyParser: (key: string) => number = parseInt) {
        var clearer = ClearFullStore.newInst(keyParser, itemsRemovedCallback, removePercentage);

        return new LocalStorageStore(store, null, (store, err) => {
            clearer.clearOldItems(store, logInfo, err);
        }, true, true, undefined, true);
    }

}

export = LocalStorageStore;