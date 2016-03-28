import ClearFullStore = require("./ClearFullStore");
import UniqueChronologicalKey = require("./UniqueChronologicalKey");

/** LocalStoreByTimestamp namespace
 * persistent storage interface for small objects or data blobs
 * @see LocalStore
 * @author TeamworkGuy2
 * @since 2016-3-25
 */
class LocalStoreByTimestamp implements UniqueStore {
    private static _defaultInst: LocalStoreByTimestamp;

    static getDefaultInst(localStore: LocalStore, extractTimestamp?: (key: string) => number, logInfo?: boolean, removeRatio?: number) {
        var clearer = new ClearFullStore(localStore, extractTimestamp, removeRatio);
        return LocalStoreByTimestamp._defaultInst || (LocalStoreByTimestamp._defaultInst = new LocalStoreByTimestamp(localStore, () => {
            // work around for the granularity of Date.now() and the rollover issue with performance.now()
            return UniqueChronologicalKey.uniqueTimestamp() + "";
        }, (err) => clearer.clearOldItems(logInfo, err)));
    }

    private storeInst: LocalStore;
    handleFullStore: (err) => void;
    timestampKeyGenerator: () => (string | number);


    constructor(storeInst: LocalStore, timestampKeyGenerator: () => (string | number), handleFullStore: (err: any) => void) {
        this.storeInst = storeInst;
        this.handleFullStore = handleFullStore;
        this.timestampKeyGenerator = timestampKeyGenerator;
    }


    public get length() { return this.storeInst.length; }


    public getItem(key: string, plainString?: boolean): any {
        return this.storeInst.getItem(key, plainString);
    }


    public hasItem(key: string) {
        return this.storeInst.hasItem(key);
    }


    /** Add a new item to this storage object.
     * If storage has run out of space, old timestamped items are deleted
     * @return the key used for the new item
     */
    public addItem(value: any, plainString?: boolean): string {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        var key = this.timestampKeyGenerator() + '';
        try {
            this.storeInst.setItem(key, value, plainString);
        } catch (err) {
            this.handleFullStore(err);
        }
        return key;
    }


    public removeItem(key: string): void {
        this.storeInst.removeItem(key);
    }


    public getKeys(): string[] {
        return this.storeInst.getKeys();
    }


    public getData(plainString?: boolean): any[] {
        return this.storeInst.getData(plainString);
    }


    public static newInst(storeInst: LocalStore, timestampKeyGenerator: () => string, handleFullStore: (err: any) => void) {
        return new LocalStoreByTimestamp(storeInst, timestampKeyGenerator, handleFullStore);
    }


    /** Creates a local store instance that uses 'UniqueTimestamp' for unique keys and 'ClearFullStore' for cleaning out full stores
     * @param localStore the key-value store to use
     * @param [logInfo] whether to log full store clearing events to the key-value store
     * @param [removeRatio] the percentage of items to remove from the store when it's full
     */
    public static newDefaultInst(localStore: LocalStore, extractTimestamp?: (key: string) => number, logInfo?: boolean, removePercentage?: number) {
        var clearer = new ClearFullStore(localStore, extractTimestamp, removePercentage);
        return new LocalStoreByTimestamp(localStore, UniqueChronologicalKey.uniqueTimestamp, (err) => clearer.clearOldItems(logInfo, err));
    }

}

export = LocalStoreByTimestamp;