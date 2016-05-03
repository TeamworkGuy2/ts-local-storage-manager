"use strict";
var ClearFullStore = require("./ClearFullStore");
var UniqueChronologicalKeys = require("./UniqueChronologicalKeys");
/** LocalStoreByTimestamp namespace
 * persistent storage interface for small objects or data blobs
 * @see LocalStore
 * @author TeamworkGuy2
 * @since 2016-3-25
 */
var LocalStoreByTimestamp = (function () {
    function LocalStoreByTimestamp(storeInst, keyGenerator, handleFullStore) {
        this.storeInst = storeInst;
        this.handleFullStore = handleFullStore;
        this.keyGenerator = keyGenerator;
    }
    Object.defineProperty(LocalStoreByTimestamp.prototype, "length", {
        get: function () { return this.storeInst.length; },
        enumerable: true,
        configurable: true
    });
    LocalStoreByTimestamp.prototype.clear = function () {
        this.storeInst.clear();
    };
    LocalStoreByTimestamp.prototype.getItem = function (key, plainString) {
        return this.storeInst.getItem(key, plainString);
    };
    LocalStoreByTimestamp.prototype.key = function (index) {
        return this.storeInst.key(index);
    };
    LocalStoreByTimestamp.prototype.hasItem = function (key) {
        return this.storeInst.hasItem(key);
    };
    /** Add a new item to this storage object.
     * If storage has run out of space, old timestamped items are deleted
     * @return the key used for the new item
     */
    LocalStoreByTimestamp.prototype.addItem = function (value, plainString) {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        var key = this.keyGenerator() + '';
        try {
            this.storeInst.setItem(key, value, plainString);
        }
        catch (err) {
            this.handleFullStore(this.storeInst, err);
        }
        return key;
    };
    LocalStoreByTimestamp.prototype.removeItem = function (key) {
        this.storeInst.removeItem(key);
    };
    LocalStoreByTimestamp.prototype.getKeys = function () {
        return this.storeInst.getKeys();
    };
    LocalStoreByTimestamp.prototype.getData = function (plainString) {
        return this.storeInst.getData(plainString);
    };
    LocalStoreByTimestamp.newInst = function (storeInst, keyGenerator, handleFullStore) {
        return new LocalStoreByTimestamp(storeInst, keyGenerator, handleFullStore);
    };
    /** Creates a local store instance that uses 'UniqueTimestamp' for unique keys and 'ClearFullStore' for cleaning out full stores
     * @param localStore the key-value store to use
     * @param [logInfo] whether to log full store clearing events to the key-value store
     * @param [removeRatio] the percentage of items to remove from the store when it's full
     */
    LocalStoreByTimestamp.newTimestampInst = function (localStore, itemsRemovedCallback, logInfo, removePercentage) {
        var clearer = ClearFullStore.newInst(Number.parseInt, itemsRemovedCallback, removePercentage);
        return new LocalStoreByTimestamp(localStore, UniqueChronologicalKeys.uniqueTimestamp, function (storeInst, err) {
            clearer.clearOldItems(storeInst, logInfo, err);
        });
    };
    return LocalStoreByTimestamp;
}());
module.exports = LocalStoreByTimestamp;
