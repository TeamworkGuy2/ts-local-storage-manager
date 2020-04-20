import LocalStoreByTimestamp = require("./LocalStoreByTimestamp");
import LocalStoreWrapper = require("./LocalStoreWrapper");
import ClearFullStore = require("./ClearFullStore");

/** A category store contains multiple UniqueStores each tracking a subset of keys from a main 'root' LocalStore based on KeyCategorizer.
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
class LocalStoreByCategory<M extends object> {
    private keyGenerator: () => (string | number);
    public rootStore: LocalStore;
    public stores: M;
    private storeNames: string[];
    private storeHandlers: { [key: string]: LocalStoreByCategory.CategoryStore };


    constructor(rootStore: LocalStore, keyGenerator: () => (string | number), storeMap: M) {
        this.rootStore = rootStore;
        this.keyGenerator = keyGenerator;
        this.stores = <M>{};
        this.storeHandlers = {};

        var handleFullStore: LocalStore.FullStoreHandler = (store, err) => {
            this.handleFullStores(store, err);
        };

        var keys = Object.keys(storeMap);
        this.storeNames = keys;

        for (var i = 0, size = keys.length; i < size; i++) {
            var key = keys[i];
            var store: LocalStoreByCategory.CategoryStore = (<any>storeMap)[key];
            store.handleFullStoreCallback = handleFullStore;
            (<any>this.stores)[key] = store.store;
            this.storeHandlers[key] = store;
        }
    }


    public getStore(category: string): UniqueStore {
        return (<any>this.stores)[category];
    }


    public getStoresContainingData(): { [category: string]: UniqueStore } {
        var storesWithData: { [category: string]: UniqueStore } = {};
        var keys = Object.keys(this.stores);
        for (var i = 0, size = keys.length; i < size; i++) {
            var categoryStore = (<any>this.stores)[keys[i]];
            if (categoryStore.length > 0) {
                storesWithData[keys[i]] = categoryStore;
            }
        }
        return storesWithData;
    }


    private handleFullStores(store: LocalStore, err: any) {
        // loop through and clear each store when one is full since they all share the same base store
        for (var i = 0, size = this.storeNames.length; i < size; i++) {
            var name = this.storeNames[i];
            var categoryStore = this.storeHandlers[name];
            var res = categoryStore.clearFullStore.clearOldItems(categoryStore.baseStore, false, err);
        }
    }

}


module LocalStoreByCategory {

    export interface CategoryStore {
        store: UniqueStore;
        baseStore: LocalStore;
        clearFullStore: ClearFullStore;
        handleFullStore?: LocalStore.FullStoreHandler;
        handleFullStoreCallback?: LocalStore.FullStoreHandler;
        categorizer?: LocalStore.KeyCategorizer;
    }


    interface EmptyBuilder {
        addStores<U extends { [name: string]: UniqueStore }>(stores: U): Builder<U>;
        toStore(categorizer: LocalStore.KeyCategorizer, itemsRemovedCallback?: LocalStore.ItemsRemovedCallback, maxValueSizeBytes?: number, removePercentage?: number): UniqueStore;
    }




    export class Builder<T extends object> implements EmptyBuilder {
        private storeInst: LocalStore;
        private keyGenerator: () => (string | number);
        private stores: { [key: string]: CategoryStore };
        private tmpStores: UniqueStore[];
        private tmpCategoryStores: CategoryStore[];


        constructor(storeInst: LocalStore, keyGenerator: () => (string | number)) {
            this.storeInst = storeInst;
            this.keyGenerator = keyGenerator;
            this.stores = {};
            this.tmpStores = [];
            this.tmpCategoryStores = [];
        }


        public addStores<U extends { [name: string]: UniqueStore }>(stores: U): Builder<T & U> {
            var keys = Object.keys(stores);
            for (var i = 0, size = keys.length; i < size; i++) {
                var key = keys[i];
                var store = stores[key];
                var idx = this.tmpStores.indexOf(store);
                var categoryStore = this.tmpCategoryStores[idx];
                Builder.removeIdx(this.tmpStores, idx);
                Builder.removeIdx(this.tmpCategoryStores, idx);

                this.stores[key] = categoryStore;
            }
            return <Builder<T & U>><any>this;
        }


        public build(): LocalStoreByCategory<T> {
            return new LocalStoreByCategory(this.storeInst, this.keyGenerator, <T><any>this.stores);
        }


        public toStore(categorizer: LocalStore.KeyCategorizer, itemsRemovedCallback?: LocalStore.ItemsRemovedCallback, maxValueSizeBytes?: number, removePercentage?: number): UniqueStore {
            var clearFullStore = ClearFullStore.newInst((key) => Number.parseInt(categorizer.unmodifyKey(key)), itemsRemovedCallback, removePercentage);

            var res: CategoryStore = {
                baseStore: <LocalStore><never>null,
                categorizer: categorizer,
                clearFullStore: clearFullStore,
                handleFullStore: <undefined><any>null,
                handleFullStoreCallback: <undefined><any>null,
                store: <UniqueStore><never>null,
            };

            var fullStoreHandlerFunc: LocalStore.FullStoreHandler = (storeInst, err) => (<LocalStore.FullStoreHandler>res.handleFullStoreCallback)(storeInst, err); // get's set by LocalStoreByCategory constructor
            var storeWrapper = LocalStoreWrapper.newInst(this.storeInst, fullStoreHandlerFunc, true, true, maxValueSizeBytes, true, (key) => categorizer.isMatchingCategory(key));

            res.handleFullStore = fullStoreHandlerFunc;
            //res.handleFullStoreCallback = null;
            res.baseStore = storeWrapper;
            res.store = new LocalStoreByTimestamp(storeWrapper, () => categorizer.modifyKey(this.keyGenerator() + ''), fullStoreHandlerFunc);

            this.tmpStores.push(res.store);
            this.tmpCategoryStores.push(res);

            return res.store;
        }


        public static newInst<U extends { [name: string]: UniqueStore }>(storeInst: LocalStore, keyGenerator: () => (string | number)): EmptyBuilder {
            return new Builder<U>(storeInst, keyGenerator);
        }


        public static removeIdx<E>(ary: E[], index: number): E[] {
            if (ary == null) { return ary; }
            var size = ary.length;
            if (size < 1 || index < 0 || index >= size) { return ary; }

            for (var i = index + 1; i < size; i++) {
                ary[i - 1] = ary[i];
            }
            ary[size - 1] = <never>null;
            ary.length = size - 1;
            return ary;
        }

    }

}

export = LocalStoreByCategory;