import { AsyncLocalStorage } from 'node:async_hooks';
const store = new AsyncLocalStorage<Record<string,string>>();
export function runWithRuntimeEnv<T>(env:Record<string,string>,fn:()=>T):T{return store.run(env,fn);}
export function getRequestEnv(){return store.getStore();}
