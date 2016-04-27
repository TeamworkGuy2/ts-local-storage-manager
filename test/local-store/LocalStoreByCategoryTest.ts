"use strict";
import ClearFullStore = require("../../local-store/ClearFullStore");
import LocalStoreByCategory = require("../../local-store/LocalStoreByCategory");
import UniqueChronologicalKeys = require("../../local-store/UniqueChronologicalKeys");
import MemoryStore = require("../../local-store/MemoryStore");
import LocalStorageStore = require("../../local-store/LocalStorageStore");
import BasicCategorizers = require("../../local-store/BasicCategorizers");
import CommonStorageTests = require("./CommonStorageTests");

interface CategoryEvent {
    userId: string;
    data: any;
    dateTime: number;
    page?: string;
}

var memStore = MemoryStore.newInst();
var localStore = LocalStorageStore.newInst(memStore, null, null, true, false, 80, false);
var storeBldr = LocalStoreByCategory.Builder.newInst(localStore, UniqueChronologicalKeys.uniqueTimestampNodeJs);
var store = storeBldr.addStores({
    alpha: storeBldr.toStore(BasicCategorizers.newPrefixCategorizer("alpha-")),
    omega: storeBldr.toStore(BasicCategorizers.newSuffixCategorizer("-omega")),
}).build();

type TestStore = typeof store;


QUnit.module("LocalStoreByCategory", {
});


QUnit.test("local-store-by-category-1", function LocalStoreByCategoryScenario1Test(sr) {

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
    sr.equal(store.stores.alpha.length, 2);
    sr.equal(store.stores.omega.length, 2);

    sr.deepEqual(store.rootStore.getItem("val-a"), valA);
    sr.deepEqual(store.stores.alpha.getItem(keyA1), valB);
    sr.deepEqual(store.stores.alpha.getItem(keyA2), valC);
    sr.deepEqual(store.stores.omega.getItem(keyO1), valD);
    sr.deepEqual(store.stores.omega.getItem(keyO2), valE);
    sr.equal(store.rootStore.hasItem("val-a"), true);
    sr.equal(store.stores.alpha.hasItem(keyA1), true);
    sr.equal(store.stores.alpha.hasItem(keyA2), true);
    sr.equal(store.stores.omega.hasItem(keyO1), true);
    sr.equal(store.stores.omega.hasItem(keyO2), true);

    sr.equal(store.rootStore.hasItem("-"), false);

    assertDataStores(sr, store, [
        { name: "alpha", size: 2, data: [valB, valC] },
        { name: "omega", size: 2, data: [valD, valE] },
    ]);
    //sr.equal(store.length, 5);

    store.stores.alpha.removeItem(keyA1);

    assertDataStores(sr, store, [
        { name: "alpha", size: 1, data: [valC] },
        { name: "omega", size: 2, data: [valD, valE] },
    ]);
    //sr.equal(store.length, 4);

});


function assertDataStores(sr: QUnitAssert, store: TestStore, expectedSubStores: { name: string; size: number; data: any[] }[]) {
    var stores = store.getStoresContainingData();
    var names: string[] = [];

    for (var i = 0, size = expectedSubStores.length; i < size; i++) {
        var expected = expectedSubStores[i];
        names.push(expected.name);

        var categoryStore = stores[expected.name];
        sr.notEqual(categoryStore, null, "no such store '" + expected.name + "' all stores: " + Object.keys(stores));
        sr.equal(categoryStore.length, expected.size, "invalid store size: " + expected.name);

        if (expected.data && expected.data.length > 0) {
            for (var k = 0, sizeK = expected.data.length; k < sizeK; k++) {
                sr.equal(CommonStorageTests.looseEqual(compareCategoryEvent, categoryStore.getData(), expected.data), true,
                    "expected: " + JSON.stringify(expected.data) + ", actual: " + JSON.stringify(categoryStore.getData()));
            }
        }
    }

    sr.deepEqual(Object.keys(stores).sort(), names);
}


function compareCategoryEvent(v1: CategoryEvent, v2: CategoryEvent): boolean {
    return (v1.page == v2.page || v1.page == null || v2.page == null) &&
        v1.userId == v2.userId &&
        (!(v1.data == null && v2.data != null) && !(v1.data != null && v2.data == null) && CommonStorageTests.compareShallow(v1.data, v2.data));
}
