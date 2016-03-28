"use strict";
/**
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
var BasicCategorizers;
(function (BasicCategorizers) {
    /** A categorizer based on 'key' string prefixes from key-value pairs
     */
    function createKeyPrefixCategorizer(prefix) {
        return new DefaultCategorizer(prefix, function (key) { return key.startsWith(prefix); });
    }
    BasicCategorizers.createKeyPrefixCategorizer = createKeyPrefixCategorizer;
    /** A categorizer based on 'key' string suffixes from key-value pairs
     */
    function createKeySuffixCategorizer(suffix) {
        return new DefaultCategorizer(suffix, function (key) { return key.endsWith(suffix); });
    }
    BasicCategorizers.createKeySuffixCategorizer = createKeySuffixCategorizer;
    /** Default categorizer implementation
     */
    var DefaultCategorizer = (function () {
        /**
         * @param checkFunc a function which given a store item's key, returns true if the key matches this category, false if not
         */
        function DefaultCategorizer(category, checkFunc) {
            this._category = category;
            this.isMatch = checkFunc;
        }
        Object.defineProperty(DefaultCategorizer.prototype, "category", {
            get: function () { return this._category; },
            enumerable: true,
            configurable: true
        });
        return DefaultCategorizer;
    }());
    BasicCategorizers.DefaultCategorizer = DefaultCategorizer;
    /** This categorizer ensures that the category names returned by the constructor 'checkFunc' parameter, always match one of the provided 'categories', else throw an error
     * @see MultiCategorizerUnchecked
     */
    var MultiCategorizerChecked = (function () {
        /**
         * @param checkFunc a function which given a store item's key, returns true if the key matches this category, false if not
         */
        function MultiCategorizerChecked(categories, checkFunc) {
            this._categories = categories;
            this._checkFunc = checkFunc;
        }
        Object.defineProperty(MultiCategorizerChecked.prototype, "categories", {
            get: function () { return this._categories; },
            enumerable: true,
            configurable: true
        });
        /** Use the custom 'checkFunc', but wrap it with a check to ensure the returned category matches one of this categorizer's categories
         */
        MultiCategorizerChecked.prototype.findMatch = function (key, value) {
            var resCategory = this._checkFunc(key, value);
            if (resCategory != null && this.categories.indexOf(resCategory) < 0) {
                throw new Error("key '" + key.substr(0, 100) + "' does not match any of this categorizer's categories: " + this.categories.join(", ") + ", data: " + JSON.stringify(value).substr(0, 100));
            }
            return resCategory;
        };
        return MultiCategorizerChecked;
    }());
    BasicCategorizers.MultiCategorizerChecked = MultiCategorizerChecked;
    /** This categorizer does not checking and simply wraps a provided 'checkFunc'
     * @see MultiCategorizerChecked
     */
    var MultiCategorizerUnchecked = (function () {
        /**
         * @param checkFunc a function which given a store item's key, returns true if the key matches this category, false if not
         */
        function MultiCategorizerUnchecked(checkFunc) {
            this.findMatch = checkFunc;
        }
        return MultiCategorizerUnchecked;
    }());
    BasicCategorizers.MultiCategorizerUnchecked = MultiCategorizerUnchecked;
})(BasicCategorizers || (BasicCategorizers = {}));
module.exports = BasicCategorizers;
