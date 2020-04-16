"use strict";
import chai = require("chai");
import mocha = require("mocha");
import MemoryStore = require("../local-store/MemoryStore");
import CommonStorageTests = require("./CommonStorageTests");

var asr = chai.assert;


suite("MemoryStore", function MemoryStoreTest() {

    test("memory-store", function MemoryStorageScenario1Test() {
        var store = MemoryStore.newInst();

        CommonStorageTests.addAndRemove(asr, store);

        CommonStorageTests.keyAndGetItem(asr, store);

        CommonStorageTests.cornerCaseKeyNames(asr, store, false);
    });

});
