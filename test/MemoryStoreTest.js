"use strict";
var chai = require("chai");
var MemoryStore = require("../local-store/MemoryStore");
var CommonStorageTests = require("./CommonStorageTests");
var asr = chai.assert;
suite("MemoryStore", function MemoryStoreTest() {
    test("memory-store", function MemoryStorageScenario1Test() {
        var store = MemoryStore.newInst();
        CommonStorageTests.addAndRemove(asr, store);
        CommonStorageTests.keyAndGetItem(asr, store);
        CommonStorageTests.cornerCaseKeyNames(asr, store, false);
    });
});
