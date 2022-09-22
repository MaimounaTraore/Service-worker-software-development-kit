interface OError {
    'count': number;
    'msisdn': string;
    'type': string;
    'url': string;
    'id': number;
    'periode': number;
    'extraData': string;
    'createdAt': number;
    'updatedAt': number;
    'appVersion': string;
    'os': string;
    'model': string;
    'osVersion': string;
    'localisation': string;
    'address': string;
}
declare type OErrorType = 'SERVER_ERROR' | 'FETCH_ERROR';
declare class OServiceWorker {
    toRestores: any;
    static data: OError[];
    private static STORE_KEY;
    private static SERVER_URL;
    private static headersToTrack;
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
