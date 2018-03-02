"use strict";
var LocalStoreEntry;
(function (LocalStoreEntry) {
    var Array = /** @class */ (function () {
        function Array(store, key, defaultValue) {
            this.store = store;
            this.key = key;
            this.defaultValue = defaultValue;
        }
        Array.prototype.get = function () {
            var res = this.store.getItem(this.key);
            return res != null ? res : this.defaultValue;
        };
        Array.prototype.getRaw = function () {
            return this.store.getItem(this.key, true);
        };
        Array.prototype.set = function (data) {
            this.store.setItem(this.key, data);
        };
        Array.prototype.remove = function () {
            this.store.removeItem(this.key);
        };
        return Array;
    }());
    LocalStoreEntry.Array = Array;
    var Var = /** @class */ (function () {
        function Var(store, key, defaultValue, alwaysRaw) {
            if (alwaysRaw === void 0) { alwaysRaw = false; }
            this.store = store;
            this.key = key;
            this.defaultValue = defaultValue;
            this.plainStr = alwaysRaw;
        }
        Var.prototype.get = function () {
            var res = this.store.getItem(this.key, this.plainStr);
            return res != null ? res : this.defaultValue;
        };
        Var.prototype.getRaw = function () {
            return this.store.getItem(this.key, true);
        };
        Var.prototype.set = function (data) {
            this.store.setItem(this.key, data, this.plainStr);
        };
        Var.prototype.remove = function () {
            this.store.removeItem(this.key);
        };
        return Var;
    }());
    LocalStoreEntry.Var = Var;
    var MapIndividualKeys = /** @class */ (function () {
        function MapIndividualKeys(store, keyGen) {
            this.store = store;
            this.keyGen = keyGen;
        }
        MapIndividualKeys.prototype.get = function (key) {
            var resKey = this.keyGen(key);
            return this.store.getItem(resKey);
        };
        MapIndividualKeys.prototype.getRaw = function (key) {
            var resKey = this.keyGen(key);
            return this.store.getItem(resKey, true);
        };
        MapIndividualKeys.prototype.set = function (key, data) {
            var resKey = this.keyGen(key);
            this.store.setItem(resKey, data);
        };
        MapIndividualKeys.prototype.remove = function (key) {
            var resKey = this.keyGen(key);
            this.store.removeItem(resKey);
        };
        return MapIndividualKeys;
    }());
    LocalStoreEntry.MapIndividualKeys = MapIndividualKeys;
    function newArray(store, key, defaultValue) {
        return new Array(store, key, defaultValue);
    }
    LocalStoreEntry.newArray = newArray;
    function newVar(store, key, defaultValue, alwaysRaw) {
        return new Var(store, key, defaultValue, alwaysRaw);
    }
    LocalStoreEntry.newVar = newVar;
    function newMapWithIndividualKeys(store, keyGen) {
        return new MapIndividualKeys(store, keyGen);
    }
    LocalStoreEntry.newMapWithIndividualKeys = newMapWithIndividualKeys;
})(LocalStoreEntry || (LocalStoreEntry = {}));
module.exports = LocalStoreEntry;
