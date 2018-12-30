"use strict";
var ClearFullStore = require("./ClearFullStore");
var MemoryStore = require("./MemoryStore");
/** LocalStore implementation wrapper for StorageLike objects
 * @author TeamworkGuy2
 * @since 2016-3-24
 */
var LocalStorageStore = /** @class */ (function () {
    /**
     * @param store the underlying data store, this could be a string based store (i.e. native browser 'localStorage' or a MemoryStore instance) or it could be another LocalStore.
     * Note: the optional getKeys() function MUST return a new array each time it is called
     * @param getStoreKeys a function that gets the keys from the 'store' (Note: this function function MUST return a new array each time it is called)
     * @param handleFullStore the handler to call when 'store' fails to store an item
     * @param trackKeysAndLen true to track the number of items and item keys added to this store
     * @param trackTotalSize true to track the total data size of the items in this store
     * @param maxValueSizeBytes an optional maximum size of values stored in this store
     * @param loadExistingData optional flag to enable filtering the keys from the 'store' and load those which match the 'keyFilter'
     * @param keyFilter optional storage key filter used if 'loadExistingData'
     */
    function LocalStorageStore(store, getStoreKeys, handleFullStore, trackKeysAndLen, trackTotalSize, maxValueSizeBytes, loadExistingData, keyFilter) {
        if (maxValueSizeBytes === void 0) { maxValueSizeBytes = 1000000; }
        this.MAX_ITEM_SIZE_BYTES = 1000000;
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
    Object.defineProperty(LocalStorageStore.prototype, "length", {
        get: function () { return this.len; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LocalStorageStore.prototype, "totalSizeChars", {
        get: function () { return this.totalDataSize; },
        enumerable: true,
        configurable: true
    });
    LocalStorageStore.prototype.clear = function () {
        this.store.clear();
        this.keys = this.keys != null ? [] : null;
        this.len = 0;
        this.totalDataSize = 0;
        this.modCount = 0;
    };
    LocalStorageStore.prototype.key = function (index) {
        return this.store.key(index);
    };
    LocalStorageStore.prototype.getItem = function (key, plainString) {
        if (!key) {
            throw new Error("cannot access item from store without an identifier key");
        }
        var value = this.store.getItem(key);
        return plainString === true ? value : (value != null ? JSON.parse(value) : value);
    };
    LocalStorageStore.prototype.hasItem = function (key) {
        return this.getItem(key, true) != null;
    };
    LocalStorageStore.prototype.setItem = function (key, value, plainString) {
        var jsonString = this.prepAndValidateValue(key, value, plainString);
        this.trySetItem(key, jsonString);
    };
    LocalStorageStore.prototype.removeItem = function (key, plainString) {
        if (!key) {
            throw new Error("cannot remove item from store without an identifier key");
        }
        if (this.keys != null) {
            var existingData = this.store.getItem(key);
            this.logItemRemoved(key, existingData);
        }
        this.store.removeItem(key);
    };
    LocalStorageStore.prototype.getKeys = function () {
        var store = this.store;
        return this.keys != null ? this.keys.slice() : (store.getKeys ? store.getKeys() : (this.getStoreKeys ? this.getStoreKeys(store) : Object.keys(store)));
    };
    LocalStorageStore.prototype.getData = function (plainString) {
        var store = this.store;
        var resData = [];
        for (var i = 0, size = store.length; i < size; i++) {
            resData.push(this.getItem(store.key(i), plainString));
        }
        return resData;
    };
    LocalStorageStore.prototype.prepAndValidateValue = function (key, value, plainString) {
        if (!key) {
            throw new Error("cannot store item without an identifier key");
        }
        if (plainString === true && typeof value !== "string") {
            throw new Error("local store value = '" + value + "', plain string = true, but value is not a string");
        }
        var jsonString = plainString === true ? value : JSON.stringify(value);
        if (jsonString.length > this.MAX_ITEM_SIZE_BYTES) {
            var errMsg = "attempting to save a local store value large than the specified limit of " + this.MAX_ITEM_SIZE_BYTES + ", key='" + key + "' size is " + jsonString.length + ", value='" + jsonString.substr(0, 100) + (jsonString.length > 100 ? "..." : "") + "'";
            if (console && typeof console.error === "function") {
                console.error(errMsg);
            }
            throw new Error(errMsg);
        }
        return jsonString;
    };
    LocalStorageStore.prototype.trySetItem = function (key, value, retryAttempts) {
        if (retryAttempts === void 0) { retryAttempts = 1; }
        for (var attempt = 0; attempt <= retryAttempts; attempt++) {
            try {
                var existingData = undefined;
                if (this.keys != null) {
                    existingData = this.store.getItem(key);
                }
                // try setting the value (possibly multiple times)
                this.store.setItem(key, value);
                if (this.keys != null) {
                    this.logItemAdded(key, value, existingData);
                }
                return;
            }
            catch (err) {
                try {
                    // clean out old data in-case the error was the local store running out of space, if the full store handle is null, just let that generate a null error
                    this.handleFullStore(this, err);
                }
                catch (e2) {
                    if (attempt >= retryAttempts) {
                        var errMsg = "problem: storing key-value '" + key + "' = '" + value.substr(0, 100) + "' in key-value store;" +
                            "context: storing the item threw an error, attempted to recover" + (retryAttempts > 1 ? " " + retryAttempts + " times" : "") + ", but clearing old data from the store threw another error: " + err;
                        if (console && typeof console.error === "function") {
                            console.error(errMsg, err.message, err.stack);
                        }
                        throw new Error(errMsg);
                    }
                }
            }
        }
    };
    LocalStorageStore.prototype.logItemAdded = function (key, value, existingValue) {
        if (existingValue == null) {
            this.len++;
            this.modCount++;
            this.keys.push(key);
        }
        else {
            if (this.trackTotalSize) {
                this.totalDataSize -= existingValue.length;
            }
        }
        if (this.trackTotalSize) {
            this.totalDataSize += value.length;
        }
    };
    LocalStorageStore.prototype.logItemRemoved = function (key, existingValue) {
        if (existingValue != null) {
            this.len--;
            if (this.trackTotalSize) {
                this.totalDataSize -= existingValue.length;
            }
            this.modCount++;
            MemoryStore.removeAryItem(key, this.keys);
        }
    };
    LocalStorageStore.prototype.loadDataFrom = function (store, keyFilter) {
        var keys = store.getKeys ? store.getKeys() : Object.keys(store);
        for (var i = 0, size = keys.length; i < size; i++) {
            var key = keys[i];
            if (keyFilter == null || keyFilter(key) == true) {
                this.logItemAdded(key, store.getItem(key), undefined);
            }
        }
    };
    /**
     * @param store the underlying data store, this could be a string based store (i.e. native browser 'localStorage' or a MemoryStore instance) or it could be another LocalStore.
     * Note: the optional getKeys() function MUST return a new array each time it is called
     * @param getStoreKeys a function that gets the keys from the 'store' (Note: this function MUST return a new array each time it is called)
     * @param trackKeysAndLen true to track the number of items and item keys added to this store
     * @param trackTotalSize true to track the total data size of the items in this store
     * @param maxValueSizeBytes an optional maximum size of values stored in this store
     * @param loadExistingData optional flag to enable filtering the keys from the 'store' and load those which match the 'keyFilter'
     * @param keyFilter optional storage key filter used if 'loadExistingData'
     */
    LocalStorageStore.newInst = function (store, getStoreKeys, handleFullStore, trackKeysAndLen, trackTotalSize, maxValueSizeBytes, loadExistingData, keyFilter) {
        if (maxValueSizeBytes === void 0) { maxValueSizeBytes = 1000000; }
        return new LocalStorageStore(store, getStoreKeys, handleFullStore, trackKeysAndLen, trackTotalSize, maxValueSizeBytes, loadExistingData, keyFilter);
    };
    /** Create a LocalStore object from a StorageLike object and an optional item removal callback
     * @param store the store that will be used to store data.
     * Note: the optional getKeys() function MUST return a new array each time it is called
     * @param itemsRemovedCallback optional callback to call when items are removed from the store to free up space
     * @param logInfo optional flag to log store clearing events to the key-value store
     * @param removeRatio optional percentage of items to remove from the store when it's full
     */
    LocalStorageStore.newTimestampInst = function (store, itemsRemovedCallback, logInfo, removePercentage) {
        var clearer = ClearFullStore.newInst(Number.parseInt, itemsRemovedCallback, removePercentage);
        return new LocalStorageStore(store, null, function (store, err) {
            clearer.clearOldItems(store, logInfo, err);
        }, true, true, undefined, true);
    };
    return LocalStorageStore;
}());
module.exports = LocalStorageStore;
