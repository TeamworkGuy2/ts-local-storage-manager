"use strict";
var CommonStorageTests;
(function (CommonStorageTests) {
    function addAndRemove(asr, store) {
        store.setItem("a", "a-");
        store.setItem("2", "c-");
        store.setItem("1", "b-");
        asr.deepEqual(store.getKeys(), ["a", "2", "1"]);
        store.removeItem("2");
        asr.deepEqual(store.getKeys(), ["a", "1"]);
        asr.equal(store.length, 2);
        store.clear();
    }
    CommonStorageTests.addAndRemove = addAndRemove;
    function keyAndGetItem(asr, store) {
        store.setItem("c", "c-");
        store.setItem("b", "b-");
        store.setItem("a", "a-");
        store.setItem("b", "b-");
        asr.deepEqual(store.getKeys(), ["c", "b", "a"]);
        asr.equal(store.length, 3);
        asr.equal(store.key(0), "c");
        asr.equal(store.key(1), "b");
        asr.equal(store.key(2), "a");
        asr.equal(store.getItem("b"), "b-");
        asr.equal(store.getItem("c"), "c-");
        asr.equal(store.getItem("a"), "a-");
        store.clear();
    }
    CommonStorageTests.keyAndGetItem = keyAndGetItem;
    function cornerCaseKeyNames(asr, store, alwaysAsString) {
        store.setItem("c", "c-");
        store.setItem("b", "b-");
        store.setItem(alwaysAsString ? "null" : null, "none-null");
        store.setItem("a", "a-");
        store.setItem("b", "b-");
        store.removeItem("b");
        store.setItem(alwaysAsString ? "undefined" : undefined, "none-undef");
        asr.deepEqual(store.getKeys(), ["c", "null", "a", "undefined"]);
        store.removeItem("null");
        store.removeItem("undefined");
        asr.deepEqual(store.getKeys(), ["c", "a"]);
        store.clear();
    }
    CommonStorageTests.cornerCaseKeyNames = cornerCaseKeyNames;
    // copied from ts-mortar library
    /** Check whether two arrays are equal, ignoring the order of the elements in each array.
     * elements are compared using strict (i.e. '===') equality.
     * For example: {@code looseEqual([26, "Alpha", 5], [5, 26, "Alpha"])}
     * returns: {@code true}
     * Or example: {@code looseEqual([34, "A", "QA"], [7, 34, "A"])}
     * returns: {@code false}
     *
     * @param ary1: the first array to compare
     * @param ary1: the second array to compare
     * @return true if both arrays contain the same elements in any order, or if both arrays are null.
     * False if one or more elements differ between the two arrays
     */
    function looseEqual(comparator, ary1, ary2) {
        if (ary1 == null || ary2 == null || !Array.isArray(ary1) || !Array.isArray(ary2)) {
            if (ary1 == null && ary2 == null) {
                return true;
            }
            if ((ary1 != null && !Array.isArray(ary1)) || (ary2 != null && !Array.isArray(ary2)) || ary1 === undefined || ary2 === undefined) {
                throw new Error("incorrect usage ([" + ary1 + "], [" + ary2 + "]), " + "expected (Array ary1, Array ary2)");
            }
            if ((ary1 == null && ary2 != null) || (ary1 != null && ary2 == null)) {
                return false;
            }
        }
        if (ary1.length !== ary2.length) {
            return false;
        }
        function compareFunc(val2) {
            return comparator(this, val2);
        }
        var matchingCount = 0;
        for (var i = ary1.length - 1; i > -1; i--) {
            if (ary2.findIndex(compareFunc, ary1[i]) === -1) {
                return false;
            }
            matchingCount++;
        }
        return matchingCount == ary2.length;
    }
    CommonStorageTests.looseEqual = looseEqual;
    function compareShallow(d1, d2) {
        var keys1 = Object.keys(d1);
        var keys2 = Object.keys(d2);
        for (var i = 0, size = keys1.length; i < size; i++) {
            var k1 = keys1[i];
            var k2Idx;
            if (d1.hasOwnProperty(k1)) {
                // 'd2' does not contain the same property
                if ((k2Idx = keys2.indexOf(k1)) < 0 || !d2.hasOwnProperty(keys2[k2Idx])) {
                    return false;
                }
                if (d1[k1] != d2[keys2[k2Idx]]) {
                    return false;
                }
            }
        }
        return true;
    }
    CommonStorageTests.compareShallow = compareShallow;
})(CommonStorageTests || (CommonStorageTests = {}));
module.exports = CommonStorageTests;
