export declare class OWorker {
    static unregister(): Promise<boolean>;
    static load(service: any): void;
    static register(data: {
        serviceWorkerName: string;
        serverUrl: string;
        headersToTrack?: any;
    }): Promise<boolean>;
    static init(data: {
        serviceWorkerName: string;
        serverUrl: string;
    }): Promise<boolean>;
    static run(): void;
    static onInstalled: (event: any) => void;
    static onFetched: (event: any) => void;
    private static fetchWithParamAddedToRequestBody;
    private static serialize;
    private static deserialize;
}
