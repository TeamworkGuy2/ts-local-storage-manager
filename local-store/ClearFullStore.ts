import UniqueChronologicalKeys = require("./UniqueChronologicalKeys");

/** Handler for removing items from a full LocalStore object based on oldest chronological IDs extracted from the store's keys
 * @author TeamworkGuy2
 * @since 2016-3-25
 */
class ClearFullStore {
    /** the function used to extract a chronological value from a stored key */
    private extractChronoId: (key: string) => number;
    /** optional function that is called when clearOldItems() is called with 'logInfo' parameter true */
    private itemsRemovedCallback: ItemsRemovedCallback;
    /** [0.0, 1.0] when the local store gets too full, remove this percentage of the entries */
    removePercentage: number = 0.3;
    /** an internal counter of how many times clearOldItems() has been called */
    removalAttemptsCount: number = 0;


    constructor(extractChronoId: (key: string) => number, itemsRemovedCallback?: ItemsRemovedCallback, removePercentage: number = 0.3) {
        this.extractChronoId = extractChronoId;
        this.itemsRemovedCallback = itemsRemovedCallback;
        this.removePercentage = removePercentage;
    }


    /** Remove old items
     */
    public clearOldItems(store: LocalStore, logInfo?: boolean, err?: any, removePercentage: number = this.removePercentage, minItemsRemoved: number = 1, maxItemsRemoved?: number): RemovedItem[] {
        if (logInfo) {
            var start = UniqueChronologicalKeys.getMillisecondTime();
        }

        var removedItems = ClearFullStore.removeOldItems(store, this.extractChronoId, removePercentage, minItemsRemoved, maxItemsRemoved);
        this.removalAttemptsCount++;

        if (logInfo) {
            var end = UniqueChronologicalKeys.getMillisecondTime();
        }
        if (this.itemsRemovedCallback) {
            this.itemsRemovedCallback(store, removedItems.items, {
                error: err,
                message: "removed " + removedItems.items.length + " local store entries" + (start || end ? " in " + Math.round(end - start) + " ms" : "") + ", " +
                    "because local store threw error" + (err ? ": '" + err.message + "': " + JSON.stringify(err.stack) : ""),
            }, removedItems.removedCount);
        }
        return removedItems.items;
    }


    /** Given a {@link LocalStore} with integer based keys (not all keys must be integers),
     * remove {@code removePercentage} percent of the smallest integer keys
     * @param removePercentage: a value in the range [0.0, 1.0] that specifies the percentage of timestamped values to remove
     * @param localStore: the local storage object to remove old timestamped items from
     * @param [minItemsRemoved=1]: the minimum number of items to remove
     * @param [maxItemsRemoved=(localStore keys where key is Integer).length]: the maximum number of items to remove,
     * this defaults to the total number of integer based keys in {@code localStore}
     * @return the number of items removed from the {@code localStore}
     */
    private static removeOldItems(localStore: LocalStore, extractChronoId: (key: string) => number, removePercentage: number, minItemsRemoved: number = 1, maxItemsRemoved?: number): { items: RemovedItem[]; idsSorted: { id: number; key: string; }[], removedCount: number; } {
        var idsKeys: { id: number; key: string; }[] = [];
        // get a list of chronological keys from the local store
        var keys = localStore.getKeys();

        for (var i = 0, size = keys.length; i < size; i++) {
            var val = extractChronoId(keys[i]);
            if (Number.isInteger(val)) {
                idsKeys.push({
                    id: val,
                    key: keys[i]
                });
            }
        }
        // sort ascending
        idsKeys.sort(function (a, b) { return a.id - b.id; });

        var idCount = idsKeys.length;
        maxItemsRemoved = maxItemsRemoved === undefined ? idCount : Math.min(idCount, maxItemsRemoved);
        var removeCount = Math.max(Math.min(Math.round(idCount * removePercentage), maxItemsRemoved), minItemsRemoved);
        var removedItems: RemovedItem[] = [];
        // remove the oldest timestamped entries (always remove between [1, timestamps.length] entries)
        for (var i = 0; i < removeCount; i++) {
            var keyId = idsKeys[i];

            var existingItem = localStore.getItem(keyId.key);
            removedItems.push({
                key: idsKeys[i].key,
                keyId: idsKeys[i].id,
                value: existingItem,
            });

            localStore.removeItem(keyId.key);
        }

        return { items: removedItems, idsSorted: idsKeys, removedCount: removeCount };
    }


    public static newInst(extractChronoId: (key: string) => number, itemsRemovedCallback?: ItemsRemovedCallback, removePercentage?: number) {
        return new ClearFullStore(extractChronoId, itemsRemovedCallback, removePercentage);
    }

}

export = ClearFullStore;