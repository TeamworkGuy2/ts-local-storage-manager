"use strict";
import chai = require("chai");
import mocha = require("mocha");
import ClearFullStore = require("../local-store/ClearFullStore");
import LocalStoreByCategory = require("../local-store/LocalStoreByCategory");
import UniqueChronologicalKeys = require("../local-store/UniqueChronologicalKeys");
import MemoryStore = require("../local-store/MemoryStore");
import LocalStorageStore = require("../local-store/LocalStorageStore");
import BasicCategorizers = require("../local-store/BasicCategorizers");
import CommonStorageTests = require("./CommonStorageTests");


var asr = chai.assert;


interface CategoryEvent {
    userId: string;
    data: any;
    dateTime: number;
    page?: string;
}


suite("LocalStoreByCategory", function LocalStoreByCategoryTest() {

    var memStore = MemoryStore.newInst();
    var localStore = LocalStorageStore.newInst(memStore, null, <LocalStore.FullStoreHandler><any>null, true, false, 80, false);
    var storeBldr = LocalStoreByCategory.Builder.newInst(localStore, UniqueChronologicalKeys.uniqueTimestampNodeJs);
    var store = storeBldr.addStores({
        alpha: storeBldr.toStore(BasicCategorizers.newPrefixCategorizer("alpha-")),
        omega: storeBldr.toStore(BasicCategorizers.newSuffixCategorizer("-omega")),
    }).build();


    test("local-store-by-category-1", function LocalStoreByCategoryScenario1Test() {
        // category: 'data-a'
        var valA: CategoryEvent = {
            userId: "u1",
            data: { a: "is an 'A'" },
            dateTime: Date.now(),
        };
        // category: 'data-b'
        var valB: CategoryEvent = {
            userId: "u1",
            data: { b: "is a 'B'" },
            dateTime: Date.now(),
        };
        // category: 'data-c'
        var valC: CategoryEvent = {
            userId: "u2",
            data: { c: "is a 'C'" },
            dateTime: Date.now(),
        };
        // category: 'u2'
        var valD: CategoryEvent = {
            userId: "u2",
            data: { d: "is an 'D'" },
            dateTime: Date.now(),
        };
        // category: 'u3'
        var valE: CategoryEvent = {
            userId: "u3",
            data: { e: "is an 'E'" },
            dateTime: Date.now(),
        };

        store.rootStore.setItem("val-a", valA);
        var keyA1 = store.stores.alpha.addItem(valB);
        var keyA2 = store.stores.alpha.addItem(valC);
        var keyO1 = store.stores.omega.addItem(valD);
        var keyO2 = store.stores.omega.addItem(valE);
        asr.equal(store.stores.alpha.length, 2);
        asr.equal(store.stores.omega.length, 2);

        asr.deepEqual(store.rootStore.getItem("val-a"), valA);
        asr.deepEqual(store.stores.alpha.getItem(keyA1), valB);
        asr.deepEqual(store.stores.alpha.getItem(keyA2), valC);
        asr.deepEqual(store.stores.omega.getItem(keyO1), valD);
        asr.deepEqual(store.stores.omega.getItem(keyO2), valE);
        asr.equal(store.rootStore.hasItem("val-a"), true);
        asr.equal(store.stores.alpha.hasItem(keyA1), true);
        asr.equal(store.stores.alpha.hasItem(keyA2), true);
        asr.equal(store.stores.omega.hasItem(keyO1), true);
        asr.equal(store.stores.omega.hasItem(keyO2), true);

        asr.equal(store.rootStore.hasItem("-"), false);

        assertDataStores(asr, store, false, compareCategoryEvent, [
            { name: "alpha", size: 2, data: [valB, valC] },
            { name: "omega", size: 2, data: [valD, valE] },
        ]);
        //as.equal(store.length, 5);

        store.stores.alpha.removeItem(keyA1);

        assertDataStores(asr, store, false, compareCategoryEvent, [
            { name: "alpha", size: 1, data: [valC] },
            { name: "omega", size: 2, data: [valD, valE] },
        ]);
        //as.equal(store.length, 4);
    });


    test("local-store-by-category-full-1", function localStoreByCategoryFullTest() {
        var cI = 0;
        var dI = 0;
        var memStore = MemoryStore.newInst(10);
        var localStore = LocalStorageStore.newInst(memStore, null, <LocalStore.FullStoreHandler><any>null, true, false, 80, false);
        var storeBldr = LocalStoreByCategory.Builder.newInst(localStore, UniqueChronologicalKeys.uniqueTimestampNodeJs);
        var store = storeBldr.addStores({
            charlie: storeBldr.toStore(BasicCategorizers.newPrefixCategorizer("c-"), (storeInst, removedItems, err, removedCount) => cI++),
            delta: storeBldr.toStore(BasicCategorizers.newPrefixCategorizer("d-"), (storeInst, removedItems, err, removedCount) => dI++),
        }).build();

        store.stores.charlie.addItem("five-", true);
        store.stores.delta.addItem("too-long", true);

        asr.equal(cI, 1);
        asr.equal(dI, 0);

        assertDataStores(asr, store, true, (s1, s2) => s1 === s2, [
            { name: "delta", size: 1, data: ["too-long"] },
        ]);

        store.stores.charlie.addItem("A", true);

        asr.equal(cI, 1);
        asr.equal(dI, 0);

        // charlie: ["five-", "A"]
        // delta: ["too-long"]

        store.stores.delta.addItem("two", true);

        asr.equal(cI, 2);
        asr.equal(dI, 1);

        assertDataStores(asr, store, true, (s1, s2) => s1 === s2, [
            { name: "delta", size: 1, data: ["two"] },
        ]);
    });


    /** Check that the TestStore contains the expected stores with expected sizes and data
     */
    function assertDataStores(as: Chai.AssertStatic, store: LocalStoreByCategory<any>, plainStr: boolean, compare: (val1: any, val2: any) => boolean, expectedSubStores: { name: string; size: number; data: any[] }[]) {
        var stores = store.getStoresContainingData();
        var names: string[] = [];

        for (var i = 0, size = expectedSubStores.length; i < size; i++) {
            var expected = expectedSubStores[i];
            names.push(expected.name);

            var categoryStore = stores[expected.name];
            as.notEqual(categoryStore, null, "no such store '" + expected.name + "' all stores: " + Object.keys(stores));
            as.equal(categoryStore.length, expected.size, "invalid store size: " + expected.name);

            if (expected.data && expected.data.length > 0) {
                for (var k = 0, sizeK = expected.data.length; k < sizeK; k++) {
                    var storeData = categoryStore.getData(plainStr);
                    as.equal(CommonStorageTests.looseEqual(compare, storeData, expected.data), true,
                        "expected: " + JSON.stringify(expected.data) + ", actual: " + JSON.stringify(storeData));
                }
            }
        }

        as.deepEqual(Object.keys(stores).sort(), names);
    }


    function compareCategoryEvent(v1: CategoryEvent, v2: CategoryEvent): boolean {
        return (v1.page == v2.page || v1.page == null || v2.page == null) &&
            v1.userId == v2.userId &&
            (!(v1.data == null && v2.data != null) && !(v1.data != null && v2.data == null) && CommonStorageTests.compareShallow(v1.data, v2.data));
    }

});
