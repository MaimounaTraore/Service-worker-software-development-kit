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
class OServiceWorker {
    constructor() {
        this.toRestores = {};
    }
    static run() {
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
    static sendToServer() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(OServiceWorker.data);
            if (OServiceWorker.data.length > 0) {
                try {
                    let response = yield fetch(OServiceWorker.SERVER_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                        },
                        mode: 'cors',
                        body: JSON.stringify(OServiceWorker.data)
                    });
                    console.log(response);
                    if (response.status === 0 || response.status === 200 || response.status === 201) { //I added await because it wouldn't work
                        OServiceWorker.data = [];
                    }
                    else {
                        console.log("Sorry, server not available!", response);
                    }
                }
                catch (error) {
                    console.log('sendToServer...', error);
                }
            }
        });
    }
    static addError(req, data, type) {
        let err = this.data.find(elt => (new RegExp(elt.url).test(req.url.replace(/\?.*/, ''))) && type === elt.type);
        if (err) {
            err.count++;
            err.timestamps.push(new Date());
        }
        else {
            err = {
                // id: null,
                count: 1,
                timestamps: [new Date()],
                url: req.url.replace(/\?.*/, ''),
                type: type,
            };
            this.data.push(err);
        }
        console.log('before onreq...', this._db, this._db.transaction("logs", "readwrite"));
        const onreq = this._db.transaction("logs", "readwrite").objectStore("logs").put(err);
        onreq.onsuccess = (ev) => {
            err.id = onreq.result;
            console.log("Error added succes......", ev, "", typeof data, "", onreq.result);
            console.log("Oserviceworker data......", this.data);
        };
        onreq.onerror = (ev) => {
            console.log("Error could not be added......", ev);
        };
    }
    static createObjectStore(storeName, options, indexes) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = OServiceWorker._db;
            // const trx = OServiceWorker._db.transaction(storeName);
            console.log('db.objectStoreNames:', db.objectStoreNames);
            if (db.objectStoreNames.contains(storeName)) {
                // delete store
                db.deleteObjectStore(storeName);
                // recreate store and save data
                const store = db.createObjectStore(storeName, options);
                for (const k of Object.keys(indexes)) {
                    store.createIndex(k, indexes[k]);
                }
                // const addStore = trx.objectStore(storeName);
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
    static open() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Opening OWorker DB in worker', OServiceWorker.STORE_KEY);
            const req = indexedDB.open(OServiceWorker.STORE_KEY, 2);
            req.onsuccess = (ev) => __awaiter(this, void 0, void 0, function* () {
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
            });
            req.onerror = (ev) => {
                console.log("......", ev);
            };
            req.onupgradeneeded = function () {
                return __awaiter(this, void 0, void 0, function* () {
                    OServiceWorker._db = req.result;
                    yield OServiceWorker.createObjectStore('logs', {
                        autoIncrement: true,
                        keyPath: 'id',
                    }, {
                        createdAt: 'createdAt',
                        updatedAt: 'updatedAt',
                        msisdn: 'msisdn',
                        type: 'type',
                        status: 'status'
                    });
                });
            };
            console.log('Opened OWorker DB', this._db);
        });
    }
}
OServiceWorker.data = [];
OServiceWorker.STORE_KEY = 'o-worker-logs';
OServiceWorker.SERVER_URL = 'http://192.168.1.6:3000/test';
OServiceWorker.onInstalled = (event) => {
    console.log('OWorker onInstalling...');
    self.skipWaiting();
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
};
OServiceWorker.onActivate = (event) => {
    console.log('OWorker ready to handle fetches!');
    self.clients.claim();
};
OServiceWorker.onFetched = (event) => {
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
    if (event.request.mode === 'navigate' || event.request.mode === 'no-cors' || event.request.url.startsWith('http://localhost:8')) {
        return;
    }
    event.respondWith(OServiceWorker.fetchWithParamAddedToRequestBody(event.request));
};
OServiceWorker.onMessage = (event) => {
    console.log('onMessage123', event);
    OServiceWorker.SERVER_URL = event.data.url;
};
OServiceWorker.fetchWithParamAddedToRequestBody = function (request) {
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
    return OServiceWorker.serialize(request).then(function (serialized) {
        return OServiceWorker.deserialize(serialized).then(function (request) {
            console.log(request.url);
            console.log(request.body);
            return fetch(request).then((val) => __awaiter(this, void 0, void 0, function* () {
                if (val.status === 200) {
                    console.log('Success', val);
                    OServiceWorker.sendToServer();
                }
                else {
                    console.log('Fail', val);
                    OServiceWorker.addError(request, val, "SERVER_ERROR");
                }
                return val;
            }))
                .catch(val => {
                console.log(val, request);
                console.log('Fail', val);
                OServiceWorker.addError(request, val, "FETCH_ERROR");
                return Response.error();
            });
        }).catch((val) => {
            console.log(val, request);
        });
    }).catch((val) => {
        console.log(val, request);
    });
};
OServiceWorker.serialize = function serializeF(request) {
    let headers = {};
    for (var entry of request.headers.entries()) {
        headers[entry[0]] = entry[1];
    }
    var serialized = {
        url: request.url,
        headers: headers,
        method: request.method,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return request.clone().text().then(function (body) {
            serialized.body = body;
            console.log(body);
            return Promise.resolve(serialized);
        });
    }
    return Promise.resolve(serialized);
};
OServiceWorker.deserialize = function deserializeF(data) {
    return Promise.resolve(new Request(data.url, data));
};
OServiceWorker.run();
//SENDING TO THE SERVER 
//   async function sendToServer(){
//     console.log(errList);
//     if(errList.length > 0){
//       try {
//         let response = await fetch('http://192.168.1.6:3000/test', { 
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json;charset=utf-8'
//             },
//             mode: 'cors',
//             body: JSON.stringify(errList)
//           });
//           console.log(response);
//         if(response.status === 200){
//           errList=[];
//         } else{
//           console.log("Sorry, server not available!", response);
//         }
//       } catch (error) {
//         console.log(error);
//       }
//   }
// }
