"use strict";
var MemoryStore = require("./MemoryStore");
/** A 'LocalStore' wrapper over an existing LocalStore for encapsulation, additional storage/retrival logic, etc.
 * @author TeamworkGuy2
 * @since 2016-3-24
 */
var LocalStoreWrapper = (function () {
    /**
     * @param store the underlying data store, this could be a string based store (i.e. native browser 'localStorage' or a MemoryStore instance) or it could be another LocalStore
     * @param handleFullStore the handler to call when 'store' fails to store an item
     * @param trackKeysAndLen true to track the number of items and item keys added to this store
     * @param trackTotalSize true to track the total data size of the items in this store, cannot be true if 'passThrough' is also true
     * @param maxValueSizeBytes an optional maximum size of values stored in this store
     * @param [loadExistingData] true to filter the keys from the 'store' and load those which match the 'keyFilter'
     * @param [keyFilter] an optional key filter used if 'loadExistingData'
     */
    function LocalStoreWrapper(store, handleFullStore, trackKeysAndLen, trackTotalSize, maxValueSizeBytes, loadExistingData, keyFilter) {
        if (maxValueSizeBytes === void 0) { maxValueSizeBytes = 1000000; }
        this.MAX_ITEM_SIZE_BYTES = 1000000;
        this.store = store;
        this.handleFullStore = handleFullStore;
        this.MAX_ITEM_SIZE_BYTES = maxValueSizeBytes;
        this.trackTotalSize = trackTotalSize;
        this.len = 0;
        this.keys = trackKeysAndLen ? [] : null;
        this.modCount = 0;
        if (loadExistingData) {
            this.loadDataFrom(store, keyFilter);
        }
    }
    Object.defineProperty(LocalStoreWrapper.prototype, "length", {
        get: function () { return this.len; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LocalStoreWrapper.prototype, "totalSizeChars", {
        get: function () { return this.totalDataSize; },
        enumerable: true,
        configurable: true
    });
    LocalStoreWrapper.prototype.clear = function () {
        this.store.clear();
        this.keys = this.keys != null ? [] : null;
        this.len = 0;
        this.totalDataSize = 0;
        this.modCount = 0;
    };
    LocalStoreWrapper.prototype.key = function (index) {
        return this.store.key(index);
    };
    LocalStoreWrapper.prototype.getItem = function (key, plainString) {
        if (!key) {
            throw new Error("cannot access item from store without an identifier key");
        }
        var value = this.store.getItem(key, true);
        return plainString === true ? value : (value != null ? JSON.parse(value) : null);
    };
    LocalStoreWrapper.prototype.hasItem = function (key) {
        return this.getItem(key, true) != null;
    };
    LocalStoreWrapper.prototype.setItem = function (key, value, plainString) {
        var jsonString = this.prepAndValidateValue(key, value, plainString);
        this.tryLogSetItem(key, jsonString);
    };
    LocalStoreWrapper.prototype.removeItem = function (key, plainString) {
        if (!key) {
            throw new Error("cannot remove item from store without an identifier key");
        }
        if (this.keys != null) {
            var existingData = this.store.getItem(key);
            this.logItemRemoved(key, existingData);
        }
        this.store.removeItem(key);
    };
    LocalStoreWrapper.prototype.getKeys = function () {
        var store = this.store;
        return this.keys != null ? this.keys : (store.getKeys ? store.getKeys() : Object.keys(store));
    };
    LocalStoreWrapper.prototype.getData = function (plainString) {
        var store = this.store;
        var resData = [];
        if (this.keys != null) {
            for (var i = 0, size = this.keys.length; i < size; i++) {
                resData.push(this.getItem(this.keys[i], plainString));
            }
        }
        else {
            for (var i = 0, size = store.length; i < size; i++) {
                resData.push(this.getItem(store.key(i), plainString));
            }
        }
        return resData;
    };
    LocalStoreWrapper.prototype.prepAndValidateValue = function (key, value, plainString) {
        if (!key) {
            throw new Error("cannot store item without an identifier key");
        }
        if (plainString === true && typeof value !== "string") {
            throw new Error("local store value = '" + value + "', plain string = true, but value is not a string");
        }
        var jsonString = plainString === true ? value : JSON.stringify(value);
        if (jsonString.length > this.MAX_ITEM_SIZE_BYTES) {
            var errMsg = "attempting to save too large a value to localStorage, key='" + key + "' size is " + jsonString.length + ", value='" + jsonString.substr(0, 100) + (jsonString.length > 100 ? "..." : "") + "'";
            if (console && typeof console.error === "function") {
                console.error(errMsg);
            }
            throw new Error(errMsg);
        }
        return jsonString;
    };
    LocalStoreWrapper.prototype.tryLogSetItem = function (key, value, retryAttempts) {
        if (retryAttempts === void 0) { retryAttempts = 1; }
        for (var attempt = 0; attempt <= retryAttempts; attempt++) {
            try {
                if (this.keys != null) {
                    var existingData = this.store.getItem(key);
                }
                // try setting the value (possibly multiple times)
                this.store.setItem(key, value, true);
                if (this.keys != null) {
                    this.logItemAdded(key, value, existingData);
                }
                if (attempt >= retryAttempts) {
                    break;
                }
            }
            catch (err) {
                try {
                    // clean out old data in-case the error was the local store running out of space
                    this.handleFullStore(this.store, err);
                }
                catch (e2) {
                    if (attempt >= retryAttempts) {
                        var errMsg = "problem: storing key-value '" + key + "' = '" + (value && value.substr ? value.substr(0, 100) : value) + "' in key-value store;" +
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
    LocalStoreWrapper.prototype.logItemAdded = function (key, value, existingValue) {
        if (existingValue === undefined) {
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
    LocalStoreWrapper.prototype.logItemRemoved = function (key, existingValue) {
        if (existingValue !== undefined) {
            this.len--;
            if (this.trackTotalSize) {
                this.totalDataSize -= existingValue.length;
            }
            this.modCount++;
            MemoryStore.removeAryItem(key, this.keys);
        }
    };
    LocalStoreWrapper.prototype.loadDataFrom = function (store, keyFilter) {
        var keys = store.getKeys ? store.getKeys() : Object.keys(store);
        for (var i = 0, size = keys.length; i < size; i++) {
            var key = keys[i];
            if (keyFilter == null || keyFilter(key) == true) {
                this.logItemAdded(key, store.getItem(key), undefined);
            }
        }
    };
    /**
     * @param store the underlying data store, this could be a string based store (i.e. native browser 'localStorage' or a MemoryStore instance) or it could be another LocalStore
     * @param handleFullStore the handler to call when 'store' fails to store an item
     * @param trackKeysAndLen true to track the number of items and item keys added to this store
     * @param trackTotalSize true to track the total data size of the items in this store, cannot be true if 'passThrough' is also true
     * @param maxValueSizeBytes an optional maximum size of values stored in this store
     * @param [loadExistingData] true to filter the keys from the 'store' and load those which match the 'keyFilter'
     * @param [keyFilter] an optional key filter used if 'loadExistingData'
     */
    LocalStoreWrapper.newInst = function (store, handleFullStore, trackKeysAndLen, trackTotalSize, maxValueSizeBytes, loadExistingData, keyFilter) {
        if (maxValueSizeBytes === void 0) { maxValueSizeBytes = 1000000; }
        return new LocalStoreWrapper(store, handleFullStore, trackKeysAndLen, trackTotalSize, maxValueSizeBytes, loadExistingData, keyFilter);
    };
    return LocalStoreWrapper;
}());
module.exports = LocalStoreWrapper;
