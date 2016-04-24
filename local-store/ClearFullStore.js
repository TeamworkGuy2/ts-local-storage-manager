"use strict";
var UniqueChronologicalKeys = require("./UniqueChronologicalKeys");
/** Handler for removing items from a full LocalStore object based on oldest chronological IDs extracted from the store's keys
 * @author TeamworkGuy2
 * @since 2016-3-25
 */
var ClearFullStore = (function () {
    function ClearFullStore(extractChronoId, removePercentage) {
        if (removePercentage === void 0) { removePercentage = 0.3; }
        /** [0.0, 1.0] when the local store gets too full, remove this percentage of the entries */
        this.removePercentage = 0.3;
        /** an internal counter of how many times clearOldItems() has been called */
        this.removalAttemptsCount = 0;
        this.extractChronoId = extractChronoId;
        this.removePercentage = removePercentage;
    }
    /** Remove old items
     */
    ClearFullStore.prototype.clearOldItems = function (storeInst, logInfo, err, removePercentage, minItemsRemoved, maxItemsRemoved) {
        if (removePercentage === void 0) { removePercentage = this.removePercentage; }
        if (minItemsRemoved === void 0) { minItemsRemoved = 1; }
        if (logInfo) {
            var start = window.performance.now();
        }
        var removeCount = ClearFullStore.removeOldItems(storeInst, this.extractChronoId, removePercentage, minItemsRemoved, maxItemsRemoved);
        this.removalAttemptsCount++;
        if (logInfo) {
            var end = window.performance.now();
            // TODO poor solution, log this manually, since psLog imports this class and we don't want a circular dependency
            storeInst.setItem(UniqueChronologicalKeys.uniqueTimestamp() + "", "removed " + removeCount + " local store entries in " + Math.round(end - start) + " ms, because local store threw error" + (err ? ": '" + err.message + "': " + JSON.stringify(err.stack) : ""));
        }
        return removeCount;
    };
    /** Given a {@link LocalStore} with integer based keys (not all keys must be integers),
     * remove {@code removePercentage} percent of the smallest integer keys
     * @param removePercentage: a value in the range [0.0, 1.0] that specifies the percentage of timestamped values to remove
     * @param localStore: the local storage object to remove old timestamped items from
     * @param [minItemsRemoved=1]: the minimum number of items to remove
     * @param [maxItemsRemoved=(localStore keys where key is Integer).length]: the maximum number of items to remove,
     * this defaults to the total number of integer based keys in {@code localStore}
     * @return the number of items removed from the {@code localStore}
     */
    ClearFullStore.removeOldItems = function (localStore, extractChronoId, removePercentage, minItemsRemoved, maxItemsRemoved) {
        if (minItemsRemoved === void 0) { minItemsRemoved = 1; }
        var ids = [];
        // get a list of integer keys from the local store
        var keys = localStore.getKeys();
        for (var i = 0, size = keys.length; i < size; i++) {
            var val = extractChronoId(keys[i]);
            if (Number.isInteger(val)) {
                ids.push(val);
            }
        }
        // sort ascending
        ids.sort(function (a, b) { return a - b; });
        var idCount = ids.length;
        maxItemsRemoved = maxItemsRemoved === undefined ? idCount : Math.min(idCount, maxItemsRemoved);
        var removeCount = Math.max(Math.min(Math.round(idCount * removePercentage), maxItemsRemoved), minItemsRemoved);
        // remove the oldest timestamped entries (always remove between [1, timestamps.length] entries)
        for (var i = 0; i < removeCount; i++) {
            localStore.removeItem(ids[i].toString());
        }
        return removeCount;
    };
    ClearFullStore.newInst = function (extractChronoId, removePercentage) {
        return new ClearFullStore(extractChronoId, removePercentage);
    };
    return ClearFullStore;
}());
module.exports = ClearFullStore;
