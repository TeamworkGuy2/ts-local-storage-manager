TS Local Store and More
==============

Dependencies:
none

TypeScript wrappers for treating 'Storage' instances (i.e. 'localStorage' type objects in browsers) like collections. 

#### The goal:
Provide an easy to setup (5-10 loc) wrapper for 'localStorage' which can be used throughout a project in place of localStorage and also:
* (work in progress) exposes changes to the underlying 'localStorage' object seamlessly (i.e. if a 3rd party library modifies 'localStorage', this library objects will reflect those changes)
* provides meta-data tracking, such as the total size of the data in 'localStorage', whether local storage is currently full, history of added/removed items, whether an item is a string or a stringified object
* callbacks to track when old items are removed due to local storage being full, useful for archiving old data


#### Major API Pieces:
LocalStoreByCategory - a class which contains a group of other LocalStores and allows you to treat 'localStorage' like a group of collections. 

MemoryStore - provides a pure in-memory implementation of the interface exposed by 'localStorage' (i.e. lib.d.ts 'Storage'). 

LocalStoreFromStorage and LocalStoreWrapper - provide additional validation ontop of existing 'StorageLike' or 'LocalStore' objects. 


See the /test directory for example usage of the functions in this project. 
