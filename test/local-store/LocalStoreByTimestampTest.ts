﻿"use strict";
import LocalStoreByTimestamp = require("../../local-store/LocalStoreByTimestamp");
import UniqueChronologicalKey = require("../../local-store/UniqueChronologicalKey");
import MemoryStore = require("../../local-store/MemoryStore");
import LocalStoreDefault = require("../../local-store/LocalStoreDefault");
import CommonStorageTests = require("./CommonStorageTests");

QUnit.module("LocalStoreByTimestamp", {
});


QUnit.test("local-store-by-timestamp-scenario-1", function LocalStoreByTimestampScenario1Test(sr) {
    var memStore = MemoryStore.newInst();
    var localStore = LocalStoreDefault.newInst(memStore, 20);
    var store = LocalStoreByTimestamp.newDefaultInst(localStore);
    store.timestampKeyGenerator = () => UniqueChronologicalKey.uniqueTimestampNodeJs() + '';

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