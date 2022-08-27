"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbService = void 0;
const idb_1 = require("idb");
class DbService {
    constructor() {
        this.toRestores = {};
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Opening OWorker DB', DbService.STORE_KEY);
            this._db = yield (0, idb_1.openDB)(DbService.STORE_KEY, 1, {
                upgrade: (db, oldV, newV, trx) => __awaiter(this, void 0, void 0, function* () {
                    console.log('OWorker DB', db);
                    yield this.createObjectStore(db, trx, 'logs', {
                        autoIncrement: true,
                        keyPath: 'id',
                    }, {
                        createdAt: 'createdAt',
                        updatedAt: 'updatedAt',
                        msisdn: 'msisdn',
                        type: 'type',
                        status: 'status'
                    });
                })
            });
            console.log('Opened OWorker DB', this._db);
        });
    }
    restoreData(trx) {
        for (const storeName of Object.keys(this.toRestores)) {
            const store = trx.objectStore(storeName);
            const data = this.toRestores[storeName];
            data.forEach((e) => __awaiter(this, void 0, void 0, function* () {
                yield (store === null || store === void 0 ? void 0 : store.put(e));
            }));
        }
    }
    createObjectStore(db, trx, storeName, options, indexes) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('db.objectStoreNames:', db.objectStoreNames);
            if (trx.objectStoreNames.contains(storeName)) {
                const data = yield trx.objectStore(storeName).getAll();
                console.log('::::::Data,', data);
                // delete store
                db.deleteObjectStore(storeName);
                // recreate store and save data
                const store = db.createObjectStore(storeName, options);
                for (const k of Object.keys(indexes)) {
                    store.createIndex(k, indexes[k]);
                }
                const addStore = trx.objectStore(storeName);
                data.forEach((e) => __awaiter(this, void 0, void 0, function* () {
                    yield (addStore === null || addStore === void 0 ? void 0 : addStore.put(e));
                }));
                console.log('db.store:update', store);
            }
            else {
                const store = db.createObjectStore(storeName, options);
                console.log('db.store:new', store);
                for (const k of Object.keys(indexes)) {
                    store.createIndex(k, indexes[k]);
                }
            }
        });
    }
    db() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._db) {
                yield this.open();
            }
            return this._db;
        });
    }
}
exports.DbService = DbService;
DbService.STORE_KEY = 'oms-logs';
