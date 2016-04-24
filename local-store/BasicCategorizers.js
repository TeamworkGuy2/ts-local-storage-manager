"use strict";
/**
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
var BasicCategorizers;
(function (BasicCategorizers) {
    /** A categorizer based on 'key' string prefixes from key-value pairs
     */
    function newPrefixCategorizer(prefix) {
        return new DefaultCategorizer(prefix, function (key) {
            return prefix + key;
        }, function (key) {
            return key.substr(prefix.length);
        }, function (key) {
            return key != null && key.substr(0, prefix.length) === prefix;
        });
    }
    BasicCategorizers.newPrefixCategorizer = newPrefixCategorizer;
    /** A categorizer based on 'key' string suffixes from key-value pairs
     */
    function newSuffixCategorizer(suffix) {
        return new DefaultCategorizer(suffix, function (key) {
            return key + suffix;
        }, function (key) {
            return key.substr(0, key.length - suffix.length);
        }, function (key) {
            return key != null && key.length >= suffix.length && key.substr(key.length - suffix.length) === suffix;
        });
    }
    BasicCategorizers.newSuffixCategorizer = newSuffixCategorizer;
    /** Default categorizer implementation
     */
    var DefaultCategorizer = (function () {
        /**
         * @param checkFunc a function which given a store item's key, returns true if the key matches this category, false if not
         */
        function DefaultCategorizer(category, modifyKey, unmodifyKey, matchingKey) {
            this.category = category;
            this.modifyKey = modifyKey;
            this.unmodifyKey = unmodifyKey;
            this.isMatchingCategory = matchingKey;
        }
        return DefaultCategorizer;
    }());
    BasicCategorizers.DefaultCategorizer = DefaultCategorizer;
})(BasicCategorizers || (BasicCategorizers = {}));
module.exports = BasicCategorizers;
