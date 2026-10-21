'use client';
import {useEffect,useRef,useState} from 'react';

export default function CartStage({paused,hovered,entering,onReady,onMapReady}:{paused:boolean;hovered:boolean;entering:boolean;onReady:(ready:boolean)=>void;onMapReady:()=>void}){
 const host=useRef<HTMLDivElement>(null),current=useRef({paused,hovered,entering,onReady,onMapReady});
 current.current={paused,hovered,entering,onReady,onMapReady};
 const [ready,setReady]=useState(false);
 const [failed,setFailed]=useState(false);

 useEffect(()=>{
  let cancelled=false,dispose:(()=>void)|undefined;
  import('./cart-renderer').then(({mountCartScene})=>{
   if(cancelled||!host.current)return;
   try{
    dispose=mountCartScene(host.current,{
     paused:()=>current.current.paused,
     hovered:()=>current.current.hovered,
     entering:()=>current.current.entering,
     onReady:()=>{
      if(!cancelled){
       setReady(true);
       current.current.onReady(true);
      }
     },
     onMapReady:()=>{
      if(!cancelled)current.current.onMapReady();
     },
     onFailure:()=>{
      if(!cancelled){
       setFailed(true);
       setReady(false);
       current.current.onReady(false);
      }
     }
    });
   }catch{
    if(!cancelled){
     setFailed(true);
     setReady(false);
     current.current.onReady(false);
    }
   }
  }).catch(()=>{
   if(!cancelled){
    setFailed(true);
    setReady(false);
    current.current.onReady(false);
   }
  });
  return()=>{cancelled=true;dispose?.();};
 },[]);

 return <div className={`studio-stage ${ready?'is-ready':''} ${failed?'is-failed':''}`} aria-hidden="true">
  {failed && (
   <div className="studio-fallback">
    <img src="/cart-fallback.svg" alt="" draggable={false}/>
   </div>
  )}
  <div className="studio-webgl" ref={host}/>
 </div>;
}
