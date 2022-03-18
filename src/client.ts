import { BehaviorSubject, Observable, ReplaySubject, Subject } from "rxjs";

let client;
let resources:Record<string, BehaviorSubject<any>>;
let sse:Record<string, BehaviorSubject<any>>;

type ClientConfig = {
  cache: boolean,
  optimisticUpdates: boolean,
  prefix?:string
}

export type FetchConfig = {
  method?: Method,
  headers?: HeadersInit,
  body?: string 
}

const defaultConfig:ClientConfig = {
  cache: true,
  optimisticUpdates: true,
}

export const createClient = (config: ClientConfig) => {
  if(!window["_recall"]) {
    window["_recall"] = {};
    window["_recall"]["config"] = config;
    window["_recall"]["resources"] = {};
    window["_recall"]["sse"] = {};
  }
  client = window["_recall"];
  resources = window["_recall"]["resources"];
  sse = window["_recall"]["sse"];
};


export type Method = "POST" | 'GET' | 'PUT' | "DELETE";

const defualtFetch:FetchConfig  = {
  method: "GET"
}

/**
 * 
 * @param {string} url - url to endpoint
 * @param {FetchConfig} options - config (identical with fetch Options)
 * @returns {Observable} - an observable containing all states of the requests
 */
export const recall = <T>(url: string, options: FetchConfig = defualtFetch):Observable<{data:T | null, status: string | null, error: string | null}> => {
  const { method } = options;
  if(!client) {
    createClient(defaultConfig);
    console.warn("You tried using recall without initalizing a global client \n We will do that for u now with default Config")
  }
  switch(method){
    case 'GET':
      return _get<T>(url, options);
    case 'POST':
    case 'PUT':
    case 'DELETE':
      return _post(url, options);
    default:
      return new Observable(subscriber => { subscriber.next({data: null, status: null, error: "You used an unsuported method"}) })
  }
};

const _get = <T>(url: string, options: FetchConfig):Observable<{data:T | null, status: string | null, error: string | null}> => {
  if(resources[url]) return resources[url];
  resources[url] = new BehaviorSubject({data: null, status:'loading', error: null});
  fetch(url,  {...options})
    .then(res => {
      if(res.ok){
        return res.json();
      } else {
        throw new Error(`Failed with status ${res.status}`)
      }
    })
    .then((data) => {
      resources[url].next({data, status:'success', error: null})
    })
    .catch((error) => resources[url].next({data: null, status:'failed', error}))
  return resources[url].asObservable();

}

const _post = <T>( url: string, options: FetchConfig ):Observable<{data:T | null, status: string | null, error: string | null}> => {
  return new Observable(subscriber => {
      subscriber.next({data: null, status:'loading', error: null})
      fetch(url,  {...options})
        .then((res) =>{
          if(res.ok){
            return res.json();
          }else{
            throw new Error(`Failed with status ${res.status}`)
          }
        })
        .then((data) => {
          subscriber.next({data, status:'success', error: null})
          removeResource[url];
        })
        .catch((error) => subscriber.next({data: null, status:'failed', error}))
  })  
}
const removeResource = (resource: string) => {
  delete resources[resource]
}

// export const useSubscription = (name: string, source: string, type: string = 'message'):Observable<any> => {
//   if(!client) {
//     createClient(defaultConfig);
//   }
//   return new Observable(subscriber => {
//     if(sse[name]){
//       subscriber.next(sse[name]);
//     } else {
//       sse[name] = new EventSource(source);
//       sse[name].addEventListener(type, (ev) => subscriber.next(ev) )
//     }
//   })

// }

