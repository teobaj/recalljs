import { Observable, ReplaySubject } from "rxjs";

let client;
let resources;
let sse;

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
  if(!window["absClient"]) {
    window["absClient"] = {};
    window["absClient"]["config"] = config;
    window["absClient"]["entities"] = {};
    window["absClient"]["sse"] = {};
  }
  client = window["absClient"];
  resources = window["absClient"]["entities"];
  sse = window["absClient"]["sse"];
};


export type Method = "POST" | 'GET' | 'PUT' | "DELETE";

const defualtFetch:FetchConfig  = {
  method: "GET"
}

export const useFetch = (name: string, url: string, options: FetchConfig = defualtFetch) => {
  const { method } = options;
  if(!client) {
    createClient(defaultConfig);
  }
  switch(method){
    case 'GET':
      return _get(name, url, options);
    case 'POST':
    case 'PUT':
    case 'DELETE':
      return _post(name, url, options);
  }
  
};

const _get = (name: string, url: string, options: FetchConfig):Observable<any> => {
  return new Observable(subscriber => {
    if (resources[name]) {
      subscriber.next(resources[name]);
    } else {
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
          resources[name] = ({data, status:'success', error: null})
        })
        .catch((error) => subscriber.next({data: null, status:'failed', error}))
    }
  })  
}

const _post = (name:string, url: string, options: FetchConfig ) => {
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
          removeResource[name];
        })
        .catch((error) => subscriber.next({data: null, status:'failed', error}))

  })  
}
const removeResource = (resource: string) => {
  delete resources[resource]
}

export const useSubscription = (name: string, source: string, type: string = 'message'):Observable<any> => {
  if(!client) {
    createClient(defaultConfig);
  }
  return new Observable(subscriber => {
    if(sse[name]){
      subscriber.next(sse[name]);
    } else {
      sse[name] = new EventSource(source);
      sse[name].addEventListener(type, (ev) => subscriber.next(ev) )
    }
  })

}

