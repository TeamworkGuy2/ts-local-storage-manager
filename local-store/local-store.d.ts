﻿/** TypeScript interfaces for 'localStorage' wrappers
 */

declare interface ReadOnlyLocalStore {
    /** the number of key-value pairs in this store */
    length: number;

    /** Get the value associated with a key
     * @param {string} key: the name of the value to retrieve
     * @param {boolean} [plainString=false]: true to return the retrieved value as is, false to parse it before returning it
     * @param {any} the value associated with the key, or null if the key does not exist
     */
    getItem(key: string, plainString?: boolean): any;

    /** Returns the n-th element in the store (in the order the items were added) */
    key(index: number): string;

    /**
     * @param {string} key: the key to lookup
     * @return true if the item exist, false if not
     */
    hasItem(key: string): boolean;

    /**
     * @return {string[]} a set of all the keys this collection contains
     */
    getKeys(): string[];

    /** Get all of the values in this key-value store
     */
    getData(plainString?: boolean): any[];
}


declare interface LocalStore extends ReadOnlyLocalStore {

    /** Associate a value with a specific key
     * @param {string} key: the key
     * @param {any} value: the value to associate with the key
     * @param {boolean} [plainString=false]: true to return the retrieved value as is, false to parse it before returning it
     */
    setItem(key: string, value: any, plainString?: boolean): void;

    /** Remove a key and it's associated value
     * @param {string} key: the key to remove
     * @return the value associated key that is now removed
     */
    removeItem(key: string): void;

    /** Remove all key-values from this store */
    clear(): void;
}


declare interface UniqueStore extends ReadOnlyLocalStore {

    /** Add a new value to this collection
     * @param {string} key: the key
     * @param {any} value: the value to associate with the key
     * @param {boolean} [plainString=false]: true to return the retrieved value as is, false to parse it before returning it
     * @return {string} the newly generated unique key for {@code value}
     */
    addItem(value: any, plainString?: boolean): string;

    /** Remove a key and it's associated value
     * @param {string} key: the key to remove
     * @return the value associated key that is now removed
     */
    removeItem(key: string): void;

    /** Remove all key-values from this store */
    clear(): void;
}


/** A 'Storage' like interface, minus the string map
 */
declare interface StorageLike {
    /** the number of key-value pairs in this store */
    length: number;

    /** Remove all key-values from this store */
    clear(): void;

    /** Get an item by key */
    getItem(key: string): any;

    /** Returns the n-th element in the store (in the order the items were added) */
    key(index: number): string;

    /** Remove an item by key */
    removeItem(key: string): void;

    /** Add a new item or overwrite an existing item */
    setItem(key: string, data: string): void;
}


declare interface KeyCategorizer {
    category: string;

    /** Modify a key based on this categorizer's category so that it can recognize the key later (i.e. 'isMatchingCategory(modifyKey(key))' always returns true)
     * @return the new key
     */
    modifyKey(key: string): string;

    /** Given a modified key (i.e. the return value from 'modifyKey()') return the unmodified original key
     * @param key the modified key
     */
    unmodifyKey(key: string): string;

    /** Check if a key matches this category
     * @param key the key to check
     */
    isMatchingCategory(key: string): boolean;
}


interface RemovedItem {
    key: string;
    value: any;
    keyId: number;
}


interface ItemsRemovedEvent {
    store: LocalStore;
    removedItems: RemovedItem[];
    storageError: {
        message: string;
        error: any;
    };
    removedCount: number;
}


declare interface FullStoreHandler {
    (storeI: LocalStore, err: any): void;
}


declare interface ItemsRemovedCallback {
    (store: LocalStore, removedItems: RemovedItem[], storageError: { message: string; error: any; }, removedCount: number): void;
}