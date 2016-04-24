# Change Log
All notable changes to this project will be documented in this file.
This project does its best to adhere to [Semantic Versioning](http://semver.org/).


--------
### [0.2.0](N/A) - 2016-04-23
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