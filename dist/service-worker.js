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
            window.addEventListener('load', () => {
                console.log('addEventListener::load...');
                navigator.serviceWorker.register(data.serviceWorkerName).then((registration) => {
                    var _a, _b;
                    console.log('OWorker registered with scope: ', registration.scope);
                    (_a = registration.installing) === null || _a === void 0 ? void 0 : _a.postMessage({ url: data.serverUrl, interval: 5000 }); //
                    (_b = registration.waiting) === null || _b === void 0 ? void 0 : _b.postMessage('waiting...'); //
                }, (err) => {
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
    static Iosworker() {
        const { open: originalOpen } = window.XMLHttpRequest.prototype;
        const { setRequestHeader: originalSetRequestHeader } = window.XMLHttpRequest.prototype;
        let error = {};
        window.XMLHttpRequest.prototype.open = function () {
            console.log('xhr......', OWorker.data);
            error.url = arguments[1];
            this.addEventListener('load', function (ev) {
                console.log('load...', OWorker.data);
            });
            this.addEventListener('error', function (ev) {
                error.type = 'FETCH_ERROR';
                let err = OWorker.data.find(elt => (new RegExp(elt.url).test(error.url.replace(/\?.*/, ''))) && 'FETCH_ERROR' === elt.type);
                if (err) {
                    err.count++;
                    if (!err.msisdn) {
                        err.msisdn = error.msisdn;
                    }
                    err.os = error.os;
                    err.osVersion = error.osVersion;
                    err.localisation = error.localisation;
                    err.address = error.address;
                    err.appVersion = error.appVersion;
                    err.model = error.model;
                    err.updatedAt = new Date().getTime();
                }
                else {
                    const now = new Date();
                    err = {
                        // id: null,
                        count: 1,
                        url: error.url.replace(/\?.*/, ''),
                        type: 'FETCH_ERROR',
                        periode: now.getTime(),
                        updatedAt: now.getTime(),
                        createdAt: now.getTime(),
                        msisdn: error.msisdn,
                        os: error.os,
                        osVersion: error.osVersion,
                        localisation: error.localisation,
                        address: error.address,
                        appVersion: error.appVersion,
                        model: error.model
                    };
                    OWorker.data.push(err);
                }
                console.log('error...', OWorker.data);
            });
            this.addEventListener('abort', function (ev) {
                console.log('abort...', OWorker.data);
            });
            this.addEventListener('timeout', function (ev) {
                error.type = 'FETCH_ERROR';
                let err = OWorker.data.find(elt => (new RegExp(elt.url).test(error.url.replace(/\?.*/, ''))) && 'FETCH_ERROR' === elt.type);
                if (err) {
                    err.count++;
                    if (!err.msisdn) {
                        err.msisdn = error.msisdn;
                    }
                    err.os = error.os;
                    err.osVersion = error.osVersion;
                    err.localisation = error.localisation;
                    err.address = error.address;
                    err.appVersion = error.appVersion;
                    err.model = error.model;
                    err.updatedAt = new Date().getTime();
                }
                else {
                    const now = new Date();
                    err = {
                        // id: null,
                        count: 1,
                        url: error.url.replace(/\?.*/, ''),
                        type: 'FETCH_ERROR',
                        periode: now.getTime(),
                        updatedAt: now.getTime(),
                        createdAt: now.getTime(),
                        msisdn: error.msisdn,
                        os: error.os,
                        osVersion: error.osVersion,
                        localisation: error.localisation,
                        address: error.address,
                        appVersion: error.appVersion,
                        model: error.model
                    };
                    OWorker.data.push(err);
                }
                console.log('timeout...', OWorker.data);
            });
            // this.addEventListener('readystatechange', function(ev) {
            //   console.log('readystatechange...', this.response, this.responseURL);
            // })
            // this.addEventListener('timeout', function(ev) {
            //   console.log('timeout...', this.response, this.responseURL);
            // })
            originalOpen.apply(this, arguments);
        };
        window.XMLHttpRequest.prototype.setRequestHeader = function () {
            console.log('header...', arguments, arguments[0], arguments[1], OWorker.data);
            if (arguments[0] === '__msisdn__') {
                error.msisdn = arguments[1];
            }
            if (arguments[0] === '__app_version__') {
                error.appVersion = arguments[1];
            }
            if (arguments[0] === '__oms_terminal_model__') {
                error.model = arguments[1];
            }
            if (arguments[0] === '__oms_terminal_os__') {
                error.os = arguments[1];
            }
            if (arguments[0] === '__oms_terminal_version__') {
                error.osVersion = arguments[1];
            }
            if (arguments[0] === '__oms_user_localisation__') {
                error.localisation = arguments[1];
            }
            if (arguments[0] === '__oms_user_localisation_address__') {
                error.address = arguments[1];
            }
            console.log('error.........', error, OWorker.data);
            originalSetRequestHeader.apply(this, arguments);
        };
    }
}
exports.OWorker = OWorker;
OWorker.data = [];
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
