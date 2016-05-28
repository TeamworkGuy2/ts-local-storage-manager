/// <reference path="../../definitions/node/node.d.ts" />
/// <reference path="../../definitions/node/node-modules-custom.d.ts" />
/// <reference path="../../definitions/lib/chai.d.ts" />
/// <reference path="../../definitions/lib/mocha.d.ts" />
"use strict";
var chai = require("chai");
var MemoryStore = require("../local-store/MemoryStore");
var LocalStorageStore = require("../local-store/LocalStorageStore");
var LocalStoreWrapper = require("../local-store/LocalStoreWrapper");
var ClearFullStore = require("../local-store/ClearFullStore");
var CommonStorageTests = require("./CommonStorageTests");
var asr = chai.assert;
suite("LocalStorageStore", function LocalStoreStorageTest() {
    test("local-store-from-storage-1", function LocalStorageStoreScenario1Test() {
        var memBaseStore = MemoryStore.newInst();
        var store = LocalStorageStore.newInst(memBaseStore, null, null, true, true, 20, false);
        asr.equal(store.getItem("a"), null);
        store.setItem("b", { b: 1 });
        store.setItem("a", { a: 1 });
        store.setItem("a", { a: 2 });
        asr.equal(store.length, 2);
        asr.deepEqual(store.getKeys(), ["b", "a"]);
        asr.equal(store.hasItem("a"), true);
        asr.equal(store.hasItem("c"), false);
        store.removeItem("a");
        store.removeItem("b");
        asr.equal(store.length, 0);
        asr.equal(store.hasItem("undefined"), false);
        store.setItem("c", { c: 1 });
        store.setItem("a", { a: 3 });
        asr.deepEqual(store.getItem("a"), { a: 3 });
        asr.deepEqual(store.getItem("c"), { c: 1 });
        store.clear();
        asr.equal(store.length, 0);
        asr.equal(store.getItem("a"), null);
        asr.equal(store.hasItem("c"), false);
        CommonStorageTests.cornerCaseKeyNames(asr, store, true);
        asr.throws(function () { return store.setItem("long-key", "abcdefghijklmnopqrstuvwxyz"); });
    });
    test("local-store-from-storage-clear-full", function LocalStorageStoreClearFull() {
        var itemsRemovedFunc;
        var removePercentage = 0.49;
        var memStore = MemoryStore.newInst(undefined, 3);
        var fullStoreHandler = ClearFullStore.newInst(function (key) { return parseInt(key.substr(key.lastIndexOf('-') + 1)); }, function (store, items, err, removedCount) { return itemsRemovedFunc(store, items, err, removedCount); }, removePercentage);
        var baseStore = LocalStorageStore.newInst(memStore, null, null, true, false, 80, false);
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
        asr.notEqual(errorRef, null);
        asr.equal(errorRef.store, store);
        checkStoreFullErrorData(errorRef, {
            "two-22": JSON.stringify({ value: "two" })
        });
        errorRef = null;
        // add another item, exceeding the 3 item limit again
        store.setItem("five-55", { value: "five" });
        asr.notEqual(errorRef, null);
        checkStoreFullErrorData(errorRef, {
            "four-40": JSON.stringify({ value: "four" })
        });
        errorRef = null;
        // add two items, exceeding the 4 item limit
        asr.deepEqual(store.getKeys().sort(), ["five-55", "one-123", "three-300"]);
        memStore.setValidation(undefined, 4);
        store.setItem("six-60", { value: "six" });
        asr.equal(errorRef, null);
        store.setItem("seven-7", { value: "seven" });
        asr.notEqual(errorRef, null);
        checkStoreFullErrorData(errorRef, {
            "five-55": JSON.stringify({ value: "five" }),
            "six-60": JSON.stringify({ value: "six" })
        });
        asr.deepEqual(store.getKeys().sort(), ["one-123", "seven-7", "three-300"]);
    });
    test("local-store-from-storage-load-existing", function LocalStorageStoreLoadExisting() {
        var fullStoreHandler = ClearFullStore.newInst(function (key) { return (key.length > 0 ? key.charCodeAt(0) << 16 : 0) + (key.length > 1 ? key.charCodeAt(1) : 0); });
        var baseStore = LocalStorageStore.newInst(MemoryStore.newInst(), null, null, true, false, 50, false);
        baseStore.setItem("one", { value: "one" });
        baseStore.setItem("two", { value: "two" });
        baseStore.setItem("three", { value: "three" });
        var wrapper1 = LocalStoreWrapper.newInst(baseStore, function (store, err) { return fullStoreHandler.clearOldItems(store, true, err); }, true, true, undefined, true);
        asr.deepEqual(wrapper1.getKeys().sort(), baseStore.getKeys().sort());
        // modify an item
        wrapper1.setItem("one", { value: "1" });
        asr.deepEqual(wrapper1.getItem("one"), baseStore.getItem("one"));
        // add an item via the wrapper
        wrapper1.setItem("four", { value: "four" });
        asr.deepEqual(wrapper1.getKeys().sort(), baseStore.getKeys().sort());
        // add an item via the base
        baseStore.setItem("five", { value: "five" });
        asr.equal(wrapper1.getKeys().indexOf("five") < 0, baseStore.getKeys().indexOf("five") > -1);
    });
    function simpleStringHashCode(str) {
        return (str.length > 0 ? str.charCodeAt(0) << 16 : 0) +
            (str.length > 1 ? str.charCodeAt(1) : 0);
    }
    function checkStoreFullErrorData(errRef, expectedItems) {
        asr.notEqual(errRef, null);
        var expectedKeys = Object.keys(expectedItems);
        asr.equal(errRef.removedItems.length, expectedKeys.length, "expected " + expectedKeys.length + " error items, received " + errRef.removedItems.length);
        for (var i = 0, size = expectedKeys.length; i < size; i++) {
            var key = expectedKeys[i];
            var errItem = errRef.removedItems[i];
            asr.equal(errItem.key, key, "keys mismatch: actual=" + errItem.key + ", expected=" + key + ",\n\t" +
                "removed keys: " + errRef.removedItems.map(function (s) { return s.key; }).join(",") + ",\n\t" +
                "removed count: " + errRef.removedCount);
            asr.deepEqual(errItem.value, expectedItems[key]);
        }
    }
});
