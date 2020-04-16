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
        store.keyGenerator = UniqueChronologicalKeys.uniqueTimestamp;
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
    test("check-unique-chronological-keys-(some-duplicates)", function checkUniqueChronologicalKeysUniqueness() {
        var n = 0, gt = 0, r = 0;
        var keyGen = function () {
            return (n = Date.now()) + (r = Math.random()); // (gt = global.process.hrtime()[1] / 1000)
        }; //UniqueChronologicalKeys.uniqueTimestamp;
        var outerTimestamps = [];
        var duplicates = [];
        var mostPerGroup = 0;
        var cnt = 0;
        for (var i = 0; i < 1000; i++) {
            var ary = [];
            var dupCount = duplicates.length;
            for (var k = 0; k < 100; k++) {
                var key = keyGen();
                // check for duplicates
                var idx = ary.findIndex(function (s) { return s.key === key; });
                if (idx > -1) {
                    duplicates.push("duplicate at loop (" + i + "," + k + ")" + "\n\t| curr: key=" + key + ", n=" + n + ", gt=" + gt + ", r*=" + r + "\n\t| prev: key=" + ary[idx].key + ary[idx].calc);
                }
                ary[k] = { key: key, calc: ", n=" + n + ", gt=" + gt + ", r*=" + r };
            }
            var idx = Math.floor(Math.random() * 100);
            cnt += (i % 2 === 0 ? ary[idx].key : -ary[idx].key);
            mostPerGroup = Math.max(duplicates.length - dupCount, mostPerGroup);
            var now = Date.now();
            if (outerTimestamps.indexOf(now) === -1) {
                outerTimestamps.push(now);
            }
        }
        console.log("timestamps:", outerTimestamps.length, "duplicates:", duplicates.length, "most-per-group:", mostPerGroup);
        return cnt;
    });
});
