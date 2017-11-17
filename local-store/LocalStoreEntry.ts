module LocalStoreEntry {

    export class Array<T> implements LocalStore.Array<T> {
        private store: LocalStore;
        public key: string; // readonly
        private defaultValue: T[];

        constructor(store: LocalStore, key: string, defaultValue?: T[]) {
            this.store = store;
            this.key = key;
            this.defaultValue = <T[]><any>defaultValue;
        }

        public get(): T[] {
            var res = this.store.getItem(this.key);
            return res != null ? res : this.defaultValue;
        }

        public getRaw(): string {
            return this.store.getItem(this.key, true);
        }

        public set(data: T[]) {
            this.store.setItem(this.key, data);
        }

        public remove(): void {
            this.store.removeItem(this.key);
        }
    }


    export class Var<T> implements LocalStore.Var<T> {
        private store: LocalStore;
        public key: string; // readonly
        private defaultValue: T;
        private plainStr: boolean;

        constructor(store: LocalStore, key: string, defaultValue?: T, alwaysRaw = false) {
            this.store = store;
            this.key = key;
            this.defaultValue = <T><any>defaultValue;
            this.plainStr = alwaysRaw;
        }

        public get(): T {
            var res = this.store.getItem(this.key, this.plainStr);
            return res != null ? res : this.defaultValue;
        }

        public getRaw(): string {
            return this.store.getItem(this.key, true);
        }

        public set(data: T) {
            this.store.setItem(this.key, data, this.plainStr);
        }

        public remove(): void {
            this.store.removeItem(this.key);
        }
    }


    export class MapIndividualKeys<K, V> implements LocalStore.MapIndividualKeys<K, V> {
        private store: LocalStore;
        private keyGen: (key: K) => string;

        constructor(store: LocalStore, keyGen: (key: K) => string) {
            this.store = store;
            this.keyGen = keyGen;
        }

        public get(key: K): V {
            var resKey = this.keyGen(key);
            return this.store.getItem(resKey);
        }

        public getRaw(key: K): string {
            var resKey = this.keyGen(key);
            return this.store.getItem(resKey, true);
        }

        public set(key: K, data: V) {
            var resKey = this.keyGen(key);
            this.store.setItem(resKey, data);
        }

        public remove(key: K): void {
            var resKey = this.keyGen(key);
            this.store.removeItem(resKey);
        }
    }


    export function newArray<T>(store: LocalStore, key: string, defaultValue?: T[]): LocalStoreEntry.Array<T> {
        return new Array<T>(store, key, defaultValue);
    }


    export function newVar<T>(store: LocalStore, key: string, defaultValue?: T, alwaysRaw?: boolean): LocalStoreEntry.Var<T> {
        return new Var<T>(store, key, defaultValue, alwaysRaw);
    }


    export function newMapWithIndividualKeys<K, T>(store: LocalStore, keyGen: (key: K) => string): LocalStoreEntry.MapIndividualKeys<K, T> {
        return new MapIndividualKeys<K, T>(store, keyGen);
    }


}

export = LocalStoreEntry;