import ClearFullStore = require("./ClearFullStore");
import UniqueChronologicalKeys = require("./UniqueChronologicalKeys");

/** LocalStoreByTimestamp is a UniqueStore implementation whick takes a 'keyGenerator'.
 * The key generator creates keys for the addItem() method instead of the caller providing a key as with LocalStore.setItem()
 * @see UniqueStore
 * @see LocalStore
 * @author TeamworkGuy2
 * @since 2016-3-25
 */
class LocalStoreByTimestamp implements UniqueStore {
    private storeInst: LocalStore;
    handleFullStore: LocalStore.FullStoreHandler;
    keyGenerator: () => (string | number);


    constructor(storeInst: LocalStore, keyGenerator: () => (string | number), handleFullStore: LocalStore.FullStoreHandler) {
        this.storeInst = storeInst;
        this.handleFullStore = handleFullStore;
        this.keyGenerator = keyGenerator;
    }


    public get length() { return this.storeInst.length; }


    public clear() {
        this.storeInst.clear();
    }


    public getItem(key: string, plainString?: boolean): any {
        return this.storeInst.getItem(key, plainString);
    }


    public key(index: number): string {
        return this.storeInst.key(index);
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
        var key = this.keyGenerator() + '';
        try {
            this.storeInst.setItem(key, value, plainString);
        } catch (err) {
            this.handleFullStore(this.storeInst, err);
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


    /** Creates a local store instance that uses 'UniqueTimestamp' for unique keys and 'ClearFullStore' for cleaning out full stores
     * @param localStore the key-value store to use
     * @param logInfo optional flag to log store clearing events to the key-value store
     * @param removeRatio optional percentage of items to remove from the store when it's full
     * @param keyGenerator optional function which generates a key for storing items when addItem() is called, default is 'UniqueChronologicalKeys.uniqueTimestamp'
     * @param keyParser optional function which parses a 'store' key and extracts a numeric sort order value (default: parseInt)
     */
    public static newTimestampInst(localStore: LocalStore, itemsRemovedCallback?: LocalStore.ItemsRemovedCallback, logInfo?: boolean, removePercentage?: number, keyGenerator?: () => (string | number), keyParser: (key: string) => number = parseInt) {
        var clearer = ClearFullStore.newInst(keyParser, itemsRemovedCallback, removePercentage);

        return new LocalStoreByTimestamp(localStore, keyGenerator || UniqueChronologicalKeys.uniqueTimestamp, (storeInst, err) => {
            clearer.clearOldItems(storeInst, logInfo, err);
        });
    }

}

export = LocalStoreByTimestamp;