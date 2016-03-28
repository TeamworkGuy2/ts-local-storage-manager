"use strict";
import MemoryStore = require("../../local-store/MemoryStore");
import LocalStoreDefault = require("../../local-store/LocalStoreDefault");
import CommonStorageTests = require("./CommonStorageTests");

QUnit.module("LocalStoreDefault", {
});


QUnit.test("local-store-default-scenario-1", function LocalStoreDefaultScenario1Test(sr) {
    var memBaseStore = MemoryStore.newInst();
    var store = LocalStoreDefault.newInst(memBaseStore, 20);

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