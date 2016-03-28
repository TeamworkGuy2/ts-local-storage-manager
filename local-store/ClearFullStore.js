"use strict";
var UniqueChronologicalKey = require("./UniqueChronologicalKey");
/** Handler for removing items from a full LocalStore object based on oldest timestamps extracted from the store's keys
 * @author TeamworkGuy2
 * @since 2016-3-25
 */
var ClearFullStore = (function () {
    function ClearFullStore(localStoreInst, extractTimestamp, removePercentage) {
        if (extractTimestamp === void 0) { extractTimestamp = Number.parseInt; }
        if (removePercentage === void 0) { removePercentage = 0.3; }
        this.removePercentage = 0.3; // when the local store gets too full, remove one-third of the timestamp entries
        this.removalAttemptsCount = 0;
        this.localStoreInst = localStoreInst;
        this.extractTimestamp = extractTimestamp;
        this.removePercentage = removePercentage;
    }
    ClearFullStore.getDefaultInst = function (localStore) {
        return ClearFullStore._defaultInst || (ClearFullStore._defaultInst = new ClearFullStore(localStore));
    };
    /** Remove old items
     */
    ClearFullStore.prototype.clearOldItems = function (logInfo, err, removePercentage, minItemsRemoved, maxItemsRemoved) {
        if (removePercentage === void 0) { removePercentage = this.removePercentage; }
        if (minItemsRemoved === void 0) { minItemsRemoved = 1; }
        if (logInfo) {
            var start = window.performance.now();
        }
        var removeCount = ClearFullStore.removeOldItems(this.localStoreInst, this.extractTimestamp, removePercentage, minItemsRemoved, maxItemsRemoved);
        this.removalAttemptsCount++;
        if (logInfo) {
            var end = window.performance.now();
            // TODO poor solution, log this manually, since psLog imports this class and we don't want a circular dependency
            this.localStoreInst.setItem(UniqueChronologicalKey.uniqueTimestamp() + "", "removed " + removeCount + " local store entries in " + Math.round(end - start) + " ms, because local store threw error" + (err ? ": '" + err.message + "': " + JSON.stringify(err.stack) : ""));
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
    ClearFullStore.removeOldItems = function (localStore, extractTimestamp, removePercentage, minItemsRemoved, maxItemsRemoved) {
        if (minItemsRemoved === void 0) { minItemsRemoved = 1; }
        var timestamps = [];
        // get a list of integer keys from the local store
        var itemKeys = localStore.getKeys();
        for (var i = 0, size = itemKeys.length; i < size; i++) {
            var val = extractTimestamp(itemKeys[i]);
            if (Number.isInteger(val)) {
                timestamps.push(val);
            }
        }
        // sort ascending
        timestamps.sort(function (a, b) { return a - b; });
        var timestampCount = timestamps.length;
        maxItemsRemoved = maxItemsRemoved === void 0 ? timestampCount : Math.min(timestampCount, maxItemsRemoved);
        var removeCount = Math.max(Math.min(Math.round(timestampCount * removePercentage), maxItemsRemoved), minItemsRemoved);
        // remove the oldest timestamped entries (always remove between [1, timestamps.length] entries)
        for (var i = 0; i < removeCount; i++) {
            localStore.removeItem(timestamps[i].toString());
        }
        return removeCount;
    };
    return ClearFullStore;
}());
module.exports = ClearFullStore;
