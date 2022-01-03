# Change Log
All notable changes to this project will be documented in this file.
This project does its best to adhere to [Semantic Versioning](http://semver.org/).


--------
### [0.11.0](N/A) - 2022-01-02
#### Changed
* Update to TypeScript 4.4


--------
### [0.10.0](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/d0380f782f18750d2324d03c30fc4dd11c6b8a7f) - 2021-06-12
#### Changed
* Update to TypeScript 4.3


--------
### [0.9.0](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/f21d0c212fab243ffb6f25aaf231cf0a315ac698) - 2020-09-04
#### Changed
* Update to TypeScript 4.0


--------
### [0.8.0](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/9be29a84a670bde3c41e00eb1955c2683a10e5ba) - 2020-04-20
#### Changed
* `LocalStorageStore.newTimestampInst()` added optional `keyParser` parameter
* `LocalStoreByTimestamp.newTimestampInst()` added optional `keyParser` parameter
* `LocalStorageStore.MAX_ITEM_SIZE_BYTES` is now public
* Improve README

#### Removed
* `LocalStorageStore.newInst()`, use constructor instead


--------
### [0.7.0](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/33dd0e01cae0763f10053c365d7d716844e607d5) - 2020-04-16
#### Changed
* Added optional `keyGenerator` parameter to `LocalStoreByTimestamp.newTimestampInst()`
* Cleaned up `UniqueChronologicalKeys` code to better work with timestamp rounding in modern browsers due to fingerprinting concerns and attacks like Spectre
  * `uniqueTimestamp()` renamed `uniqueTimestampBrowser()`
  * new `uniqueTimestamp()` created that provides the best implementation for the currently detected environment
* Added a unit test to assess the uniqueness of UniqueChronologicalKeys functions.

#### Removed
* Removed `LocalStoreByTimestamp.newInst()`, use constructor instead


--------
### [0.6.17](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/aeed679072e64e583a92bbc73e9d6165567c653a) - 2019-11-08
#### Changed
* Update to TypeScript 3.7


--------
### [0.6.16](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/66714b5533b987758baf1b6071e377b6db09dbd9) - 2019-07-04
#### Changed
* Update to TypeScript 3.5
* Marked `ReadOnlyLocalStore.length`, `LocalStore.Array.key`, and `LocalStore.Var.key` readonly
* Fixed `LocalStorageStore` and `LocalStorageWrapper` `setItem()` to always throw storage error after retry attempts fail


--------
### [0.6.15](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/048f1c7309becd1a0305c3d9e5efcf1a0bb903b6) - 2019-05-10
#### Changed
* Removed `package.json` `@types/node` dependency
* Removed `console.error()` error logging calls since all occurances also `throw new Error()`, calling code can decide how to log


--------
### [0.6.14](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/ffdc3aff84bf1f5b5865e7c93706c3b6284b2812) - 2018-12-29
#### Changed
* Cleanup documentation
* Cleanup `LocalStorageStore.newTimestampInst()`


--------
### [0.6.13](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/ee609588c403c7ee2acdb5229221b90f650b0560) - 2018-12-29
#### Changed
* Renamed `GLOBAL` -> `global` (Node.js has deprecated `GLOBAL`)


--------
### [0.6.12](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/cb725db332d488c2271686e2a6444329174acff6) - 2018-12-29
#### Changed
* Adjusted `LocalStoreByTimestamp.newTimestampInst()` to use uniqueTimestamp in the browser and uniqueTimestampNodeJs in Node.js


--------
### [0.6.11](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/3f0bd118363ef55fcb616e61c5520e7d0717834b) - 2018-12-29
#### Changed
* Update to TypeScript 3.2
* Update @types dependencies
* Remove `tsconfig.json lib "dom"` option since we're only using `window.performance` in `UniqueChronologicalKeys`


--------
### [0.6.10](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/20f4dbdef436ba86be0d6edd6edc371500f8bb88) - 2018-10-14
#### Changed
* Update to TypeScript 3.1
* Update dev dependencies and @types
* Enable `tsconfig.json` `strict` and fix compile errors
* Removed compiled bin tarball in favor of git tags and github releases


--------
### [0.6.9](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/8802da52285b7438979376ea8c10c9d0288d640b) - 2018-04-09
#### Changed
* Added release tarball and npm script `build-package` to package.json referencing external process to generate tarball


--------
### [0.6.8](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/42075bd69b19ac5c727e4d7bf54d66f93ee0aba4) - 2018-04-02
#### Changed
* Update to TypeScript 2.8
* Update tsconfig.json with `noImplicitReturns: true` and `forceConsistentCasingInFileNames: true`


--------
### [0.6.7](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/a359f60af8aba85eca682b0ffb54364a45cdc3c6) - 2018-03-01
#### Changed
* Update to TypeScript 2.7
* Update dependencies: mocha, @types/chai, @types/mocha, @types/node


--------
### [0.6.6](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/fa3b1c98bf02c50e9cf1aef3d75dee6dc25d035e) - 2017-11-17
#### Changed
* `tsconfig.json` added `strictNullChecks`, `noImplicitAny`, and `noImplicitThis` and setup code to handle null types.


--------
### [0.6.5](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/08eaa83bccf0e51fe2442d8aba4ae197a5224434) - 2017-08-06
#### Changed
* Update to TypeScript 2.4


--------
### [0.6.4](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/292a1dc21f3e4328c9238c398f7bbe4a68793c36) - 2017-05-09
#### Changed
* Update to TypeScript 2.3, add tsconfig.json, use @types/ definitions
* Update documentation for easier use with Visual Studio


--------
### [0.6.3](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/06c461007a4891df783dd9c3b9309dc7e3c0e607) - 2016-09-17
#### Changed
* Added some (by default) redundant type casts so this library can work with ts-date-times if the built in Date class/methods are setup to return TimestampUtc instead of number


--------
### [0.6.2](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/cdba6cc36c1a88e35336ef807130173203990401) - 2016-06-27
#### Fixed
* LocalStorageStore getKeys() bug not returning new array each time it is called, was leaking underlying array that was modified by other LocalStorageStore actions


--------
### [0.6.1](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/dcfc7d008c7c5f9d1795d7ba76f8b9282fc70a6b) - 2016-06-01
#### Changed
* Added missing data type and some documentation
* Added some missing optional parameters to the static LocalStoreEntry constructor functions

#### Fixed
* LocalStoreEntry constructors weren't saving 'store' references


--------
### [0.6.0](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/5c8b4ef358c3bb0668ef015252e6c54d41d3b457) - 2016-05-28
#### Added
* LocalStoreEntry with Var, Array, and MapIndividualKeys classes for accessing strongly typed LocalStore key-values
* LocalStorageStore.newTimestampInst();

#### Changed
* Moved the following local-store.d.ts interfaces into a new LocalStore module
  * KeyCategorizer
  * RemovedItem
  * ItemsRemovedEvent
  * FullStoreHandler
  * ItemsRemovedCallback
* Switched unit tests from qunit to chai and mocha
* Moved test files out of test/local-store/ directory into root of test/ directory

#### Removed
* Removed LocalStorageStore getDefaultInst() and getSessionInst() in favor of newTimestampInst()


--------
### [0.5.1](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/13eb8e1fc4b2ace094e12eefac935a80c75bb954) - 2016-05-03
#### Changed
* ClearFullStore itemsRemovedCallback changed to not get called when 0 items are removed from a store
* Improved some test cases


--------
### [0.5.0](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/8ec036e4a95eeb1b973a87f4f1d53a87ebc82baa) - 2016-05-02
#### Added
LocalStoreByCategory internal handling for full stores, now all category stores are cleared when one is full to ensure enough space is freed. (possible future optimization would be to clear the store that first reported being full first and only clear further stores until enough space is available for the current operation...)

#### Changed
* Clarified GLOBAL type
* Renamed LocalStoreByTimestamp newUniqueTimestampInst() -> newTimestampInst()
* Renamed some private methods
* ClearFullStore itemsRemovedCallback function now returns the string version of removed values

#### Removed
LocalStoreByTimestamp.getDefaultInst() - you really should create your own

#### Fixed
* LocalStorageStoreTest issue caused by ClearFullStore itemsRemovedCallback changed to return string values
* LocalStoreWrapper setItem() and removeItem() double stringify/parsing


--------
### [0.4.0](https://github.com/TeamworkGuy2/ts-local-storage-manager/commit/146ed0656ce74fe85cb4b989acdd87687cc401d0) - 2016-04-26
#### Changed
Renamed the project from ts-local-store-and-more -> ts-local-storage-manager


--------
### [0.3.0](https://github.com/TeamworkGuy2/ts-local-store-and-more/commit/187736587f459758ff6e8e997f925da5a814b13e) - 2016-04-24
#### Added
* MemoryStore validation parameters to limit total size of data in the store or limit the number of items in the store

#### Changed
Extensive refactoring to add support for full store callbacks:
* LocalStoreFromStorage - added constructor and newInst() 'handleFullStore' parameters
* LocalStoreByTimestamp.new*Inst() and LocalStoreByCategory.toStore() - added 'itemsRemovedCallback' parameter to allow for customization of the item removal process when items are removed from a full store
* ClearFullStore - also got a 'itemsRemovedCallback' constructor and newInst() parameter, returns more detailed information about the items removed. the 'logInfo' flag now supports node.js (via GLOBAL.process.hrtime()) as well as browser enviroments when attempting to time the removal process


--------
### [0.2.0](https://github.com/TeamworkGuy2/ts-local-store-and-more/commit/02517d5feda72a9ebf8269e6a95cc0ab21b43b1e) - 2016-04-23
#### Added
* A CHANGELOG.md covering all previous releases after being reminded about the need for change logs from http://keepachangelog.com/
* LocalStoreDefault has been split for 'StorageLike' vs 'LocalStore' wrappers:
  * local-store/LocalStoreWrapper.ts - a wrapper for another LocalStore instance
  * local-store/LocalStoreFromStorage.ts - much of the original LocalStoreDefault code, a validation layer ontop of a StorageLike object

#### Changed
* Refactored BasicCategorizers - no more multi-categorizers, the LocalStoreItemCategorizer interface is now based around keys only, not values, renamed createKeyPrefixCategorizer() -> newPrefixCategorizer() and createKeySuffixCategorizer() -> newSuffixCategorizer()
* ClearFullStore is no longer tied to a specific store, you pass to the store the clearOldItems() method, no more 'Number.parseInt' default extractor, you must provide an extractor function
* LocalStoreByTimestamp renamed property 'timestampKeyGenerator' -> 'keyGenerator'
* Renamed UniqueChronologicalKey -> UniqueChronologicalKeys

#### Removed
LocalStoreDefault - see above, split into new LocalStoreWrapper and LocalStoreFromStorage


--------
### [0.1.0](https://github.com/TeamworkGuy2/ts-local-store-and-more/commit/2aedb417a517330b872f507bb40cf0abfaa11a25) - 2016-03-28
#### Added
Initial code commit, included in /local-store/ directory:
* BasicCategorizers.ts - create prefix and suffix categorizers (categorize keys based on the string prefix/suffix)
* ClearFullStore.ts - clear old chronological keys from a LocalStore
* LocalStoreByCategory.ts - builder and storage for multiple UniqueStore instances managed by one central object
* LocalStoreByTimestamp.ts - a UniqueStore implementation (constructor takes a key generator function and exposes addItem() function which auto-generates a chronological key)
* LocalStoreDefault.ts - a LocalStore implementation which provides additional validation ontop of a StorageLike object
* MemoryStore.ts - A TypeScript in-mem implementation of the lib.d.ts 'Storage' interface (i.e. localStorage)
* UniqueChronologicalKey.ts - static methods for generating chronological keys
* local-store.d.ts - Also includes some helper classes and qunit test cases