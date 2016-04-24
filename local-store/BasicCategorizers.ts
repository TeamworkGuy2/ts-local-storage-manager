/**
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
module BasicCategorizers {

    /** A categorizer based on 'key' string prefixes from key-value pairs
     */
    export function newPrefixCategorizer(prefix: string): DefaultCategorizer {
        return new DefaultCategorizer(prefix, (key) => {
            return prefix + key;
        }, (key) => {
            return key.substr(prefix.length);
        }, (key) => {
            return key != null && key.substr(0, prefix.length) === prefix;
        });
    }


    /** A categorizer based on 'key' string suffixes from key-value pairs
     */
    export function newSuffixCategorizer(suffix: string): DefaultCategorizer {
        return new DefaultCategorizer(suffix, (key) => {
            return key + suffix;
        }, (key) => {
            return key.substr(0, key.length - suffix.length);
        }, (key) => {
            return key != null && key.length >= suffix.length && key.substr(key.length - suffix.length) === suffix;
        });
    }




    /** Default categorizer implementation
     */
    export class DefaultCategorizer implements KeyCategorizer {
        public category: string;
        public modifyKey: (key: string) => string;
        public unmodifyKey: (key: string) => string;
        public isMatchingCategory: (key: string) => boolean;


        /**
         * @param checkFunc a function which given a store item's key, returns true if the key matches this category, false if not
         */
        constructor(category: string, modifyKey: (key: string) => string, unmodifyKey: (key: string) => string, matchingKey: (key: string) => boolean) {
            this.category = category;
            this.modifyKey = modifyKey;
            this.unmodifyKey = unmodifyKey;
            this.isMatchingCategory = matchingKey;
        }

    }


}

export = BasicCategorizers;