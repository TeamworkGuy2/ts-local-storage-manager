"use strict";
import MemoryStore = require("../../local-store/MemoryStore");
import LocalStoreFromStorage = require("../../local-store/LocalStoreFromStorage");
import LocalStoreWrapper = require("../../local-store/LocalStoreWrapper");
import ClearFullStore = require("../../local-store/ClearFullStore");
import CommonStorageTests = require("./CommonStorageTests");

QUnit.module("LocalStoreDefault", {
});


QUnit.test("local-store-from-storage-1", function LocalStoreDefaultScenario1Test(sr) {
    var memBaseStore = MemoryStore.newInst();
    var store = LocalStoreFromStorage.newInst(memBaseStore, null, true, true, 20, false);

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

    sr.throws(() => store.setItem("long-key", "abcdefghijklmnopqrstuvwxyz"));
});


QUnit.test("local-store-from-storage-load-existing", function LocalStoreDefaultLoadExisting(sr) {
    var fullStoreHandler = new ClearFullStore((key) => (key.length > 0 ? key.charCodeAt(0) << 16 : 0) + (key.length > 1 ? key.charCodeAt(1) : 0));
    var baseStore = LocalStoreFromStorage.newInst(MemoryStore.newInst(), null, true, false, 50, false);
    baseStore.setItem("one", { value: "one" });
    baseStore.setItem("two", { value: "two" });
    baseStore.setItem("three", { value: "three" });

    var wrapper1 = LocalStoreWrapper.newInst(baseStore, (store, err) => fullStoreHandler.clearOldItems(baseStore, true, err), true, true, undefined, true);
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