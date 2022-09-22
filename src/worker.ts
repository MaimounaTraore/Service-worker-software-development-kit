importScripts('https://oms-dev.orangemali.com/worker.js');
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

type OErrorType = 'SERVER_ERROR'| 'FETCH_ERROR';

class OServiceWorker {
  toRestores: any = {};
  static data: OError[] = [];
  private static STORE_KEY = 'o-worker-logs';
  // private static SERVER_URL = 'http://10.172.1.162:32323/api/v1/elk/logs';
  private static SERVER_URL = 'https://oms-dev.orangemali.com/api/v2/external/remote-logs/save';
  private static headersToTrack: Map<string, string> = new Map<string, string>();
  static _db: IDBDatabase;

    public static run(): void {
      console.log('test....', navigator);
      OServiceWorker.open();
      addEventListener('install', OServiceWorker.onInstalled);
      addEventListener('activate', OServiceWorker.onActivate);
      addEventListener('fetch', OServiceWorker.onFetched);
      addEventListener('message', OServiceWorker.onMessage);
    }

    // restoreData(trx: any) {
    //   for (const storeName of Object.keys(this.toRestores)) {
    //     const store = trx.objectStore(storeName);
    //     const data = this.toRestores[storeName];
    //     data.forEach(async (e: any) => {
    //         await store?.put(e);
    //     });
    //   }
    // }

    private static async sendToServer(){//I added asynch because i added await below
      console.log(OServiceWorker.data);
      if(OServiceWorker.data.length > 0){
        try {
          let response = await fetch(OServiceWorker.SERVER_URL, { 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json;charset=utf-8',
              },
              mode: 'cors',
              body: JSON.stringify(OServiceWorker.data)
            });
            console.log(response);
          if( response.status === 0 || response.status === 200 || response.status === 201){//I added await because it wouldn't work
            OServiceWorker.data=[];
          } else{
            console.log("Sorry, server not available!", response);
          }
        } catch (error) {
          console.log('sendToServer...', error);
        }
      }
    }

    private static addError(req: any, data: any, type: OErrorType){
      let headers: any = {};
      let msisdn = ''
      let appVersion = ''
      let model = ''
      let os = ''
      let osVersion = ''
      let localisation = ''
      let address = ''
      for (var entry of req.headers.entries()) {
        headers[entry[0]] = entry[1];
        if(entry[0] === '__msisdn__') {
          msisdn = entry[1];
        }
        if(entry[0] === '__app_version__') {
          appVersion = entry[1];
        }
        if(entry[0] === '__oms_terminal_model__') {
          model = entry[1];
        }
        if(entry[0] === '__oms_terminal_os__') {
          os = entry[1];
        }
        if(entry[0] === '__oms_terminal_version__') {
          osVersion = entry[1];
        }
        if(entry[0] === '__oms_user_localisation__') {
          localisation = entry[1];
        }
        if(entry[0] === '__oms_user_localisation_address__') {
          address = entry[1];
        }
      }
      let err: any = this.data.find(elt => (new RegExp(elt.url).test(req.url.replace(/\?.*/, ''))) && type === elt.type)
      if(err){
        err.count++;
        if(!err.msisdn) {
          err.msisdn = msisdn;
        }
        err.os = os;
        err.osVersion = osVersion;
        err.localisation = localisation;
        err.address = address;
        err.appVersion = appVersion;
        err.model = model;
        err.updatedAt = new Date().getTime();
        err.extraData = JSON.stringify(Object.assign(JSON.parse(err.extraData || '{}'), headers))
      }else{
        const now = new Date()
        err={
          // id: null,
          count: 1,
          url: req.url.replace(/\?.*/, ''),
          type: type,
          periode: now.getTime(),
          updatedAt: now.getTime(),
          createdAt: now.getTime(),
          extraData: JSON.stringify(headers),
          msisdn: msisdn,
          os: os,
          osVersion: osVersion,
          localisation: localisation,
          address: address,
          appVersion: appVersion,
          model: model
        } 
        this.data.push(err);
      }
      console.log('before onreq...', this._db, this._db.transaction("logs", "readwrite"));
      const onreq = this._db.transaction("logs", "readwrite").objectStore("logs").put(err);
      onreq.onsuccess = (ev: any) => {
        err.id = onreq.result;
        console.log("Error added succes......", ev, "", typeof data, "", onreq.result)
        console.log("Oserviceworker data......", this.data);

      }

      onreq.onerror = (ev: any) => {
        console.log("Error could not be added......", ev);
      }
    }

    private static formatDate(date: Date, full = false) {
      if(full){
        return date.toLocaleString('en-CA', {year:'numeric', month:'numeric', day:
      'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'});
      }
      return date.toLocaleString('en-CA', {year:'numeric', month:'numeric', day:
      'numeric'});
    }

    private static async createObjectStore(storeName: any, options: IDBObjectStoreParameters, indexes: any) {
      const db = OServiceWorker._db;
      // const trx = OServiceWorker._db.transaction(storeName);
      console.log('db.objectStoreNames:', db.objectStoreNames);
      if (db.objectStoreNames.contains(storeName)) {
          // delete store
          db.deleteObjectStore(storeName);
          // recreate store and save data
          const store = db.createObjectStore(storeName, options);
          for (const k of Object.keys(indexes)) {
              store.createIndex(k as never, indexes[k]);
          }
          // const addStore = trx.objectStore(storeName);
          console.log('db.store:update', store);
      } else {
          const store = db.createObjectStore(storeName, options);
          console.log('db.store:new', store);
          for (const k of Object.keys(indexes)) {
              store.createIndex(k as never, indexes[k]);
          }
      }
    }

    private static async open() {
      console.log('Opening OWorker DB in worker', OServiceWorker.STORE_KEY);
      const req= indexedDB.open(OServiceWorker.STORE_KEY, 2);
      req.onsuccess = async (ev: any) =>{
        console.log("......", ev);
        OServiceWorker._db = ev.target.result;
      //   await OServiceWorker.createObjectStore('logs', {
      //     autoIncrement: true,
      //     keyPath: 'id',
      // }, {
      //     createdAt: 'createdAt',
      //     updatedAt: 'updatedAt',
      //     msisdn: 'msisdn',
      //     type: 'type',
      //     status: 'status'
      // })
      }
      req.onerror = (ev) =>{
        console.log("......", ev);
      }
      req.onupgradeneeded = async function(){
        OServiceWorker._db = req.result;
        await OServiceWorker.createObjectStore('logs', {
          autoIncrement: true,
          keyPath: 'id',
      }, {
          createdAt: 'createdAt',
          updatedAt: 'updatedAt',
          msisdn: 'msisdn',
          type: 'type',
          status: 'status'
      })
    }
    console.log('Opened OWorker DB', this._db);
  }

    public static onInstalled = (event: any): void => {
      console.log('OWorker onInstalling...');
        (self as any).skipWaiting();
        // event.waitUntil(
        //     caches.open('v0.1').then((cache) => {
        //         return cache.addAll([
        //             '/scripts/app-bundle.js',
        //             '/scripts/vendor-bundle.js',
        //             '/assets/images/logo.png',
        //             '/assets/images/no-vessel-picture.jpg',
        //             '/assets/styles/loader.css',
        //             '/assets/scripts/fontawesome-pro/css/fa-svg-with-js.css',
        //             '/assets/scripts/fontawesome-pro/js/fontawesome.min.js',
        //             '/assets/scripts/fontawesome-pro/js/fa-light.min.js',
        //             '/assets/scripts/fontawesome-pro/js/fa-regular.min.js',
        //             '/assets/scripts/fontawesome-pro/js/fa-solid.min.js'
        //         ]);
        //     })
        // );
    }
    public static onActivate = (event: any): void => {
      console.log('OWorker ready to handle fetches!');
      (self as any).clients.claim();
    }

    public static onFetched = (event: any): void => {
        // event.respondWith(
        //     caches.match(event.request).then((matchResponse) => {
        //         return matchResponse || fetch(event.request).then((fetchResponse) => {
        //             return caches.open('v0.1').then((cache) => {
        //                 cache.put(event.request, fetchResponse.clone());
        //                 return fetchResponse;
        //             });
        //         });
        //     })
        // );
        if(event.request.mode === 'navigate'  || event.request.mode === 'no-cors' || event.request.url.startsWith('http://localhost:8')){ 
          return;
        }
        event.respondWith(
            OServiceWorker.fetchWithParamAddedToRequestBody(event.request)
          );
    }
    public static onMessage = (event: any): void => {
        console.log('onMessage123', event);
        OServiceWorker.SERVER_URL = event.data.url;
        OServiceWorker.headersToTrack = event.data.headersToTrack;
    }
    private static fetchWithParamAddedToRequestBody = function(request: any): Promise<any> {
        // return fetch(request).then(async val => {
        //     if(val.status === 200) {
        //       console.log("Success", val);
        //     } else{
        //       console.log('Fail', val);
        //     }
        //     return val;
        //   })
        //   .catch(val => {
        //     console.log(val, request);
        //     console.log('Fail', val);
        //     return Response.error();
        //   });
        return OServiceWorker.serialize(request).then(function(serialized: any) {
            return OServiceWorker.deserialize(serialized).then(function(request) {
              console.log(request.url);
              console.log(request.body);
              return fetch(request).then(async val => {
                if(val.status === 200) {
                  console.log('Success', val);
                  OServiceWorker.sendToServer()
                } else{
                  console.log('Fail', val);
                  OServiceWorker.addError(request, val, "SERVER_ERROR")
                }
                return val;
              })
              .catch(val => {
                console.log(val, request);
                console.log('Fail', val);
                OServiceWorker.addError(request, val, "FETCH_ERROR")
                return Response.error();
              });
            }).catch((val: any) => {
              console.log(val, request);
            });
          }).catch((val: any) => {
            console.log(val, request);
          });
    }
    private static serialize = function serializeF(request: any): Promise<any> {
        let headers: any = {};
        // let r = request.headers.entries();
        // console.log('header to track...', OServiceWorker.headersToTrack);
        for (var entry of request.headers.entries()) {
          headers[entry[0]] = entry[1];
          // console.log('header to track...', entry);
        }
        var serialized: any = {
          url: request.url,
          headers: headers,
          method: request.method,
          mode: request.mode,
          credentials: request.credentials,
          cache: request.cache,
          redirect: request.redirect,
          referrer: request.referrer,
        };
        // console.log('OWorker headers:::', headers, request.headers.entries());
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          return request.clone().text().then(function(body: any) {
            serialized.body = body;
            return Promise.resolve(serialized);
          });
        }
        return Promise.resolve(serialized);
      }
    
      private static deserialize = function deserializeF(data: any) {
        return Promise.resolve(new Request(data.url, data));
      }
    

}
OServiceWorker.run();

