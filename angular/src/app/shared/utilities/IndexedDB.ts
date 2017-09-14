export class IndexedDB {
    db: Promise<any>;

    private getDB() {
        if (this.db == null) {
            this.db = new Promise(function (resolve, reject) {
                var openreq = indexedDB.open('keyval-store', 1);

                openreq.onerror = function () {
                    reject(openreq.error);
                };
                openreq.onupgradeneeded = function () {
                    // First time setup: create an empty object store
                    openreq.result.createObjectStore('keyval');
                };
                openreq.onsuccess = function () {
                    resolve(openreq.result);
                };
            });
        }
        return this.db;
    }

    private withStore(type, callback) {
        return this.getDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var transaction = db.transaction('keyval', type);
                transaction.oncomplete = function () {
                    resolve();
                };
                transaction.onerror = function () {
                    reject(transaction.error);
                };
                callback(transaction.objectStore('keyval'));
            });
        });
    }

    public get(key) {
        var req;
        return this.withStore('readonly', function (store) {
            req = store.get(key);
        }).then(function () {
            return req.result;
        });
    }

    public set(key, value) {
        return this.withStore('readwrite', function (store) {
            store.put(value, key);
        });
    }

    public delete(key) {
        return this.withStore('readwrite', function (store) {
            store.delete(key);
        });
    }

    public clear() {
        return this.withStore('readwrite', function (store) {
            store.clear();
        });
    }

    public keys() {
        var keys = [];
        return this.withStore('readonly', function (store) {
            // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
            // And openKeyCursor isn't supported by Safari.
            (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
                if (!this.result) return;
                keys.push(this.result.key);
                this.result.continue();
            };
        }).then(function () {
            return keys;
        });
    }
}