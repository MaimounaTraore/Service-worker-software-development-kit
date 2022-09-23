export class OWorker {

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
          window.addEventListener('load', function() {
            console.log('addEventListener::load...')  
            navigator.serviceWorker.register(data.serviceWorkerName).then(function(registration) {
              console.log('OWorker registered with scope: ', registration.scope);
              registration.installing?.postMessage({url: data.serverUrl, interval: 5000});//
              registration.waiting?.postMessage('waiting...');//
              }, function(err) {
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
    const {send: originalSend} = window.XMLHttpRequest.prototype;
    window.XMLHttpRequest.prototype.open = function() {
      console.log('xhr......', arguments);
      this.addEventListener('progress', function(ev) {
        console.log('progress...', this.response, this.responseURL);
      })
      this.addEventListener('load', function(ev) {
        console.log('load...', this.response, this.responseURL);
      })
      this.addEventListener('error', function(ev) {
        console.log('error...', this.response, this.responseURL);
      })
      this.addEventListener('abort', function(ev) {
        console.log('abort...', this.response, this.responseURL);
      })
      this.addEventListener('loadend', function(ev) {
        console.log('loadend...', this.response, this.responseURL);
      })
      this.addEventListener('timeout', function(ev) {
        console.log('timeout...', this.response, this.responseURL);
      })
      // this.addEventListener('readystatechange', function(ev) {
      //   console.log('readystatechange...', this.response, this.responseURL);
      // })
      this.addEventListener('timeout', function(ev) {
        console.log('timeout...', this.response, this.responseURL);
      })
      originalOpen.apply(this, (arguments as any));
    }

    window.XMLHttpRequest.prototype.send = function() {
      console.log('send.....', arguments);
      originalSend.apply(this, arguments as any);
      this.addEventListener('load', function(ev) {
        console.log('load...', this.response, this.getAllResponseHeaders());
      })
    }
  }
}