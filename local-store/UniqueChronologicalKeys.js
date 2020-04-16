"use strict";
/** Functions for creating relatively unique, chronological keys
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
var UniqueChronologicalKey;
(function (UniqueChronologicalKey) {
    /** returns a double where the whole number is a linux epoch millisecond timestamp using 'Date.now()'
     * and the decimal portion is a semi-unique identifier to avoid collisions when calling this method multiple times within a few milliseconds
     */
    function uniqueTimestampBrowser() {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        return Date.now() + Math.random(); // window.performance.now()/*millisecond with decimal portion up to microsecond precise*/
    }
    UniqueChronologicalKey.uniqueTimestampBrowser = uniqueTimestampBrowser;
    /** returns a double where the whole number is a linux epoch millisecond timestamp using 'Date.now()'
     * and the decimal portion is a semi-unique identifier to avoid collisions when calling this method multiple times within a few milliseconds
     */
    function uniqueTimestampNodeJs() {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        return Date.now() + Math.random(); // (global.process.hrtime()[1]/*nanoseconds*/ / 1000)
    }
    UniqueChronologicalKey.uniqueTimestampNodeJs = uniqueTimestampNodeJs;
    /** get a double where the whole number is a linux epoch millisecond timestamp and the decimal portion is a
     * semi-unique identifier to avoid collisions when calling this method multiple times within a few milliseconds
     */
    UniqueChronologicalKey.uniqueTimestamp = (typeof window !== "undefined") ? uniqueTimestampBrowser : uniqueTimestampNodeJs;
    /** Get a chronological millisecond value, pairs of calls to this function during the same runtime can be compared to get relatively acurate time measurements,
     * no other guarantees are made about the returned number.
     * Note: these methods may not return sub-millisecond accuracy due to fingerprinting and Spectre security concerns: https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#Reduced_time_precision
     */
    UniqueChronologicalKey.getMillisecondTime = ((typeof window !== "undefined" && window && window.performance) ? function () {
        return window.performance.now();
    } : function () {
        return Math.floor(global.process.hrtime()[1] / 1000); /*because hrtime()[1] is nanoseconds*/
    });
})(UniqueChronologicalKey || (UniqueChronologicalKey = {}));
module.exports = UniqueChronologicalKey;
