"use strict";
/**
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
var LocalStoreByCategory = (function () {
    function LocalStoreByCategory(rootStore, storeFactory, timestampKeyGenerator, singleCategorizers, multiCategorizers) {
        this.rootStore = rootStore;
        this.storeFactory = storeFactory;
        this.timestampKeyGenerator = timestampKeyGenerator;
        this.categorizedStores = {};
        this.singleCategorizers = singleCategorizers;
        this.multiCategorizers = multiCategorizers;
    }
    LocalStoreByCategory.prototype.getItem = function (key, plainString) {
        return this.rootStore.getItem(key, plainString);
    };
    LocalStoreByCategory.prototype.hasItem = function (key) {
        return this.rootStore.hasItem(key);
    };
    LocalStoreByCategory.prototype.getKeys = function () {
        return this.rootStore.getKeys();
    };
    LocalStoreByCategory.prototype.addItem = function (value, plainString) {
        var key = this.timestampKeyGenerator() + '';
        this.setItem(key, value, plainString);
        return key;
    };
    LocalStoreByCategory.prototype.setItem = function (key, value, plainString) {
        var category = this.findCategory(key, value);
        if (category == null) {
            throw new Error("item key '" + key.substr(0, 100) + "' does not match any of this store's categories");
        }
        this.rootStore.setItem(key, value, plainString);
        var categoryStore = this.getCategoryStore(category);
        categoryStore.setItem(key, value, plainString);
    };
    LocalStoreByCategory.prototype.removeItem = function (key, plainString) {
        var value = this.rootStore.getItem(key, plainString);
        this.rootStore.removeItem(key);
        var category = this.findCategory(key, value);
        var categoryStore = this.getCategoryStore(category);
        categoryStore.removeItem(key);
    };
    LocalStoreByCategory.prototype.getCategoryStore = function (category) {
        var categoryStore = this.categorizedStores[category];
        if (categoryStore === undefined) {
            categoryStore = this.storeFactory();
            categoryStore.category = category;
            this.categorizedStores[category] = categoryStore;
        }
        return categoryStore;
    };
    LocalStoreByCategory.prototype.getCategoryStoresWithData = function () {
        var storesWithData = {};
        var categoryKeys = Object.keys(this.categorizedStores);
        for (var i = 0, size = categoryKeys.length; i < size; i++) {
            var categoryStore = this.categorizedStores[categoryKeys[i]];
            if (categoryStore.length > 0) {
                storesWithData[categoryKeys[i]] = categoryStore;
            }
        }
        return storesWithData;
    };
    LocalStoreByCategory.prototype.getKeyValueCategory = function (key, value) {
        var category = this.findCategory(key, value);
        return category;
    };
    LocalStoreByCategory.prototype.findCategory = function (key, value) {
        var sCategories = this.singleCategorizers;
        for (var i = 0, size = sCategories.length; i < size; i++) {
            if (sCategories[i].isMatch(key, value)) {
                return sCategories[i].category;
            }
        }
        var mCategories = this.multiCategorizers;
        for (var i = 0, size = mCategories.length; i < size; i++) {
            var category;
            if ((category = mCategories[i].findMatch(key, value)) != null) {
                return category;
            }
        }
        return null;
    };
    LocalStoreByCategory.newInst = function (storeInst, storeFactory, timestampKeyGenerator, singleCategorizers, multiCategorizers) {
        return new LocalStoreByCategory(storeInst, storeFactory, timestampKeyGenerator, singleCategorizers, multiCategorizers);
    };
    return LocalStoreByCategory;
}());
module.exports = LocalStoreByCategory;
