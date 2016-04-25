"use strict";
var MemoryStore = require("../../local-store/MemoryStore");
var LocalStoreFromStorage = require("../../local-store/LocalStoreFromStorage");
var LocalStoreWrapper = require("../../local-store/LocalStoreWrapper");
var ClearFullStore = require("../../local-store/ClearFullStore");
var CommonStorageTests = require("./CommonStorageTests");
function simpleStringHashCode(str) {
    return (str.length > 0 ? str.charCodeAt(0) << 16 : 0) +
        (str.length > 1 ? str.charCodeAt(1) : 0);
}
QUnit.module("LocalStoreFromStorage", {});
QUnit.test("local-store-from-storage-1", function LocalStoreFromStorageScenario1Test(sr) {
    var memBaseStore = MemoryStore.newInst();
    var store = LocalStoreFromStorage.newInst(memBaseStore, null, null, true, true, 20, false);
    sr.equal(store.getItem("a"), null);
    store.setItem("b", { b: 1 });
    store.setItem("a", { a: 1 });
    store.setItem("a", { a: 2 });
    sr.equal(store.length, 2);
    sr.deepEqual(store.getKeys(), ["b", "a"]);
    sr.equal(store.hasItem("a"), true);
    sr.equal(store.hasItem("c"), false);
    store.removeItem("a");
    store.removeItem("b");
    sr.equal(store.length, 0);
    sr.equal(store.hasItem("undefined"), false);
    store.setItem("c", { c: 1 });
    store.setItem("a", { a: 3 });
    sr.deepEqual(store.getItem("a"), { a: 3 });
    sr.deepEqual(store.getItem("c"), { c: 1 });
    store.clear();
    sr.equal(store.length, 0);
    sr.equal(store.getItem("a"), null);
    sr.equal(store.hasItem("c"), false);
    CommonStorageTests.cornerCaseKeyNames(sr, store, true);
    sr.throws(function () { return store.setItem("long-key", "abcdefghijklmnopqrstuvwxyz"); });
});
QUnit.test("local-store-from-storage-clear-full", function LocalStoreFromStorageClearFull(sr) {
    var itemsRemovedFunc;
    var removePercentage = 0.49;
    var memStore = MemoryStore.newInst(undefined, 3);
    var fullStoreHandler = ClearFullStore.newInst(function (key) { return parseInt(key.substr(key.lastIndexOf('-') + 1)); }, function (store, items, err, removedCount) { return itemsRemovedFunc(store, items, err, removedCount); }, removePercentage);
    var baseStore = LocalStoreFromStorage.newInst(memStore, null, null, true, false, 80, false);
    // ---- test exceeding max items and removing 1 item ----
    // assuming removal-percentage-when-full is less than 50%
    baseStore.setItem("one-123", { value: "one" });
    baseStore.setItem("two-22", { value: "two" });
    baseStore.setItem("three-300", { value: "three" });
    var store = LocalStoreWrapper.newInst(baseStore, function (store, err) { return fullStoreHandler.clearOldItems(store, true, err); }, true, true, undefined, true);
    // setup a local store full callback which sets the 'errorRef' variable
    var errorRef = null;
    itemsRemovedFunc = function (store, removedItems, storageError, removedCount) {
        errorRef = { store: store, removedItems: removedItems, storageError: storageError, removedCount: removedCount };
    };
    // add the fourth item, exceeding the 3 item limit, the error callback should be called
    store.setItem("four-40", { value: "four" });
    sr.notEqual(errorRef, null);
    sr.equal(errorRef.store, store);
    checkStoreFullErrorData(sr, errorRef, {
        "two-22": { value: "two" }
    });
    errorRef = null;
    // add another item, exceeding the 3 item limit again
    store.setItem("five-55", { value: "five" });
    sr.notEqual(errorRef, null);
    checkStoreFullErrorData(sr, errorRef, {
        "four-40": { value: "four" }
    });
    errorRef = null;
    // add two items, exceeding the 4 item limit
    sr.deepEqual(store.getKeys().sort(), ["five-55", "one-123", "three-300"]);
    memStore.setValidation(undefined, 4);
    store.setItem("six-60", { value: "six" });
    sr.equal(errorRef, null);
    store.setItem("seven-7", { value: "seven" });
    sr.notEqual(errorRef, null);
    checkStoreFullErrorData(sr, errorRef, {
        "five-55": { value: "five" },
        "six-60": { value: "six" }
    });
    sr.deepEqual(store.getKeys().sort(), ["one-123", "seven-7", "three-300"]);
});
QUnit.test("local-store-from-storage-load-existing", function LocalStoreFromStorageLoadExisting(sr) {
    var fullStoreHandler = ClearFullStore.newInst(function (key) { return (key.length > 0 ? key.charCodeAt(0) << 16 : 0) + (key.length > 1 ? key.charCodeAt(1) : 0); });
    var baseStore = LocalStoreFromStorage.newInst(MemoryStore.newInst(), null, null, true, false, 50, false);
    baseStore.setItem("one", { value: "one" });
    baseStore.setItem("two", { value: "two" });
    baseStore.setItem("three", { value: "three" });
    var wrapper1 = LocalStoreWrapper.newInst(baseStore, function (store, err) { return fullStoreHandler.clearOldItems(store, true, err); }, true, true, undefined, true);
    sr.deepEqual(wrapper1.getKeys().sort(), baseStore.getKeys().sort());
    // modify an item
    wrapper1.setItem("one", { value: "1" });
    sr.deepEqual(wrapper1.getItem("one"), baseStore.getItem("one"));
    // add an item via the wrapper
    wrapper1.setItem("four", { value: "four" });
    sr.deepEqual(wrapper1.getKeys().sort(), baseStore.getKeys().sort());
    // add an item via the base
    baseStore.setItem("five", { value: "five" });
    sr.equal(wrapper1.getKeys().indexOf("five") < 0, baseStore.getKeys().indexOf("five") > -1);
});
function checkStoreFullErrorData(sr, errRef, expectedItems) {
    sr.notEqual(errRef, null);
    var expectedKeys = Object.keys(expectedItems);
    sr.equal(errRef.removedItems.length, expectedKeys.length, "expected " + expectedKeys.length + " error items, received " + errRef.removedItems.length);
    for (var i = 0, size = expectedKeys.length; i < size; i++) {
        var key = expectedKeys[i];
        var errItem = errRef.removedItems[i];
        sr.equal(errItem.key, key, "keys mismatch: actual=" + errItem.key + ", expected=" + key + ",\n\t" +
            "removed keys: " + errRef.removedItems.map(function (s) { return s.key; }).join(",") + ",\n\t" +
            "removed count: " + errRef.removedCount);
        sr.deepEqual(errItem.value, expectedItems[key]);
    }
}
