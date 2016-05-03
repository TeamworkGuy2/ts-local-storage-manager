import ClearFullStore = require("./ClearFullStore");
import UniqueChronologicalKeys = require("./UniqueChronologicalKeys");

/** LocalStoreByTimestamp namespace
 * persistent storage interface for small objects or data blobs
 * @see LocalStore
 * @author TeamworkGuy2
 * @since 2016-3-25
 */
class LocalStoreByTimestamp implements UniqueStore {
    private storeInst: LocalStore;
    handleFullStore: FullStoreHandler;
    keyGenerator: () => (string | number);


    constructor(storeInst: LocalStore, keyGenerator: () => (string | number), handleFullStore: FullStoreHandler) {
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


    public static newInst(storeInst: LocalStore, keyGenerator: () => string, handleFullStore: FullStoreHandler) {
        return new LocalStoreByTimestamp(storeInst, keyGenerator, handleFullStore);
    }


    /** Creates a local store instance that uses 'UniqueTimestamp' for unique keys and 'ClearFullStore' for cleaning out full stores
     * @param localStore the key-value store to use
     * @param [logInfo] whether to log full store clearing events to the key-value store
     * @param [removeRatio] the percentage of items to remove from the store when it's full
     */
    public static newTimestampInst(localStore: LocalStore, itemsRemovedCallback?: ItemsRemovedCallback, logInfo?: boolean, removePercentage?: number) {
        var clearer = ClearFullStore.newInst(Number.parseInt, itemsRemovedCallback, removePercentage);
        return new LocalStoreByTimestamp(localStore, UniqueChronologicalKeys.uniqueTimestamp, (storeInst, err) => {
            clearer.clearOldItems(storeInst, logInfo, err);
        });
    }

}

export = LocalStoreByTimestamp;