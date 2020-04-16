"use strict";
var MemoryStore = require("./MemoryStore");
/** A 'LocalStore' wrapper over an existing LocalStore for encapsulation, additional storage/retrival logic, etc.
 * @author TeamworkGuy2
 * @since 2016-3-24
 */
var LocalStoreWrapper = /** @class */ (function () {
    /**
     * @param store the underlying data store, this could be a string based store (i.e. native browser 'localStorage' or a MemoryStore instance) or it could be another LocalStore
     * @param handleFullStore the handler to call when 'store' fails to store an item
     * @param trackKeysAndLen true to track the number of items and item keys added to this store
     * @param trackTotalSize true to track the total data size of the items in this store
     * @param maxValueSizeBytes an optional maximum size of values stored in this store
     * @param loadExistingData optional flag to enable filtering the keys from the 'store' and load those which match the 'keyFilter'
     * @param keyFilter optional storage key filter used if 'loadExistingData'
     */
    function LocalStoreWrapper(store, handleFullStore, trackKeysAndLen, trackTotalSize, maxValueSizeBytes, loadExistingData, keyFilter) {
        if (maxValueSizeBytes === void 0) { maxValueSizeBytes = 1000000; }
        this.MAX_ITEM_SIZE_BYTES = 1000000;
        this.store = store;
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
    LocalStoreWrapper.prototype.getItem = function (key, plainString) {
        if (!key) {
            throw new Error("cannot access item from store without an identifier key");
        }
        var value = this.store.getItem(key, true);
        return plainString === true ? value : (value != null ? JSON.parse(value) : null);
    };
    LocalStoreWrapper.prototype.key = function (index) {
        return this.store.key(index);
    };
    LocalStoreWrapper.prototype.hasItem = function (key) {
        return this.getItem(key, true) != null;
    };
    LocalStoreWrapper.prototype.setItem = function (key, value, plainString) {
        var jsonString = this.prepAndValidateValue(key, value, plainString);
        this.trySetItem(key, jsonString);
    };
    LocalStoreWrapper.prototype.removeItem = function (key, plainString) {
        if (!key) {
            throw new Error("cannot remove item from store without an identifier key");
        }
        if (this.keys != null) {
            var existingData = this.store.getItem(key, true);
            this.logItemRemoved(key, existingData);
        }
        this.store.removeItem(key);
    };
    LocalStoreWrapper.prototype.getKeys = function () {
        var store = this.store;
        return this.keys != null ? this.keys : (store.getKeys ? store.getKeys() : Object.keys(store));
    };
    /** Get all of the values associated with the keys in this store
     * @param plainString whether to return the raw string values or parse all of them
     */
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
    /** Check whether a potential new key-value pair is valid or not
     */
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
            throw new Error(errMsg);
        }
        return jsonString;
    };
    /** Try to store the key-value pair in the underlying store and if an error occurs, run the full store handler and try inserting the value again,
     * up to a certain number of attempts (default: 1)
     */
    LocalStoreWrapper.prototype.trySetItem = function (key, value, retryAttempts) {
        if (retryAttempts === void 0) { retryAttempts = 1; }
        for (var attempt = 0; attempt <= retryAttempts; attempt++) {
            try {
                var existingData = undefined;
                if (this.keys != null) {
                    existingData = this.store.getItem(key, true);
                }
                // try setting the value (possibly multiple times)
                this.store.setItem(key, value, true);
                if (this.keys != null) {
                    this.logItemAdded(key, value, existingData);
                }
                return;
            }
            catch (err) {
                var err2 = undefined;
                try {
                    // clean out old data in-case the error was the local store running out of space
                    this.handleFullStore(this, err);
                }
                catch (e2) {
                    err2 = e2;
                }
                if (attempt >= retryAttempts) {
                    var errMsg = "problem: storing key-value '" + key + "' = '" + (value && value.substr ? value.substr(0, 100) : value) + "' (len: " + (value ? value.length : NaN) + ") in key-value store;" +
                        "context: storing the item threw an error, attempted to recover" + (retryAttempts > 1 ? " " + retryAttempts + " times" : "") +
                        (err2 != null ? ", but attempting to recover threw another error; " : "; ") +
                        "error: storing: " + err + (err2 != null ? ",\nclearing: " + err2 : "");
                    throw new Error(errMsg);
                }
            }
        }
    };
    LocalStoreWrapper.prototype.logItemAdded = function (key, newValue, existingValue) {
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
            this.totalDataSize += newValue.length;
        }
    };
    LocalStoreWrapper.prototype.logItemRemoved = function (key, existingValue) {
        if (existingValue != null) {
            this.len--;
            if (this.trackTotalSize) {
                this.totalDataSize -= existingValue.length;
            }
            this.modCount++;
            MemoryStore.removeAryItem(key, this.keys);
        }
    };
    /** Load an existing StorageLike object and add all of its key-value pairs
     * @param store the StorageLike object to load (with an optional getKeys() function)
     * @param keyFilter optional filter to skip loading keys from the 'store'
     */
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
     * @param trackTotalSize true to track the total data size of the items in this store
     * @param maxValueSizeBytes an optional maximum size of values stored in this store
     * @param loadExistingData optional flag to enable filtering the keys from the 'store' and load those which match the 'keyFilter'
     * @param keyFilter optional storage key filter used if 'loadExistingData'
     */
    LocalStoreWrapper.newInst = function (store, handleFullStore, trackKeysAndLen, trackTotalSize, maxValueSizeBytes, loadExistingData, keyFilter) {
        if (maxValueSizeBytes === void 0) { maxValueSizeBytes = 1000000; }
        return new LocalStoreWrapper(store, handleFullStore, trackKeysAndLen, trackTotalSize, maxValueSizeBytes, loadExistingData, keyFilter);
    };
    return LocalStoreWrapper;
}());
module.exports = LocalStoreWrapper;
