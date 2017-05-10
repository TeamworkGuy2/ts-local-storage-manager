"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var LocalStoreByTimestamp = require("../local-store/LocalStoreByTimestamp");
var UniqueChronologicalKeys = require("../local-store/UniqueChronologicalKeys");
var MemoryStore = require("../local-store/MemoryStore");
var LocalStorageStore = require("../local-store/LocalStorageStore");
var asr = chai.assert;
suite("LocalStoreByTimestamp", function LocalStoreByTimestampTest() {
    test("local-store-by-timestamp-1", function LocalStoreByTimestampScenario1Test() {
        var memStore = MemoryStore.newInst();
        var localStore = LocalStorageStore.newInst(memStore, null, null, false, false, 20);
        var store = LocalStoreByTimestamp.newTimestampInst(localStore);
        store.keyGenerator = UniqueChronologicalKeys.uniqueTimestampNodeJs;
        var keyA = store.addItem({ a: 1 });
        var keyB = store.addItem({ b: 1 });
        asr.deepEqual(store.getKeys(), [keyA, keyB]);
        asr.equal(store.hasItem(keyA), true);
        store.removeItem(keyA);
        var keyC = store.addItem({ c: 1 });
        keyA = store.addItem({ a: 2 });
        asr.deepEqual(store.getKeys(), [keyB, keyC, keyA]);
        asr.deepEqual(store.getItem(keyB), { b: 1 });
    });
});
