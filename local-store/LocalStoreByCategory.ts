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


    constructor(rootStore: LocalStore, timestampKeyGenerator: () => (string | number), storeMap: M) {
        this.rootStore = rootStore;
        this.timestampKeyGenerator = timestampKeyGenerator;
        this.stores = <M>{};

        var keys = Object.keys(storeMap);
        for (var i = 0, size = keys.length; i < size; i++) {
            this.stores[keys[i]] = storeMap[keys[i]];
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

}

module LocalStoreByCategory {

    interface EmptyBuilder {
        addStores<U>(stores: U): Builder<U>;
        toStore(categorizer: KeyCategorizer): UniqueStore;
    }


    export class Builder<T> implements EmptyBuilder {
        private storeInst: LocalStore;
        private keyGenerator: () => (string | number);
        private stores: T;

        constructor(storeInst: LocalStore, keyGenerator: () => (string | number)) {
            this.storeInst = storeInst;
            this.keyGenerator = keyGenerator;
            this.stores = <T>{};
        }


        public addStores<U extends { [name: string]: UniqueStore }>(stores: U): Builder<T & U> {
            var keys = Object.keys(stores);
            for (var i = 0, size = keys.length; i < size; i++) {
                this.stores[keys[i]] = stores[keys[i]];
            }
            return <Builder<T & U>><any>this;
        }


        public build(): LocalStoreByCategory<T> {
            return new LocalStoreByCategory(this.storeInst, this.keyGenerator, this.stores);
        }


        public toStore(categorizer: KeyCategorizer, maxValueSizeBytes?: number, removePercentage?: number): UniqueStore {
            var fullStoreHandler = new ClearFullStore((key) => Number.parseInt(categorizer.unmodifyKey(key)), removePercentage);
            var fullStoreHandlerFunc = (storeInst, err) => fullStoreHandler.clearOldItems(storeInst, false, err);

            var storeWrapper = LocalStoreWrapper.newInst(this.storeInst, fullStoreHandlerFunc, true, true, maxValueSizeBytes, true, (key) => categorizer.isMatchingCategory(key));

            return new LocalStoreByTimestamp(storeWrapper, () => categorizer.modifyKey(this.keyGenerator() + ''), fullStoreHandlerFunc);
        }


        public static newInst<U extends { [name: string]: UniqueStore }>(storeInst: LocalStore, keyGenerator: () => (string | number)): EmptyBuilder {
            return new Builder<U>(storeInst, keyGenerator);
        }

    }

}

export = LocalStoreByCategory;