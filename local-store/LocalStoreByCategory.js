"use strict";
var LocalStoreByTimestamp = require("./LocalStoreByTimestamp");
var LocalStoreWrapper = require("./LocalStoreWrapper");
var ClearFullStore = require("./ClearFullStore");
/**
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
var LocalStoreByCategory = (function () {
    function LocalStoreByCategory(rootStore, timestampKeyGenerator, storeMap) {
        this.rootStore = rootStore;
        this.timestampKeyGenerator = timestampKeyGenerator;
        this.stores = {};
        var keys = Object.keys(storeMap);
        for (var i = 0, size = keys.length; i < size; i++) {
            this.stores[keys[i]] = storeMap[keys[i]];
        }
    }
    LocalStoreByCategory.prototype.getStore = function (category) {
        var store = this.stores[category];
        return store;
    };
    LocalStoreByCategory.prototype.getStoresContainingData = function () {
        var storesWithData = {};
        var keys = Object.keys(this.stores);
        for (var i = 0, size = keys.length; i < size; i++) {
            var categoryStore = this.stores[keys[i]];
            if (categoryStore.length > 0) {
                storesWithData[keys[i]] = categoryStore;
            }
        }
        return storesWithData;
    };
    return LocalStoreByCategory;
}());
var LocalStoreByCategory;
(function (LocalStoreByCategory) {
    var Builder = (function () {
        function Builder(storeInst, keyGenerator) {
            this.storeInst = storeInst;
            this.keyGenerator = keyGenerator;
            this.stores = {};
        }
        Builder.prototype.addStores = function (stores) {
            var keys = Object.keys(stores);
            for (var i = 0, size = keys.length; i < size; i++) {
                this.stores[keys[i]] = stores[keys[i]];
            }
            return this;
        };
        Builder.prototype.build = function () {
            return new LocalStoreByCategory(this.storeInst, this.keyGenerator, this.stores);
        };
        Builder.prototype.toStore = function (categorizer, maxValueSizeBytes, removePercentage) {
            var _this = this;
            var fullStoreHandler = new ClearFullStore(function (key) { return Number.parseInt(categorizer.unmodifyKey(key)); }, removePercentage);
            var fullStoreHandlerFunc = function (storeInst, err) { return fullStoreHandler.clearOldItems(storeInst, false, err); };
            var storeWrapper = LocalStoreWrapper.newInst(this.storeInst, fullStoreHandlerFunc, true, true, maxValueSizeBytes, true, function (key) { return categorizer.isMatchingCategory(key); });
            return new LocalStoreByTimestamp(storeWrapper, function () { return categorizer.modifyKey(_this.keyGenerator() + ''); }, fullStoreHandlerFunc);
        };
        Builder.newInst = function (storeInst, keyGenerator) {
            return new Builder(storeInst, keyGenerator);
        };
        return Builder;
    }());
    LocalStoreByCategory.Builder = Builder;
})(LocalStoreByCategory || (LocalStoreByCategory = {}));
module.exports = LocalStoreByCategory;
