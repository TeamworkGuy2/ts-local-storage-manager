# Change Log
All notable changes to this project will be documented in this file.
This project does its best to adhere to [Semantic Versioning](http://semver.org/).


--------
### [0.6.6](N/A) - 2017-11-17
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
* Added some (by default) redudant type casts so this library can work with ts-date-times if the built in Date class/methods are setup to return TimestampUtc instead of number


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