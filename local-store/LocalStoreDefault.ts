import LocalStoreByTimestamp = require("./LocalStoreByTimestamp");

/** LocalStoreDefault namespace
 * simple persistent storage interface for small objects or data blobs
 * @author TeamworkGuy2
 * @since 2016-3-24
 */
class LocalStoreDefault implements LocalStore {
    private static defaultInst: LocalStoreDefault;
    private static sessionInst: LocalStoreDefault;

    private MAX_ITEM_SIZE_BYTES = 1000000;
    private keyValueStore: StorageLike & { getKeys?: () => string[]; };


    constructor(store: StorageLike & { getKeys?: () => string[]; }, maxValueSizeBytes: number = 1000000) {
        this.keyValueStore = store;
        this.MAX_ITEM_SIZE_BYTES = maxValueSizeBytes;
    }


    public get length() { return this.keyValueStore.length; }


    public key(index: number): string {
        return this.keyValueStore.key(index);
    }


    public clear(): void {
        this.keyValueStore.clear();
    }


    public getItem(key: string, plainString?: boolean): any {
        if (!key) { throw new Error("cannot access item from store without an identifier key"); }

        key = key.trim();
        var value = this.keyValueStore.getItem(key);
        return plainString === true ? value : (value != null ? JSON.parse(value) : null);
    }


    public hasItem(key: string): boolean {
        return this.getItem(key, true) != null;
    }


    public setItem(key: string, value: any, plainString?: boolean) {
        if (!key) { throw new Error("cannot store item without an identifier key"); }

        key = key.trim();
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
        this.tryLogSetItem(key, jsonString);
    }


    public removeItem(key: string, plainString?: boolean): void {
        if (!key) { throw new Error("cannot remove item from store without an identifier key"); }

        key = key.trim();
        this.keyValueStore.removeItem(key);
    }


    public getKeys(): string[] {
        var store = this.keyValueStore;
        return store.getKeys ? store.getKeys() : Object.keys(store);
    }


    public getData(plainString?: boolean): any[] {
        var store = this.keyValueStore;
        var resData: any[] = [];
        for (var i = 0, size = store.length; i < size; i++) {
            resData.push(this.getItem(store.key(i), plainString));
        }
        return resData;
    }


    private tryLogSetItem(key: string, value: string, retryAttempts: number = 1) {
        for (var attempt = 0; attempt <= retryAttempts; attempt++) {
            try {
                // try setting the value (possibly multiple times)
                this.keyValueStore.setItem(key, value);

                if (attempt >= retryAttempts) {
                    break;
                }
            } catch (err) {
                try {
                    // clean out old data in-case the error was the local store running out of space
                    LocalStoreByTimestamp.getDefaultInst(LocalStoreDefault.getDefaultInst()).handleFullStore(err);
                } catch (e2) {
                    if (attempt >= retryAttempts) {
                        var errMsg = "problem: storing key-value '" + key + "' = '" + value.substr(0, 100) + "' in key-value store;" +
                            "context: storing the item threw an error, attempted to recover" + (retryAttempts > 1 ? " " + retryAttempts + " times" : "") + ", but clearing old data from the store threw another error: " + err;
                        if (console && typeof console.error === "function") {
                            console.error(errMsg);
                            console.error(err.message, err.stack);
                        }
                        throw new Error(errMsg);
                    }
                }
            }
        }
    }


    public static newInst(store: StorageLike, maxValueSizeBytes?: number) {
        return new LocalStoreDefault(store, maxValueSizeBytes);
    }


    public static getDefaultInst() {
        return LocalStoreDefault.defaultInst || (LocalStoreDefault.defaultInst = new LocalStoreDefault(localStorage));
    }


    public static getSessionInst() {
        return LocalStoreDefault.sessionInst || (LocalStoreDefault.sessionInst = new LocalStoreDefault(sessionStorage));
    }

}

export = LocalStoreDefault;