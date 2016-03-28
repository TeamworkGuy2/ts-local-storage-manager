"use strict";
import MemoryStore = require("../../local-store/MemoryStore");
import CommonStorageTests = require("./CommonStorageTests");

QUnit.module("MemoryStore", {
});


QUnit.test("memory-store scenario 1", function MemoryStorageScenario1Test(sr) {
    var store = MemoryStore.newInst();

    CommonStorageTests.addAndRemove(sr, store);

    CommonStorageTests.keyAndGetItem(sr, store);

    CommonStorageTests.cornerCaseKeyNames(sr, store, false);
});