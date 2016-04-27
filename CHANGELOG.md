# Change Log
All notable changes to this project will be documented in this file.
This project does its best to adhere to [Semantic Versioning](http://semver.org/).


#### [Unrleased]
* Clarified GLOBAL type


--------
### [0.4.0](N/A) - 2016-04-26
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