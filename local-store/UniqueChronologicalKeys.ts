declare var global: { process: { hrtime(time?: number[]): [number, number]; } };
declare var window: { performance: { now(): number; } };

/** Functions for creating relatively unique, chronological keys
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
module UniqueChronologicalKey {

    /** returns a double where the whole number is a linux epoch millisecond timestamp using 'Date.now()'
     * and the decimal portion is a semi-unique identifier to avoid collisions when calling this method multiple times within a few milliseconds
     */
    export function uniqueTimestampBrowser(): number {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        return <number>Date.now() + Math.random(); // window.performance.now()/*millisecond with decimal portion up to microsecond precise*/
    }


    /** returns a double where the whole number is a linux epoch millisecond timestamp using 'Date.now()'
     * and the decimal portion is a semi-unique identifier to avoid collisions when calling this method multiple times within a few milliseconds
     */
    export function uniqueTimestampNodeJs(): number {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        return <number>Date.now() + Math.random(); // (global.process.hrtime()[1]/*nanoseconds*/ / 1000)
    }


    /** get a double where the whole number is a linux epoch millisecond timestamp and the decimal portion is a
     * semi-unique identifier to avoid collisions when calling this method multiple times within a few milliseconds
     */
    export var uniqueTimestamp = (typeof window !== "undefined") ? uniqueTimestampBrowser : uniqueTimestampNodeJs;


    /** Get a chronological millisecond value, pairs of calls to this function during the same runtime can be compared to get relatively acurate time measurements,
     * no other guarantees are made about the returned number.
     * Note: these methods may not return sub-millisecond accuracy due to fingerprinting and Spectre security concerns: https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#Reduced_time_precision
     */
    export var getMillisecondTime = ((typeof window !== "undefined" && window && window.performance) ? () => {
        return window.performance.now();
    } : () => {
        return Math.floor(global.process.hrtime()[1] / 1000); /*because hrtime()[1] is nanoseconds*/
    });

}

export = UniqueChronologicalKey;