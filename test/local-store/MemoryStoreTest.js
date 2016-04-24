"use strict";
var MemoryStore = require("../../local-store/MemoryStore");
var CommonStorageTests = require("./CommonStorageTests");
QUnit.module("MemoryStore", {});
QUnit.test("memory-store", function MemoryStorageScenario1Test(sr) {
    var store = MemoryStore.newInst();
    CommonStorageTests.addAndRemove(sr, store);
    CommonStorageTests.keyAndGetItem(sr, store);
    CommonStorageTests.cornerCaseKeyNames(sr, store, false);
});
