"use strict";
/** Functions for creating relatively unique, chronological keys
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
var UniqueChronologicalKey;
(function (UniqueChronologicalKey) {
    function uniqueTimestamp() {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        return Math.round((Date.now() + window.performance.now() /*millisecond with decimal portion up to microsecond precise*/) / 2 * 1000);
    }
    UniqueChronologicalKey.uniqueTimestamp = uniqueTimestamp;
    function uniqueTimestampNodeJs() {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        return Math.round((Date.now() + global.process.hrtime()[1] /*nanoseconds*/) / 2 * 1000);
    }
    UniqueChronologicalKey.uniqueTimestampNodeJs = uniqueTimestampNodeJs;
    /** get a chronological millisecond value, pairs of calls to this function during the same runtime can be compared to get relatively acurate time measurements,
     * no other guarantees are made about the returned number
     */
    UniqueChronologicalKey.getMillisecondTime = ((typeof window !== "undefined" && window && window.performance) ? function () {
        return window.performance.now();
    } : function () {
        return Math.floor(global.process.hrtime()[1] / 1000); /*because hrtime()[1] is nanoseconds*/
    });
})(UniqueChronologicalKey || (UniqueChronologicalKey = {}));
module.exports = UniqueChronologicalKey;
