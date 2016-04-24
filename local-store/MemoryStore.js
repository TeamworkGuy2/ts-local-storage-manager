"use strict";
/** An in-memory 'localStorage' like class
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
var MemoryStore = (function () {
    function MemoryStore() {
        this.data = {};
        this.len = 0;
        this.keys = [];
        this.modCount = 0;
    }
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
        this.data[key] = dataStr;
        this.logItemAdded(key, dataStr, existingData);
    };
    MemoryStore.prototype.getKeys = function () {
        return this.keys;
    };
    MemoryStore.prototype.logItemAdded = function (key, value, existingValue) {
        var exists = existingValue !== undefined;
        if (!exists) {
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
        var exists = existingValue !== undefined;
        if (exists) {
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
    MemoryStore.newInst = function () {
        return new MemoryStore();
    };
    return MemoryStore;
}());
module.exports = MemoryStore;
