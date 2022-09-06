  const list =[];
  let errList = [];

  //This two arrays are to contain succeeded and failed requests

  self.addEventListener('install', function(event) 
  {
    self.skipWaiting();
  })

  //For the skipwaiting part
  
  self.addEventListener('fetch', function(event) {
    console.log('before....', event);
    if(event.request.mode === 'navigate'  || event.request.mode === 'no-cors' || event.request.url.startsWith('http://localhost:8')){
      console.log(list); 
      console.log(errList); 
      return;
    }
//This one right here is is fetcjhing ant event but the ones of the type precised in the if parentheses
    console.log(event);
    
    event.respondWith(
      fetchWithParamAddedToRequestBody(event.request)
    );

    });

    function fetchWithParamAddedToRequestBody(request) {
      return serialize(request).then(function(serialized) {
        return deserialize(serialized).then(function(request) {
          console.log(request.url);
          console.log(request.body);
          return fetch(request).then(async val => {
            if(val.status === 200) {
              test(request, val.clone());
            } else{
              onError(request, val, 'SERVER_ERROR');
            }
            clearTimeout(timeoutId);
            return val;
          })
          .catch(val => {
            console.log(val, request);
            onError(request, val, 'FETCH_ERROR');
            return Response.error();
          });
        }).catch(val => {
          console.log(val, request);
        });
      }).catch(val => {
        console.log(val, request);
      });
    }
    //

    function serialize(request) {
      var headers = {};
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
        referrer: request.referrer
      };  
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return request.clone().text().then(function(body) {
          serialized.body = body;
          console.log(body);
          return Promise.resolve(serialized);
        });
      }
      return Promise.resolve(serialized);
    }
    function formatUrl(url){
      const index = url.lastIndexOf('/')
      return url.slice(0, index) + '/' + url.slice(index +1, url.indexOf('?')) 
    }

    function deserialize(data) {
      return Promise.resolve(new Request(data.url, data));
    }

    async function test(req, val) {
      console.log(val);
      res = await val.json();
      list.push({
        name: '',
        req: req.url,
        res: res
      });
    }

    async function onError(req, val, type) {
      console.log(type);
      let err= errList.find(elt => (new RegExp(elt.url).test(req.url.replace(/\?.*/, ''))) && type === elt.type)
      if(err){
        err.count++;
        err.timestamps.push(new Date());
      }else{
        err={
          id: null,
          count: 1,
          timestamps: [new Date()],
          url: req.url.replace(/\?.*/, ''),
          type: type,
        }
        errList.push(err)
      }
      // const rs = await request.onsuccess(err);
      // rs.onsuccess = function(){
      //   err.id=rs.result;
      //   console.log(rs.result, err, errList)
      // };
  }
//SENDING TO THE SERVER 
    async function sendToServer(){
      console.log(errList);
      if(errList.length > 0){
        try {
          let response = await fetch('http://192.168.1.6:3000/test', { 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json;charset=utf-8'
              },
              mode: 'cors',
              body: JSON.stringify(errList)
            });
            console.log(response);
          if(response.status === 200){
            errList=[];
          } else{
            console.log("Sorry, server not available!", response);
          }
        } catch (error) {
          console.log(error);
        }
    }
  }

