/**
 * @author TeamworkGuy2
 * @since 2016-3-26
 */
class LocalStoreByCategory {
    private rootStore: LocalStore;
    private singleCategorizers: LocalStoreItemCategorizer<any>[];
    private multiCategorizers: LocalStoreItemMultiCategorizer<any>[];
    private categorizedStores: { [category: string]: (LocalStore & { category: string; }) };
    private storeFactory: () => LocalStore;
    private timestampKeyGenerator: () => (string | number);


    constructor(rootStore: LocalStore, storeFactory: () => LocalStore, timestampKeyGenerator: () => (string | number), singleCategorizers: LocalStoreItemCategorizer<any>[], multiCategorizers: LocalStoreItemMultiCategorizer<any>[]) {
        this.rootStore = rootStore;
        this.storeFactory = storeFactory;
        this.timestampKeyGenerator = timestampKeyGenerator;
        this.categorizedStores = {};
        this.singleCategorizers = singleCategorizers;
        this.multiCategorizers = multiCategorizers;
    }


    public getItem(key: string, plainString?: boolean): any {
        return this.rootStore.getItem(key, plainString);
    }


    public hasItem(key: string): boolean {
        return this.rootStore.hasItem(key);
    }


    public getKeys(): string[] {
        return this.rootStore.getKeys();
    }


    public addItem(value: any, plainString?: boolean): string {
        var key = this.timestampKeyGenerator() + '';
        this.setItem(key, value, plainString);
        return key;
    }


    public setItem(key: string, value: any, plainString?: boolean): void {
        var category = this.findCategory(key, value);
        if (category == null) {
            throw new Error("item key '" + key.substr(0, 100) + "' does not match any of this store's categories");
        }

        this.rootStore.setItem(key, value, plainString);

        var categoryStore = this.getCategoryStore(category);
        categoryStore.setItem(key, value, plainString);
    }


    public removeItem(key: string, plainString?: boolean): void {
        var value = this.rootStore.getItem(key, plainString);

        this.rootStore.removeItem(key);

        var category = this.findCategory(key, value);

        var categoryStore = this.getCategoryStore(category);
        categoryStore.removeItem(key);
    }


    public getCategoryStore(category: string) {
        var categoryStore = this.categorizedStores[category];
        if (categoryStore === undefined) {
            categoryStore = <any>this.storeFactory();
            categoryStore.category = category;
            this.categorizedStores[category] = categoryStore;
        }
        return categoryStore;
    }


    public getCategoryStoresWithData(): { [category: string]: (LocalStore & { category: string; }) } {
        var storesWithData: { [category: string]: (LocalStore & { category: string; }) } = {};
        var categoryKeys = Object.keys(this.categorizedStores);
        for (var i = 0, size = categoryKeys.length; i < size; i++) {
            var categoryStore = this.categorizedStores[categoryKeys[i]];
            if (categoryStore.length > 0) {
                storesWithData[categoryKeys[i]] = categoryStore;
            }
        }
        return storesWithData;
    }


    public getKeyValueCategory(key: string, value: any): string {
        var category = this.findCategory(key, value);
        return category;
    }


    private findCategory(key: string, value: any): string {
        var sCategories = this.singleCategorizers;
        for (var i = 0, size = sCategories.length; i < size; i++) {
            if (sCategories[i].isMatch(key, value)) {
                return sCategories[i].category;
            }
        }
        var mCategories = this.multiCategorizers;
        for (var i = 0, size = mCategories.length; i < size; i++) {
            var category: string;
            if ((category = mCategories[i].findMatch(key, value)) != null) {
                return category;
            }
        }
        return null;
    }


    public static newInst(storeInst: LocalStore, storeFactory: () => LocalStore, timestampKeyGenerator: () => (string | number),
            singleCategorizers: LocalStoreItemCategorizer<any>[], multiCategorizers: LocalStoreItemMultiCategorizer<any>[]) {
        return new LocalStoreByCategory(storeInst, storeFactory, timestampKeyGenerator, singleCategorizers, multiCategorizers);
    }

}

export = LocalStoreByCategory;