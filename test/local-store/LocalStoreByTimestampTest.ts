"use strict";
import LocalStoreByTimestamp = require("../../local-store/LocalStoreByTimestamp");
import UniqueChronologicalKeys = require("../../local-store/UniqueChronologicalKeys");
import MemoryStore = require("../../local-store/MemoryStore");
import LocalStorageStore = require("../../local-store/LocalStorageStore");
import CommonStorageTests = require("./CommonStorageTests");

QUnit.module("LocalStoreByTimestamp", {
});


QUnit.test("local-store-by-timestamp-1", function LocalStoreByTimestampScenario1Test(sr) {
    var memStore = MemoryStore.newInst();
    var localStore = LocalStorageStore.newInst(memStore, null, null, false, false, 20);
    var store = LocalStoreByTimestamp.newUniqueTimestampInst(localStore, Number.parseInt);
    store.keyGenerator = UniqueChronologicalKeys.uniqueTimestampNodeJs;

    var keyA = store.addItem({ a: 1 });
    var keyB = store.addItem({ b: 1 });

    sr.deepEqual(store.getKeys(), [keyA, keyB]);
    sr.equal(store.hasItem(keyA), true);

    store.removeItem(keyA);

    var keyC = store.addItem({ c: 1 });
    keyA = store.addItem({ a: 2 });

    sr.deepEqual(store.getKeys(), [keyB, keyC, keyA]);
    sr.deepEqual(store.getItem(keyB), { b: 1 });
});