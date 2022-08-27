import { DBSchema } from 'idb';
export declare class DbService {
    toRestores: any;
    data: any;
    private static STORE_KEY;
    _db: any;
    constructor();
    open(): Promise<void>;
    restoreData(trx: any): void;
    private createObjectStore;
    db(): Promise<any>;
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
            'status': string;
        };
    };
}
export interface Logs {
    'createdAt': Date;
    'updatedAt': Date;
    'msisdn': string;
    'type': string;
    'status': string;
}
