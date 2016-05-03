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
        var _this = this;
        this.rootStore = rootStore;
        this.timestampKeyGenerator = timestampKeyGenerator;
        this.stores = {};
        this.fullStoreHandlers = {};
        var handleFullStore = function (store, err) {
            _this.handleFullStores(store, err);
        };
        var keys = Object.keys(storeMap);
        this.storeNames = keys;
        for (var i = 0, size = keys.length; i < size; i++) {
            var key = keys[i];
            var store = storeMap[key];
            store.handleFullStoreCallback = handleFullStore;
            this.stores[key] = store.store;
            this.fullStoreHandlers[key] = store;
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
    LocalStoreByCategory.prototype.handleFullStores = function (store, err) {
        // loop through and clear each store when one is full since they all share the same base store
        for (var i = 0, size = this.storeNames.length; i < size; i++) {
            var name = this.storeNames[i];
            var categoryStore = this.fullStoreHandlers[name];
            var res = categoryStore.clearFullStore.clearOldItems(categoryStore.baseStore, false, err);
        }
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
            this.tmpStores = [];
            this.tmpCategoryStores = [];
        }
        Builder.prototype.addStores = function (stores) {
            var keys = Object.keys(stores);
            for (var i = 0, size = keys.length; i < size; i++) {
                var key = keys[i];
                var store = stores[key];
                var idx = this.tmpStores.indexOf(store);
                var categoryStore = this.tmpCategoryStores[idx];
                Builder.removeIdx(this.tmpStores, idx);
                Builder.removeIdx(this.tmpCategoryStores, idx);
                this.stores[key] = categoryStore;
            }
            return this;
        };
        Builder.prototype.build = function () {
            return new LocalStoreByCategory(this.storeInst, this.keyGenerator, this.stores);
        };
        Builder.prototype.toStore = function (categorizer, itemsRemovedCallback, maxValueSizeBytes, removePercentage) {
            var _this = this;
            var clearFullStore = ClearFullStore.newInst(function (key) { return Number.parseInt(categorizer.unmodifyKey(key)); }, itemsRemovedCallback, removePercentage);
            var res = {
                baseStore: null,
                categorizer: categorizer,
                clearFullStore: clearFullStore,
                handleFullStore: null,
                handleFullStoreCallback: null,
                store: null,
            };
            var fullStoreHandlerFunc = function (storeInst, err) { return res.handleFullStoreCallback(storeInst, err); };
            var storeWrapper = LocalStoreWrapper.newInst(this.storeInst, fullStoreHandlerFunc, true, true, maxValueSizeBytes, true, function (key) { return categorizer.isMatchingCategory(key); });
            res.handleFullStore = fullStoreHandlerFunc;
            //res.handleFullStoreCallback = null;
            res.baseStore = storeWrapper;
            res.store = new LocalStoreByTimestamp(storeWrapper, function () { return categorizer.modifyKey(_this.keyGenerator() + ''); }, fullStoreHandlerFunc);
            this.tmpStores.push(res.store);
            this.tmpCategoryStores.push(res);
            return res.store;
        };
        Builder.newInst = function (storeInst, keyGenerator) {
            return new Builder(storeInst, keyGenerator);
        };
        Builder.removeIdx = function (ary, index) {
            if (ary == null) {
                return ary;
            }
            var size = ary.length;
            if (ary.length < 1 || index < 0 || index >= ary.length) {
                return ary;
            }
            for (var i = index + 1; i < size; i++) {
                ary[i - 1] = ary[i];
            }
            ary[size - 1] = null;
            ary.length = size - 1;
            return ary;
        };
        return Builder;
    }());
    LocalStoreByCategory.Builder = Builder;
})(LocalStoreByCategory || (LocalStoreByCategory = {}));
module.exports = LocalStoreByCategory;
