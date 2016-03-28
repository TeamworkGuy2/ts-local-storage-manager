"use strict";
"use strict";
import LocalStoreByCategory = require("../../local-store/LocalStoreByCategory");
import UniqueChronologicalKey = require("../../local-store/UniqueChronologicalKey");
import MemoryStore = require("../../local-store/MemoryStore");
import LocalStoreDefault = require("../../local-store/LocalStoreDefault");
import BasicCategorizers = require("../../local-store/BasicCategorizers");
import CommonStorageTests = require("./CommonStorageTests");

interface CategoryEvent {
    userId: string;
    data: any;
    dateTime: number;
    page?: string;
}

QUnit.module("LocalStoreByCategory", {
});


QUnit.test("local-store-by-category-scenario-1", function LocalStoreByCategoryScenario1Test(sr) {
    var memStore = MemoryStore.newInst();
    var localStore = LocalStoreDefault.newInst(memStore, 80);

    var store = LocalStoreByCategory.newInst(localStore, () => LocalStoreDefault.newInst(MemoryStore.newInst()), UniqueChronologicalKey.uniqueTimestampNodeJs, [
        BasicCategorizers.createKeyPrefixCategorizer<any>("pre-"),
        BasicCategorizers.createKeySuffixCategorizer<any>("-post"),
        new BasicCategorizers.DefaultCategorizer<CategoryEvent>("value-wrapper", (ky, ve) => (ve.page ? ve.page.endsWith("user") : ve.userId == "demo-user"))
    ], [
        new BasicCategorizers.MultiCategorizerChecked<CategoryEvent>(["data-a", "data-b", "data-c"], (ky, ve) => ve.data.a ? "data-a" : (ve.data.b ? "data-b" : ve.data.c ? "data-c" : null)),
        new BasicCategorizers.MultiCategorizerUnchecked<CategoryEvent>((ky, ve) => ve.userId)
    ]);

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

    var keyA = store.addItem(valA);
    var keyB = store.addItem(valB);
    var keyC = store.addItem(valC);
    var keyD = store.addItem(valD);
    var keyE = store.addItem(valE);

    sr.deepEqual(store.getItem(keyA), valA);
    sr.deepEqual(store.getItem(keyB), valB);
    sr.deepEqual(store.getItem(keyC), valC);
    sr.deepEqual(store.getItem(keyD), valD);
    sr.deepEqual(store.getItem(keyE), valE);
    sr.equal(store.hasItem(keyA), true);
    sr.equal(store.hasItem(keyB), true);
    sr.equal(store.hasItem(keyC), true);
    sr.equal(store.hasItem(keyD), true);
    sr.equal(store.hasItem(keyE), true);

    sr.equal(store.hasItem("-"), false);

    assertDataStores(sr, store, [
        { name: "data-a", size: 1, data: [valA] },
        { name: "data-b", size: 1, data: [valB] },
        { name: "data-c", size: 1, data: [valC] },
        { name: "u2", size: 1, data: [valD] },
        { name: "u3", size: 1, data: [valE] }
    ]);
    //sr.equal(store.length, 5);

    store.removeItem(keyB);

    assertDataStores(sr, store, [
        { name: "data-a", size: 1, data: [valA] },
        { name: "data-c", size: 1, data: [valC] },
        { name: "u2", size: 1, data: [valD] },
        { name: "u3", size: 1, data: [valE] }
    ]);
    //sr.equal(store.length, 4);

});

function assertDataStores(sr: QUnitAssert, store: LocalStoreByCategory, expectedSubStores: { name: string; size: number; data: any[] }[]) {
    var categories = store.getCategoryStoresWithData();
    var names: string[] = [];

    for (var i = 0, size = expectedSubStores.length; i < size; i++) {
        var expected = expectedSubStores[i];
        names.push(expected.name);

        var categoryStore = categories[expected.name];
        sr.equal(categoryStore.length, expected.size);
        if (expected.data && expected.data.length > 0) {
            for (var k = 0, sizeK = expected.data.length; k < sizeK; k++) {
                sr.equal(CommonStorageTests.looseEqual(compareCategoryEvent, categoryStore.getData(), expected.data), true,
                    "expected: " + JSON.stringify(expected.data) + ", actual: " + JSON.stringify(categoryStore.getData()));
            }
        }
    }

    sr.deepEqual(Object.keys(categories).sort(), names);
}


function compareCategoryEvent(v1: CategoryEvent, v2: CategoryEvent): boolean {
    return (v1.page == v2.page || v1.page == null || v2.page == null) &&
        v1.userId == v2.userId &&
        (!(v1.data == null && v2.data != null) && !(v1.data != null && v2.data == null) && CommonStorageTests.compareShallow(v1.data, v2.data));
}
