/**
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
module BasicCategorizers {

    /** A categorizer based on 'key' string prefixes from key-value pairs
     */
    export function createKeyPrefixCategorizer<T>(prefix: string): DefaultCategorizer<T> {
        return new DefaultCategorizer(prefix, (key) => key.startsWith(prefix));
    }


    /** A categorizer based on 'key' string suffixes from key-value pairs
     */
    export function createKeySuffixCategorizer<T>(suffix: string): DefaultCategorizer<T> {
        return new DefaultCategorizer(suffix, (key) => key.endsWith(suffix));
    }




    /** Default categorizer implementation
     */
    export class DefaultCategorizer<T> implements LocalStoreItemCategorizer<T> {
        private _category: string;
        public isMatch: (key: string, value: T) => boolean;


        /**
         * @param checkFunc a function which given a store item's key, returns true if the key matches this category, false if not
         */
        constructor(category: string, checkFunc: (key: string, value: T) => boolean) {
            this._category = category;
            this.isMatch = checkFunc;
        }


        public get category() { return this._category; }

    }




    /** This categorizer ensures that the category names returned by the constructor 'checkFunc' parameter, always match one of the provided 'categories', else throw an error
     * @see MultiCategorizerUnchecked
     */
    export class MultiCategorizerChecked<T> implements LocalStoreItemMultiCategorizer<T> {
        private _categories: string[];
        private _checkFunc: (key: string, value: T) => string;


        /**
         * @param checkFunc a function which given a store item's key, returns true if the key matches this category, false if not
         */
        constructor(categories: string[], checkFunc: (key: string, value: T) => string) {
            this._categories = categories;
            this._checkFunc = checkFunc;
        }


        public get categories() { return this._categories; }


        /** Use the custom 'checkFunc', but wrap it with a check to ensure the returned category matches one of this categorizer's categories
         */
        public findMatch(key: string, value: T): string {
            var resCategory = this._checkFunc(key, value);
            if (resCategory != null && this.categories.indexOf(resCategory) < 0) {
                throw new Error("key '" + key.substr(0, 100) + "' does not match any of this categorizer's categories: " + this.categories.join(", ") + ", data: " + JSON.stringify(value).substr(0, 100));
            }
            return resCategory;
        }

    }




    /** This categorizer does not checking and simply wraps a provided 'checkFunc'
     * @see MultiCategorizerChecked
     */
    export class MultiCategorizerUnchecked<T> implements LocalStoreItemMultiCategorizer<T> {
        public findMatch: (key: string, value: T) => string;


        /**
         * @param checkFunc a function which given a store item's key, returns true if the key matches this category, false if not
         */
        constructor(checkFunc: (key: string, value: T) => string) {
            this.findMatch = checkFunc;
        }

    }

}

export = BasicCategorizers;