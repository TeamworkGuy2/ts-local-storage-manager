"use strict";
/** Functions for creating relatively unique, chronological keys
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
var UniqueChronologicalKey;
(function (UniqueChronologicalKey) {
    function uniqueTimestamp() {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        return Math.round((Date.now() + window.performance.now()) / 2 * 1000);
    }
    UniqueChronologicalKey.uniqueTimestamp = uniqueTimestamp;
    function uniqueTimestampNodeJs() {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        return Math.round((Date.now() + GLOBAL.process.hrtime()[1] /*nanoseconds*/) / 2 * 1000);
    }
    UniqueChronologicalKey.uniqueTimestampNodeJs = uniqueTimestampNodeJs;
})(UniqueChronologicalKey || (UniqueChronologicalKey = {}));
module.exports = UniqueChronologicalKey;
