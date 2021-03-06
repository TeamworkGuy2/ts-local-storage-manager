"use strict";
var ClearFullStore = require("./ClearFullStore");
var UniqueChronologicalKeys = require("./UniqueChronologicalKeys");
/** LocalStoreByTimestamp is a UniqueStore implementation whick takes a 'keyGenerator'.
 * The key generator creates keys for the addItem() method instead of the caller providing a key as with LocalStore.setItem()
 * @see UniqueStore
 * @see LocalStore
 * @author TeamworkGuy2
 * @since 2016-3-25
 */
var LocalStoreByTimestamp = /** @class */ (function () {
    function LocalStoreByTimestamp(storeInst, keyGenerator, handleFullStore) {
        this.storeInst = storeInst;
        this.handleFullStore = handleFullStore;
        this.keyGenerator = keyGenerator;
    }
    Object.defineProperty(LocalStoreByTimestamp.prototype, "length", {
        get: function () { return this.storeInst.length; },
        enumerable: false,
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
    /** Creates a local store instance that uses 'UniqueTimestamp' for unique keys and 'ClearFullStore' for cleaning out full stores
     * @param localStore the key-value store to use
     * @param logInfo optional flag to log store clearing events to the key-value store
     * @param removeRatio optional percentage of items to remove from the store when it's full
     * @param keyGenerator optional function which generates a key for storing items when addItem() is called, default is 'UniqueChronologicalKeys.uniqueTimestamp'
     * @param keyParser optional function which parses a 'store' key and extracts a numeric sort order value (default: parseInt)
     */
    LocalStoreByTimestamp.newTimestampInst = function (localStore, itemsRemovedCallback, logInfo, removePercentage, keyGenerator, keyParser) {
        if (keyParser === void 0) { keyParser = parseInt; }
        var clearer = ClearFullStore.newInst(keyParser, itemsRemovedCallback, removePercentage);
        return new LocalStoreByTimestamp(localStore, keyGenerator || UniqueChronologicalKeys.uniqueTimestamp, function (storeInst, err) {
            clearer.clearOldItems(storeInst, logInfo, err);
        });
    };
    return LocalStoreByTimestamp;
}());
module.exports = LocalStoreByTimestamp;
