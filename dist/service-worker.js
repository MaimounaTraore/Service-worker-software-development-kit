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
exports.OWorker = void 0;
class OWorker {
    static unregister() {
        console.log('service unregistration.,,,');
        if ('serviceWorker' in navigator) {
            return navigator.serviceWorker.getRegistrations().then(registration => {
                registration.forEach(e => {
                    console.log('worker...', e);
                    e.unregister();
                });
                console.log('service unregistration done...');
                return Promise.resolve(true);
            }).catch(error => {
                console.error('error in service unregistration:::', error.message);
                return Promise.resolve(false);
            });
        }
        else {
            console.log('unregister:serviceWorker not in navigator...');
        }
        return Promise.resolve(false);
    }
    static load(service) {
        fetch(service).then(e => console.log('onFetch...', e), err => console.log('onerror...', err)).catch(e => console.log('global exception...'));
    }
    // static register (serviceWorkerName: string, serverUrl: string): Promise<boolean> {
    //   console.log('service registration...')
    //     if ('serviceWorker' in navigator) {
    //       console.log('serviceWorker is in navigator...')  
    //       window.addEventListener('load', function() {
    //         console.log('addEventListener::load...')  
    //         navigator.serviceWorker.register(serviceWorkerName).then(function(registration) {
    //           console.log('OWorker registered with scope: ', registration.scope);
    //           registration.installing?.postMessage({url: serverUrl, interval: 5000});//
    //           registration.waiting?.postMessage('waiting...');//
    //           }, function(err) {
    //           console.log('OWorker registration failed: ', err);
    //           }).catch(e => console.log('navigator.serviceWorker....', e));
    //         });
    //         navigator.serviceWorker.onmessage = (ev) => {
    //           console.log("ev is here......", ev);
    //         }
    //         navigator.serviceWorker.controller?.postMessage({url: serverUrl, interval: 5000});
    //         return Promise.resolve(true)
    //     } else {
    //       console.log('register:serviceWorker not in navigator...')
    //     }
    //     return Promise.resolve(false)
    // }
    static register(data) {
        var _a;
        console.log('service registration...');
        if ('serviceWorker' in navigator) {
            console.log('serviceWorker is in navigator...');
            window.addEventListener('load', function () {
                console.log('addEventListener::load...');
                navigator.serviceWorker.register(data.serviceWorkerName).then(function (registration) {
                    var _a, _b;
                    console.log('OWorker registered with scope: ', registration.scope);
                    (_a = registration.installing) === null || _a === void 0 ? void 0 : _a.postMessage({ url: data.serverUrl, interval: 5000 }); //
                    (_b = registration.waiting) === null || _b === void 0 ? void 0 : _b.postMessage('waiting...'); //
                }, function (err) {
                    console.log('OWorker registration failed: ', err);
                }).catch(e => console.log('navigator.serviceWorker....', e));
            });
            navigator.serviceWorker.onmessage = (ev) => {
                console.log("ev is here......", ev);
            };
            (_a = navigator.serviceWorker.controller) === null || _a === void 0 ? void 0 : _a.postMessage({ url: data.serverUrl, interval: 5000 });
            return Promise.resolve(true);
        }
        else {
            console.log('register:serviceWorker not in navigator...');
        }
        return Promise.resolve(false);
    }
    static init(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('OWorker init...', data);
            yield this.unregister();
            return this.register(data);
        });
    }
    ;
    static run() {
        // OServiceWorker.open();
        addEventListener('install', OWorker.onInstalled);
        addEventListener('fetch', OWorker.onFetched);
    }
}
exports.OWorker = OWorker;
OWorker.onInstalled = (event) => {
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
OWorker.onFetched = (event) => {
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
    event.respondWith(OWorker.fetchWithParamAddedToRequestBody(event.request));
};
OWorker.fetchWithParamAddedToRequestBody = function (request) {
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
    return OWorker.serialize(request).then(function (serialized) {
        return OWorker.deserialize(serialized).then(function (request) {
            console.log(request.url);
            console.log(request.body);
            return fetch(request).then((val) => __awaiter(this, void 0, void 0, function* () {
                if (val.status === 200) {
                    console.log('Success', val);
                }
                else {
                    console.log('Fail', val);
                    //   OServiceWorker.addError(request, val, "SERVER_ERROR")
                }
                return val;
            }))
                .catch(val => {
                console.log(val, request);
                console.log('Fail....', val);
                // OServiceWorker.addError(request, val, "FETCH_ERROR")
                return Response.error();
            });
        }).catch((val) => {
            console.log(val, request);
        });
    }).catch((val) => {
        console.log(val, request);
    });
};
OWorker.serialize = function serializeF(request) {
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
OWorker.deserialize = function deserializeF(data) {
    return Promise.resolve(new Request(data.url, data));
};
