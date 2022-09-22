interface OError {
    'count': number;
    'msisdn': string;
    'type': string;
    'url': string;
    'id': number;
    'periode': number;
    'extra': string;
    'createdAt': number;
    'updatedAt': number;
}
declare type OErrorType = 'SERVER_ERROR' | 'FETCH_ERROR';
declare class OServiceWorker {
    toRestores: any;
    static data: OError[];
    private static STORE_KEY;
    private static SERVER_URL;
    static _db: IDBDatabase;
    static run(): void;
    private static sendToServer;
    private static addError;
    private static formatDate;
    private static createObjectStore;
    private static open;
    static onInstalled: (event: any) => void;
    static onActivate: (event: any) => void;
    static onFetched: (event: any) => void;
    static onMessage: (event: any) => void;
    private static fetchWithParamAddedToRequestBody;
    private static serialize;
    private static deserialize;
}
