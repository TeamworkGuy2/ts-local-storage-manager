/// <reference path="../definitions/node/node.d.ts" />
/// <reference path="../definitions/node/node-modules-custom.d.ts" />
/// <reference path="../definitions/lib/qunit.d.ts" />
var gutil = require("gulp-util");
var testRunner = require("qunit");


function callback() {
    //gutil.log("done a test: " + JSON.stringify(arguments));
}


testRunner.setup({
    log: {
        errors: true,
        tests: true,
        summary: true,
        globalSummary: true,
        coverage: true,
        globalCoverage: true,
        testing: true
    }
});


testRunner.run({
    code: "./local-store/LocalStoreDefault",
    tests: "./test/local-store/LocalStoreDefaultTest.js"
}, callback);

testRunner.run({
    code: "./local-store/MemoryStore",
    tests: "./test/local-store/MemoryStoreTest.js"
}, callback);

testRunner.run({
    code: "./local-store/LocalStoreByTimestamp",
    tests: "./test/local-store/LocalStoreByTimestampTest.js"
}, callback);

testRunner.run({
    code: "./local-store/LocalStoreByCategory",
    tests: "./test/local-store/LocalStoreByCategoryTest.js"
}, callback);
