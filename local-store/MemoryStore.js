"use strict";
/** An in-memory 'localStorage' like class
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
var MemoryStore = /** @class */ (function () {
    /**
     * @param [maxDataSize] optional, inclusive limit on the total size (sum of string lengths) of all the data stored in this store, if this value is exceeded when calling setItem() an error is thrown
     * @param [maxItems] optional, inclusive limit on the total number of items stored in this store, if this value is exceeded when calling setItem() an error is thrown
     */
    function MemoryStore(maxDataSize, maxItems) {
        // copied from clear() to appease TS compiler
        this.data = {};
        this.keys = [];
        this.len = 0;
        this.totalDataSize = 0;
        this.modCount = 0;
        this.validateBeforeSet = null;
        this.setValidation(maxDataSize, maxItems);
    }
    /**
     * @param [maxDataSize] optional, inclusive limit on the total size (sum of string lengths) of all the data stored in this store, if this value is exceeded when calling setItem() an error is thrown
     * @param [maxItems] optional, inclusive limit on the total number of items stored in this store, if this value is exceeded when calling setItem() an error is thrown
     */
    MemoryStore.prototype.setValidation = function (maxDataSize, maxItems) {
        var _this = this;
        if (maxDataSize != null || maxItems != null) {
            if (maxDataSize != null) {
                this.validateBeforeSet = function (key, value, existingValue) {
                    return _this.totalDataSize + value.length - (existingValue !== undefined ? existingValue.length : 0) <= maxDataSize;
                };
            }
            else if (maxItems != null) {
                this.validateBeforeSet = function (key, value, existingValue) {
                    return _this.len + (existingValue === undefined ? 1 : 0) <= maxItems;
                };
            }
        }
    };
    Object.defineProperty(MemoryStore.prototype, "length", {
        get: function () { return this.len; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MemoryStore.prototype, "totalSizeChars", {
        get: function () { return this.totalDataSize; },
        enumerable: true,
        configurable: true
    });
    MemoryStore.prototype.clear = function () {
        this.data = {};
        this.keys = [];
        this.len = 0;
        this.totalDataSize = 0;
        this.modCount = 0;
    };
    MemoryStore.prototype.getItem = function (key) {
        var value = this.data[key];
        return value;
    };
    MemoryStore.prototype.key = function (index) {
        return this.keys[index];
    };
    MemoryStore.prototype.removeItem = function (key) {
        var existingData = this.data[key];
        if (existingData !== undefined) {
            delete this.data[key];
        }
        this.logItemRemoved(key, existingData);
    };
    MemoryStore.prototype.setItem = function (key, data) {
        key = key === undefined ? "undefined" : (key === null ? "null" : key);
        var existingData = this.data[key];
        var dataStr = data === undefined ? "undefined" : (data === null ? "null" : data.toString());
        this.checkLimitsBeforeAdd(key, dataStr, existingData);
        this.data[key] = dataStr;
        this.logItemAdded(key, dataStr, existingData);
    };
    MemoryStore.prototype.getKeys = function () {
        return this.keys;
    };
    /** Checks that default and user specified limits are enforced and throws errors otherwise
     */
    MemoryStore.prototype.checkLimitsBeforeAdd = function (key, value, existingValue) {
        var allow = this.validateBeforeSet == null || this.validateBeforeSet(key, value, existingValue);
        if (!allow) {
            throw new Error("in-memory store size limit quota reached");
        }
    };
    MemoryStore.prototype.logItemAdded = function (key, value, existingValue) {
        if (existingValue === undefined) {
            this.len++;
            this.modCount++;
            this.keys.push(key);
        }
        else {
            this.totalDataSize -= existingValue.length;
        }
        this.totalDataSize += value.length;
    };
    MemoryStore.prototype.logItemRemoved = function (key, existingValue) {
        if (existingValue !== undefined) {
            this.len--;
            this.totalDataSize -= existingValue.length;
            this.modCount++;
            MemoryStore.removeAryItem(key, this.keys);
        }
    };
    MemoryStore.removeAryItem = function (key, keys) {
        var idx = keys.indexOf(key);
        var size = keys.length;
        if (idx === size - 1) {
            keys.pop();
        }
        else if (idx === 0) {
            keys.shift();
        }
        else {
            for (var i = idx; i < size - 1; i++) {
                keys[i] = keys[i + 1];
            }
            keys.pop();
        }
    };
    /** Create a memory store with optional limits on the stored data
     * @param [maxDataSize] optional, inclusive limit on the total size (sum of string lengths) of all the data stored in this store, if this value is exceeded when calling setItem() an error is thrown
     * @param [maxItems] optional, inclusive limit on the total number of items stored in this store, if this value is exceeded when calling setItem() an error is thrown
     */
    MemoryStore.newInst = function (maxDataSize, maxItems) {
        return new MemoryStore(maxDataSize, maxItems);
    };
    return MemoryStore;
}());
module.exports = MemoryStore;
