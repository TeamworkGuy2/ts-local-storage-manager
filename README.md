TypeScript Local Storage Manager
==============

Dependencies:
none

TypeScript wrappers for treating 'Storage' instances (i.e. 'localStorage' type objects in browsers) like collections. 

### The Goal:
Provide an easy to setup wrapper for 'localStorage' which can be used throughout a project in place of localStorage and also:
* (work in progress) exposes changes to the underlying 'localStorage' object seamlessly (i.e. if a 3rd party library modifies 'localStorage', the objects/classes in this library should reflect those changes)
* provides meta-data tracking, such as:
  * the total size of the data in 'localStorage'
  * whether local storage is currently full
  * history of added/removed items
  * whether an item is a string or a stringified object
* callbacks to track when old items are removed due to local storage being full, useful for archiving old data

Example:
```ts
import MemoryStore = require("ts-local-storage-manager/local-store/MemoryStore");
import LocalStorageStore = require("ts-local-storage-manager/local-store/LocalStorageStore");

var store = LocalStorageStore.newTimestampInst(typeof window !== "undefined" ? localStorage : new MemoryStore(5000000));

var doJsonEncode = true; // supports objects as 'data', if false only strings, numbers, and booleans can be properly stored in the 'store'
var data = ...;

store.setItem("key-1234", data, doJsonEncode);

var result = store.getItem("key-1234", doJsonEncode);

store.removeItem("key-1234");
```

## API:
### LocalStoreByCategory
A class which contains a group of other LocalStores and allows you to treat 'localStorage' like a group of collections.

### LocalStorageStore and LocalStoreWrapper
Provide additional validation on top of existing 'StorageLike' or 'LocalStore' objects.

### MemoryStore
Provides a pure in-memory implementation of the interface exposed by 'localStorage' (i.e. lib.d.ts 'Storage').

### LocalStoreEntry
Wrappers for accessing a strongly typed LocalStore key-value without having to retype the key each time you access it.

See the `test/` directory for example usage of the functions in this project.
