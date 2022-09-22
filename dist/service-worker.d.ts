export declare class OWorker {
    static unregister(): Promise<boolean>;
    static load(service: any): void;
    static register(serviceWorkerName: string, serverUrl: string): Promise<boolean>;
    static init(serviceWorkerName: string, serverUrl: string): Promise<boolean>;
    static run(): void;
    static onInstalled: (event: any) => void;
    static onFetched: (event: any) => void;
    private static fetchWithParamAddedToRequestBody;
    private static serialize;
    private static deserialize;
    static Iosworker(): void;
}
