"use strict";
var LocalStoreByTimestamp = require("./LocalStoreByTimestamp");
/** LocalStoreDefault namespace
 * simple persistent storage interface for small objects or data blobs
 * @author TeamworkGuy2
 * @since 2016-3-24
 */
var LocalStoreDefault = (function () {
    function LocalStoreDefault(store, maxValueSizeBytes) {
        if (maxValueSizeBytes === void 0) { maxValueSizeBytes = 1000000; }
        this.MAX_ITEM_SIZE_BYTES = 1000000;
        this.keyValueStore = store;
        this.MAX_ITEM_SIZE_BYTES = maxValueSizeBytes;
    }
    Object.defineProperty(LocalStoreDefault.prototype, "length", {
        get: function () { return this.keyValueStore.length; },
        enumerable: true,
        configurable: true
    });
    LocalStoreDefault.prototype.key = function (index) {
        return this.keyValueStore.key(index);
    };
    LocalStoreDefault.prototype.clear = function () {
        this.keyValueStore.clear();
    };
    LocalStoreDefault.prototype.getItem = function (key, plainString) {
        if (!key) {
            throw new Error("cannot access item from store without an identifier key");
        }
        key = key.trim();
        var value = this.keyValueStore.getItem(key);
        return plainString === true ? value : (value != null ? JSON.parse(value) : null);
    };
    LocalStoreDefault.prototype.hasItem = function (key) {
        return this.getItem(key, true) != null;
    };
    LocalStoreDefault.prototype.setItem = function (key, value, plainString) {
        if (!key) {
            throw new Error("cannot store item without an identifier key");
        }
        key = key.trim();
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
        this.tryLogSetItem(key, jsonString);
    };
    LocalStoreDefault.prototype.removeItem = function (key, plainString) {
        if (!key) {
            throw new Error("cannot remove item from store without an identifier key");
        }
        key = key.trim();
        this.keyValueStore.removeItem(key);
    };
    LocalStoreDefault.prototype.getKeys = function () {
        var store = this.keyValueStore;
        return store.getKeys ? store.getKeys() : Object.keys(store);
    };
    LocalStoreDefault.prototype.getData = function (plainString) {
        var store = this.keyValueStore;
        var resData = [];
        for (var i = 0, size = store.length; i < size; i++) {
            resData.push(this.getItem(store.key(i), plainString));
        }
        return resData;
    };
    LocalStoreDefault.prototype.tryLogSetItem = function (key, value, retryAttempts) {
        if (retryAttempts === void 0) { retryAttempts = 1; }
        for (var attempt = 0; attempt <= retryAttempts; attempt++) {
            try {
                // try setting the value (possibly multiple times)
                this.keyValueStore.setItem(key, value);
                if (attempt >= retryAttempts) {
                    break;
                }
            }
            catch (err) {
                try {
                    // clean out old data in-case the error was the local store running out of space
                    LocalStoreByTimestamp.getDefaultInst(LocalStoreDefault.getDefaultInst()).handleFullStore(err);
                }
                catch (e2) {
                    if (attempt >= retryAttempts) {
                        var errMsg = "problem: storing key-value '" + key + "' = '" + value.substr(0, 100) + "' in key-value store;" +
                            "context: storing the item threw an error, attempted to recover" + (retryAttempts > 1 ? " " + retryAttempts + " times" : "") + ", but clearing old data from the store threw another error: " + err;
                        if (console && typeof console.error === "function") {
                            console.error(errMsg);
                            console.error(err.message, err.stack);
                        }
                        throw new Error(errMsg);
                    }
                }
            }
        }
    };
    LocalStoreDefault.newInst = function (store, maxValueSizeBytes) {
        return new LocalStoreDefault(store, maxValueSizeBytes);
    };
    LocalStoreDefault.getDefaultInst = function () {
        return LocalStoreDefault.defaultInst || (LocalStoreDefault.defaultInst = new LocalStoreDefault(localStorage));
    };
    LocalStoreDefault.getSessionInst = function () {
        return LocalStoreDefault.sessionInst || (LocalStoreDefault.sessionInst = new LocalStoreDefault(sessionStorage));
    };
    return LocalStoreDefault;
}());
module.exports = LocalStoreDefault;
