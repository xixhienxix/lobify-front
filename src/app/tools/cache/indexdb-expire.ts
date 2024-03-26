import localforage from 'localforage';

export interface LocalForageCacheOptions extends LocalForageOptions {
    defaultExpiration?: number;
}

/**
 * Wrapper around localforage that adds the ability to set expiration dates for saved values.
 *
 * It works by creating an additional entry that tells you when the key is due to expire.
 */
export class LocalForageCache {
    storage: LocalForage;
    defineDriver: any = null;
    driver: any = null;
    getDriver: any = null;
    getSerializer: any = null;
    ready: any = null;
    setDriver: any = null;
    supports: any = null;
    clear: any = null;

    defaultExpiration = 60 * 60 * 24 * 7; // One week

    constructor(options: LocalForageCacheOptions = {}) {
        this.storage = localforage.createInstance(options);

        this.defineDriver = this.storage.defineDriver;
        this.driver = this.storage.driver;
        this.getDriver = this.storage.getDriver;
        this.getSerializer = this.storage.getSerializer;
        this.ready = this.storage.ready;
        this.setDriver = this.storage.setDriver;
        this.supports = this.storage.supports;
        this.clear = this.storage.clear;
    }

    /**
     * Save an entry in the offline storage.
     *
     * @param {String} key The key of the value you wish to save to the cache.
     * @param {any} value The value you wish to save.
     * @param {Date|Number} expires The expiry date. Either a timestamp or date object. By default this value is the default expiration set in the config + the current time.
     * @return {Promise<void>} A promise that resolves when the value has been saved.
     */
    async setItem<T>(key: string, value: T, expire_seconds: number = this.defaultExpiration) {
        const expirationKey = this._expirationKey(key);

        const expires = expire_seconds * 1000;

        await this.storage.setItem(key, value);
        return this.storage.setItem(expirationKey, expires + Date.now());
    }

    /**
     * Retreive an entry from the offline storage.
     *
     * @param {String} key The key of the value you wish to retreive from the cache.
     * @return {Promise<any>} A promise that resolves with the value of the key. Returns null if the key does not exist.
     */
    async getItem<T>(key: any) {
        const expirationKey = this._expirationKey(key);
        const expires = await this.storage.getItem(expirationKey);

        // If we don't find an experation date, just return the value
        if (expires === null) {
            return this.storage.getItem<T>(key);
        }

        const hasExpired = this._hasExpired(expires);

        // If the item has expired, remove it from the cache
        if (hasExpired) {
            await this.removeItem(key);
            return null;
        }

        return this.storage.getItem<T>(key);
    }

    /**
     * Removes an entry from the offline storage while also removing its expiry entry.
     *
     * @param {String} key The key of the value you wish to remove from the cache.
     */
    async removeItem(key: any) {
        const expirationKey = this._expirationKey(key);
        const removeValue = this.storage.removeItem(key);
        const removeExpiration = this.storage.removeItem(expirationKey);

        return Promise.all([removeValue, removeExpiration]);
    }

    /**
     * Creates a new instance of the cache module.
     *
     * @param {Object} options
     */
    createInstance(options: LocalForageCacheOptions = {}) {
        return new LocalForageCache(options);
    }

    _expirationKey(key: any) {
        return `${key}_expires_cacheexpiration`;
    }

    _hasExpired(expires: any) {
        if (expires === Infinity) {
            return false;
        }

        if (isNaN(expires)) {
            return false;
        }

        return expires < Date.now();
    }
}
