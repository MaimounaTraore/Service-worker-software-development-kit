import { DBSchema, IDBPDatabase, openDB } from 'idb';

export class DbService {
    toRestores: any = {};
    data: any;
    private static STORE_KEY = 'oms-logs';
    _db: any;
    constructor() { }
    async open() {
        console.log('Opening OWorker DB', DbService.STORE_KEY);
        this._db = await openDB<IMDBShema>(DbService.STORE_KEY, 1, {
            upgrade: async (db, oldV, newV, trx) => {
                console.log('OWorker DB', db);
                await this.createObjectStore(db, trx, 'logs', {
                    autoIncrement: true,
                    keyPath: 'id',
                }, {
                    createdAt: 'createdAt',
                    updatedAt: 'updatedAt',
                    msisdn: 'msisdn',
                    type: 'type',
                    status: 'status'
                });
            }
        });
        console.log('Opened OWorker DB', this._db);
    }
    restoreData(trx: any) {
        for (const storeName of Object.keys(this.toRestores)) {
            const store = trx.objectStore(storeName);
            const data = this.toRestores[storeName];
            data.forEach(async (e: any) => {
                await store?.put(e);
            });
        }

    }
    private async createObjectStore(db: IDBPDatabase<IMDBShema>, trx: any, storeName: any, options: IDBObjectStoreParameters, indexes: any) {

        console.log('db.objectStoreNames:', db.objectStoreNames);
        if (trx.objectStoreNames.contains(storeName)) {
            const data: any[] = await trx.objectStore(storeName).getAll();
            console.log('::::::Data,', data);
            // delete store
            db.deleteObjectStore(storeName);
            // recreate store and save data
            const store = db.createObjectStore(storeName, options);
            for (const k of Object.keys(indexes)) {
                store.createIndex(k as never, indexes[k]);
            }
            const addStore = trx.objectStore(storeName);
            data.forEach(async e => {
                await addStore?.put(e);
            });
            console.log('db.store:update', store);
        } else {
            const store = db.createObjectStore(storeName, options);
            console.log('db.store:new', store);
            for (const k of Object.keys(indexes)) {
                store.createIndex(k as never, indexes[k]);
            }
        }
    }
    public async db() {
        if (!this._db) {
            await this.open();
        }
        return this._db;
    }
}


export interface IMDBShema extends DBSchema {
    'logs': {
        key: string;
        value: Logs;
        indexes: {
            'createdAt': Date;
            'updatedAt': Date;
            'msisdn': string;
            'type': string;
            'status': string
        }
    };
}

export interface Logs {
    'createdAt': Date;
    'updatedAt': Date;
    'msisdn': string;
    'type': string;
    'status': string
}