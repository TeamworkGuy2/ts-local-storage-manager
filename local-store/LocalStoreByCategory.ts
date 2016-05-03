import LocalStoreByTimestamp = require("./LocalStoreByTimestamp");
import LocalStoreWrapper = require("./LocalStoreWrapper");
import MemoryStore = require("./MemoryStore");
import ClearFullStore = require("./ClearFullStore");

/**
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
class LocalStoreByCategory<M> {
    private timestampKeyGenerator: () => (string | number);
    public rootStore: LocalStore;
    public stores: M;
    private storeNames: string[];
    private fullStoreHandlers: { [key: string]: LocalStoreByCategory.CategoryStore };


    constructor(rootStore: LocalStore, timestampKeyGenerator: () => (string | number), storeMap: M) {
        this.rootStore = rootStore;
        this.timestampKeyGenerator = timestampKeyGenerator;
        this.stores = <M>{};
        this.fullStoreHandlers = {};

        var handleFullStore: FullStoreHandler = (store, err) => {
            this.handleFullStores(store, err);
        };

        var keys = Object.keys(storeMap);
        this.storeNames = keys;

        for (var i = 0, size = keys.length; i < size; i++) {
            var key = keys[i];
            var store: LocalStoreByCategory.CategoryStore = storeMap[key];
            store.handleFullStoreCallback = handleFullStore;
            this.stores[key] = store.store;
            this.fullStoreHandlers[key] = store;
        }
    }


    public getStore(category: string) {
        var store = this.stores[category];
        return store;
    }


    public getStoresContainingData(): { [category: string]: UniqueStore } {
        var storesWithData: { [category: string]: UniqueStore } = {};
        var keys = Object.keys(this.stores);
        for (var i = 0, size = keys.length; i < size; i++) {
            var categoryStore = this.stores[keys[i]];
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
            var categoryStore = this.fullStoreHandlers[name];
            var res = categoryStore.clearFullStore.clearOldItems(categoryStore.baseStore, false, err);
        }
    }

}


module LocalStoreByCategory {

    export interface CategoryStore {
        store: UniqueStore;
        baseStore: LocalStore;
        clearFullStore: ClearFullStore;
        handleFullStore?: FullStoreHandler;
        handleFullStoreCallback?: FullStoreHandler;
        categorizer?: KeyCategorizer;
    }


    interface EmptyBuilder {
        addStores<U>(stores: U): Builder<U>;
        toStore(categorizer: KeyCategorizer, itemsRemovedCallback?: ItemsRemovedCallback, maxValueSizeBytes?: number, removePercentage?: number): UniqueStore;
    }




    export class Builder<T> implements EmptyBuilder {
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


        public toStore(categorizer: KeyCategorizer, itemsRemovedCallback?: ItemsRemovedCallback, maxValueSizeBytes?: number, removePercentage?: number): UniqueStore {
            var clearFullStore = ClearFullStore.newInst((key) => Number.parseInt(categorizer.unmodifyKey(key)), itemsRemovedCallback, removePercentage);

            var res: CategoryStore = {
                baseStore: null,
                categorizer: categorizer,
                clearFullStore: clearFullStore,
                handleFullStore: null,
                handleFullStoreCallback: null,
                store: null,
            };

            var fullStoreHandlerFunc = (storeInst, err) => res.handleFullStoreCallback(storeInst, err);
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
            if (ary.length < 1 || index < 0 || index >= ary.length) { return ary; }

            for (var i = index + 1; i < size; i++) {
                ary[i - 1] = ary[i];
            }
            ary[size - 1] = null;
            ary.length = size - 1;
            return ary;
        }

    }

}

export = LocalStoreByCategory;