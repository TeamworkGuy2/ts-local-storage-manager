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
    MemoryStore.prototype.clear = function () {
        this.data = {};
        this.keys = [];
        this.len = 0;
        this.modCount = 0;
    };
    MemoryStore.prototype.getItem = function (key) {
        var value = this.data[key];
        return value === undefined ? null : value;
    };
    MemoryStore.prototype.key = function (index) {
        return this.keys[index];
    };
    MemoryStore.prototype.removeItem = function (key) {
        var exists = this.data[key] !== undefined;
        if (exists) {
            delete this.data[key];
            this.len--;
            this.modCount++;
            MemoryStore.removeAryItem(key, this.keys);
        }
    };
    MemoryStore.prototype.setItem = function (key, data) {
        key = key === undefined ? "undefined" : (key === null ? "null" : key);
        var exists = this.data[key] !== undefined;
        this.data[key] = data === undefined ? "undefined" : (data === null ? "null" : data.toString());
        if (!exists) {
            this.len++;
            this.modCount++;
            this.keys.push(key);
        }
    };
    MemoryStore.prototype.getKeys = function () {
        return this.keys;
    };
    MemoryStore.removeAryItem = function (key, keys) {
        var idx = keys.indexOf(key);
        var size = keys.length;
        if (idx == size - 1) {
            keys.pop();
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
