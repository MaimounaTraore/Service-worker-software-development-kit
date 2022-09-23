export class OWorker {
  private static SERVER_URL = 'https://oms-dev.orangemali.com/api/v2/external/remote-logs/save';  
  private static data: OError[] = [];
  static unregister(): Promise<boolean> {
    console.log('service unregistration.,,,')
    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.getRegistrations().then(registration => {
          registration.forEach(e => {
            console.log('worker...', e);
            e.unregister()
          });
          console.log('service unregistration done...')
          return Promise.resolve(true);
      }).catch(error => {
          console.error('error in service unregistration:::', error.message);
          return Promise.resolve(false)
      });
    } else {
        console.log('unregister:serviceWorker not in navigator...')
    }
    return Promise.resolve(false)
  }

    static load(service: any) {
      fetch(service).then(e => console.log('onFetch...', e), err => console.log('onerror...', err)).catch(e => console.log('global exception...'))
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
    static register (data: {
      serviceWorkerName: string,
      serverUrl: string,
      headersToTrack?: any,
    }): Promise<boolean> {
      console.log('service registration...')
        if ('serviceWorker' in navigator) {
          console.log('serviceWorker is in navigator...')  
          window.addEventListener('load', () => {
            console.log('addEventListener::load...')  
            navigator.serviceWorker.register(data.serviceWorkerName).then((registration) => {
              console.log('OWorker registered with scope: ', registration.scope);
              registration.installing?.postMessage({url: data.serverUrl, interval: 5000});//
              registration.waiting?.postMessage('waiting...');//
              }, (err) => {
              console.log('OWorker registration failed: ', err);
              }).catch(e => console.log('navigator.serviceWorker....', e));
            });
            navigator.serviceWorker.onmessage = (ev) => {
              console.log("ev is here......", ev);
            }
            navigator.serviceWorker.controller?.postMessage({url: data.serverUrl, interval: 5000});
            
            return Promise.resolve(true)
        } else {
          console.log('register:serviceWorker not in navigator...')
        }
        return Promise.resolve(false)
    }

    static async init(data: {serviceWorkerName: string, serverUrl: string}): Promise<boolean> {
        console.log('OWorker init...', data)
        await this.unregister();
        return this.register(data);
    };

    public static run(): void {
        // OServiceWorker.open();
        addEventListener('install', OWorker.onInstalled);
        addEventListener('fetch', OWorker.onFetched);
      }

      public static onInstalled = (event: any): void => {
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
            OWorker.fetchWithParamAddedToRequestBody(event.request)
          );
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
        return OWorker.serialize(request).then(function(serialized: any) {
            return OWorker.deserialize(serialized).then(function(request) {
              console.log(request.url);
              console.log(request.body);
              return fetch(request).then(async val => {
                if(val.status === 200) {
                  console.log('Success', val);
                } else{
                  console.log('Fail', val);
                //   OServiceWorker.addError(request, val, "SERVER_ERROR")
                }
                return val;
              })
              .catch(val => {
                console.log(val, request);
                console.log('Fail....', val);
                // OServiceWorker.addError(request, val, "FETCH_ERROR")
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
        for (var entry of request.headers.entries()) {
          headers[entry[0]] = entry[1];
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
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          return request.clone().text().then(function(body: any) {
            serialized.body = body;
            console.log(body);
            return Promise.resolve(serialized);
          });
        }
        return Promise.resolve(serialized);
      }
    
      private static deserialize = function deserializeF(data: any) {
        return Promise.resolve(new Request(data.url, data));
      }

      
  static Iosworker(){
    
    const {open: originalOpen} = window.XMLHttpRequest.prototype;
    const {setRequestHeader: originalSetRequestHeader} = window.XMLHttpRequest.prototype;
    let error: any = {};
    window.XMLHttpRequest.prototype.open = function() {
      console.log('xhr......', OWorker.data);
      error.url = arguments[1];
      this.addEventListener('load', function(ev) {
        console.log('load...', OWorker.data);
        if (this.status == 200 || this.status == 201) {
          OWorker.sendToServer();
        }
      })
      this.addEventListener('error', function(ev) {
        error.type = 'FETCH_ERROR';
        let err: any = OWorker.data.find(elt => (new RegExp(elt.url).test(error.url.replace(/\?.*/, ''))) && 'FETCH_ERROR' === elt.type);
        if(err){
          err.count++;
          if(!err.msisdn) {
            err.msisdn = error.msisdn;
          }
          err.os = error.os;
          err.osVersion = error.osVersion;
          err.localisation = error.localisation;
          err.address = error.address;
          err.appVersion = error.appVersion;
          err.model = error.model;
          err.updatedAt = new Date().getTime();
        }else{
          const now = new Date()
          err={
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
          } 
          OWorker.data.push(err);
        }
        console.log('error...', OWorker.data);
      })
      this.addEventListener('abort', function(ev) {
        console.log('abort...', OWorker.data);
      })
      this.addEventListener('timeout', function(ev) {
        
        error.type = 'FETCH_ERROR';
        let err: any = OWorker.data.find(elt => (new RegExp(elt.url).test(error.url.replace(/\?.*/, ''))) && 'FETCH_ERROR' === elt.type);
        if(err){
          err.count++;
          if(!err.msisdn) {
            err.msisdn = error.msisdn;
          }
          err.os = error.os;
          err.osVersion = error.osVersion;
          err.localisation = error.localisation;
          err.address = error.address;
          err.appVersion = error.appVersion;
          err.model = error.model;
          err.updatedAt = new Date().getTime();
        }else{
          const now = new Date()
          err={
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
          } 
          OWorker.data.push(err);
        }
        console.log('timeout...', OWorker.data);
      })
      // this.addEventListener('readystatechange', function(ev) {
      //   console.log('readystatechange...', this.response, this.responseURL);
      // })
      // this.addEventListener('timeout', function(ev) {
      //   console.log('timeout...', this.response, this.responseURL);
      // })
      originalOpen.apply(this, (arguments as any));
    }

    window.XMLHttpRequest.prototype.setRequestHeader = function() {
      console.log('header...', OWorker.data,);
      if(arguments[0] === '__msisdn__') {
        error.msisdn = arguments[1];
      }
      if(arguments[0] === '__app_version__') {
        error.appVersion = arguments[1];
      }
      if(arguments[0] === '__oms_terminal_model__') {
        error.model = arguments[1];
      }
      if(arguments[0] === '__oms_terminal_os__') {
        error.os = arguments[1];
      }
      if(arguments[0] === '__oms_terminal_version__') {
        error.osVersion = arguments[1];
      }
      if(arguments[0] === '__oms_user_localisation__') {
        error.localisation = arguments[1];
      }
      if(arguments[0] === '__oms_user_localisation_address__') {
        error.address = arguments[1];
      }
      console.log('error.........', error, OWorker.data);
      originalSetRequestHeader.apply(this, (arguments as any));
    }
  }

  private static async sendToServer(){
    console.log(OWorker.data);
    if(OWorker.data.length > 0){
      try {
        let response = await fetch(OWorker.SERVER_URL, { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
            },
            mode: 'cors',
            body: JSON.stringify(OWorker.data)
          });
          console.log(response);
        if( response.status === 0 || response.status === 200 || response.status === 201){//I added await because it wouldn't work
          OWorker.data=[];
        } else{
          console.log("Sorry, server not available!", response);
        }
      } catch (error) {
        console.log('sendToServer...', error);
      }
    }
  }
}

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