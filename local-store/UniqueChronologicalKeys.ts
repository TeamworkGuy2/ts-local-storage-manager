declare var global: { process: { hrtime(time?: number[]): [number, number]; } };
declare var window: { performance: { now(): number; } };

/** Functions for creating relatively unique, chronological keys
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
module UniqueChronologicalKey {

    export function uniqueTimestamp(): number {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        return Math.round((<number>Date.now() + window.performance.now()/*millisecond with decimal portion up to microsecond precise*/) / 2 * 1000);
    }


    export function uniqueTimestampNodeJs(): number {
        // work around for the granularity of Date.now() and the rollover issue with performance.now()
        return Math.round((<number>Date.now() + global.process.hrtime()[1]/*nanoseconds*/) / 2 * 1000);
    }


    /** get a chronological millisecond value, pairs of calls to this function during the same runtime can be compared to get relatively acurate time measurements,
     * no other guarantees are made about the returned number
     */
    export var getMillisecondTime = ((typeof window !== "undefined" && window && window.performance) ? () => {
        return window.performance.now();
    } : () => {
        return Math.floor(global.process.hrtime()[1] / 1000); /*because hrtime()[1] is nanoseconds*/
    });

}

export = UniqueChronologicalKey;