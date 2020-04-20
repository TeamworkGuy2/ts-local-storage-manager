"use strict";
import chai = require("chai");
import mocha = require("mocha");
import MemoryStore = require("../local-store/MemoryStore");
import LocalStorageStore = require("../local-store/LocalStorageStore");
import LocalStoreWrapper = require("../local-store/LocalStoreWrapper");
import ClearFullStore = require("../local-store/ClearFullStore");
import CommonStorageTests = require("./CommonStorageTests");

var asr = chai.assert;

suite("LocalStorageStore", function LocalStoreStorageTest() {

    test("local-store-from-storage-1", function LocalStorageStoreScenario1Test() {
        var memBaseStore = MemoryStore.newInst();
        var store = new LocalStorageStore(memBaseStore, null, <LocalStore.FullStoreHandler><any>null, true, true, 20, false, undefined);

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

        asr.throws(() => store.setItem("long-key", "abcdefghijklmnopqrstuvwxyz"));
    });


    test("local-store-from-storage-clear-full", function LocalStorageStoreClearFull() {
        var itemsRemovedFunc: LocalStore.ItemsRemovedCallback;
        var removePercentage = 0.49;
        var memStore = MemoryStore.newInst(undefined, 3);
        var fullStoreHandler = ClearFullStore.newInst((key) => parseInt(key.substr(key.lastIndexOf('-') + 1)), (store, items, err, removedCount) => itemsRemovedFunc(store, items, err, removedCount), removePercentage);
        var baseStore = new LocalStorageStore(memStore, null, <LocalStore.FullStoreHandler><any>null, true, false, 50, false, undefined);
        // ---- test exceeding max items and removing 1 item ----
        // assuming removal-percentage-when-full is less than 50%
        baseStore.setItem("one-123", { value: "one" });
        baseStore.setItem("two-22", { value: "two" });
        baseStore.setItem("three-300", { value: "three" });

        var store = LocalStoreWrapper.newInst(baseStore, (store, err) => fullStoreHandler.clearOldItems(store, true, err), true, true, undefined, true);
        // setup a local store full callback which sets the 'errorRef' variable
        var errorRef: LocalStore.ItemsRemovedEvent = <any>null;
        itemsRemovedFunc = (store, removedItems, storageError, removedCount) => {
            errorRef = { store, removedItems, storageError, removedCount };
        };

        // add the fourth item, exceeding the 3 item limit, the error callback should be called
        store.setItem("four-40", { value: "four" });

        asr.notEqual(errorRef, null);
        asr.equal(errorRef.store, store);
        checkStoreFullErrorData(errorRef, {
            "two-22": JSON.stringify({ value: "two" })
        });
        errorRef = <any>null;

        // add another item, exceeding the 3 item limit again
        store.setItem("five-55", { value: "five" });

        asr.notEqual(errorRef, null);
        checkStoreFullErrorData(errorRef, {
            "four-40": JSON.stringify({ value: "four" })
        });
        errorRef = <any>null;

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


    test("local-store-full-handling-failure", function LocalStorageStoreClearFull() {
        var itemsRemovedFunc: LocalStore.ItemsRemovedCallback;
        var removePercentage = 0.1;
        var memStore = MemoryStore.newInst(undefined, 3);
        var fullStoreHandler = ClearFullStore.newInst((key) => parseInt(key.substr(key.lastIndexOf('-') + 1)), (store, items, err, removedCount) => itemsRemovedFunc(store, items, err, removedCount), removePercentage);
        var baseStore = new LocalStorageStore(memStore, null, <LocalStore.FullStoreHandler><any>null, true, false, 50, false, undefined);
        // ---- test storage full handling error ----
        baseStore.setItem("one-1", { value: "one" });
        baseStore.setItem("two-2", { value: "two" });
        baseStore.setItem("three-3", { value: "three" });

        var store = LocalStoreWrapper.newInst(baseStore, (store, err) => fullStoreHandler.clearOldItems(store, true, err, removePercentage, throwRemovalError ? 0 : 1), true, true, undefined, true);
        // setup a local store full callback which increments the 'errorCnt' variable
        var throwRemovalError = false;
        var errorCnt = 0;
        itemsRemovedFunc = (store, removedItems, storageError, removedCount) => {
            errorCnt++;
            if (throwRemovalError) {
                throw new Error("removal test");
            }
        };

        // add items causing the full storage handle to get called
        store.setItem("four-4", { value: "four" });
        asr.equal(errorCnt, 1);
        store.setItem("five-5", { value: "five" });
        asr.equal(errorCnt, 2);
        store.setItem("six-6", { value: "six" });
        asr.equal(errorCnt, 3);

        throwRemovalError = true;
        asr.throws(() => store.setItem("seven-7", { value: "seven-seven-seven-seven" }));
        asr.equal(errorCnt, 3);
    });


    test("local-store-from-storage-load-existing", function LocalStorageStoreLoadExisting() {
        var fullStoreHandler = ClearFullStore.newInst((key) => (key.length > 0 ? key.charCodeAt(0) << 16 : 0) + (key.length > 1 ? key.charCodeAt(1) : 0));
        var baseStore = new LocalStorageStore(MemoryStore.newInst(), null, <LocalStore.FullStoreHandler><any>null, true, false, 50, false, undefined);
        baseStore.setItem("one", { value: "one" });
        baseStore.setItem("two", { value: "two" });
        baseStore.setItem("three", { value: "three" });

        var wrapper1 = LocalStoreWrapper.newInst(baseStore, (store, err) => fullStoreHandler.clearOldItems(store, true, err), true, true, undefined, true);
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


    test("local-store-get-keys-array-unique", function LocalStorageStoreGetKeys() {
        var store = new LocalStorageStore(MemoryStore.newInst(), null, <LocalStore.FullStoreHandler><any>null, true, false, 50, false, undefined);
        var keys1 = store.getKeys();
        keys1.push("test");
        store.setItem("A", "alphabet");
        var keys2 = store.getKeys()
        asr.deepEqual(keys2, ["A"]);
        asr.notDeepEqual(keys2, keys1);
    });


    function checkStoreFullErrorData(errRef: LocalStore.ItemsRemovedEvent, expectedItems: { [key: string]: any }) {
        asr.notEqual(errRef, null);
        var expectedKeys = Object.keys(expectedItems);
        asr.equal(errRef.removedItems.length, expectedKeys.length, "expected " + expectedKeys.length + " error items, received " + errRef.removedItems.length);

        for (var i = 0, size = expectedKeys.length; i < size; i++) {
            var key = expectedKeys[i];
            var errItem = errRef.removedItems[i];
            asr.equal(errItem.key, key, "keys mismatch: actual=" + errItem.key + ", expected=" + key + ",\n\t" +
                "removed keys: " + errRef.removedItems.map(s => s.key).join(",") + ",\n\t" +
                "removed count: " + errRef.removedCount);
            asr.deepEqual(errItem.value, expectedItems[key]);
        }
    }

});
