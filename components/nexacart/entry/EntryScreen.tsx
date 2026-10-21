'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowRight} from 'lucide-react';
import CartStage from './CartStage';
import {ENTRY_TRANSITION_MS,ENTRY_QUICK_TRANSITION_MS} from './entry-motion';

export default function EntryScreen(){
 const router=useRouter(),[hovered,setHovered]=useState(false),[entering,setEntering]=useState(false),[ready,setReady]=useState(false),[mapReady,setMapReady]=useState(false),[quick,setQuick]=useState(false);
 const button=useRef<HTMLAnchorElement>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);

 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Enter'&&document.activeElement===document.body){
    e.preventDefault();
    button.current?.click();
   }
  };
  document.addEventListener('keydown',key);
  if(window.isSecureContext)router.prefetch('/map');
  return()=>{
   document.removeEventListener('keydown',key);
   if(timer.current)clearTimeout(timer.current);
  };
 },[router]);

 const enter=(e:React.MouseEvent<HTMLAnchorElement>)=>{
  if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
  e.preventDefault();
  if(entering)return;
  const short=!ready||!mapReady||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setQuick(short);
  setEntering(true);
  timer.current=setTimeout(()=>router.push('/map'),short?ENTRY_QUICK_TRANSITION_MS:ENTRY_TRANSITION_MS);
 };

 return <main className={`studio-entry ${entering?'is-exiting':''} ${quick?'quick-exit':''}`}>
  <CartStage paused={false} hovered={hovered} entering={entering&&!quick} onReady={setReady} onMapReady={()=>setMapReady(true)}/>
  <header className="studio-header studio-stagger-item">
   <Link href="/" className="studio-wordmark" aria-label="NexaCart home">
    <span className="studio-logo-symbol"><i/><i/></span>
    <span>NEXA<b>CART</b></span>
   </Link>
   <span className="studio-header-note">
    <i/>A CONNECTED WORLD OF COMMERCE
   </span>
  </header>
  <div className="studio-title">
   <span className="studio-eyebrow studio-stagger-item"><i/>A CONNECTED WORLD OF COMMERCE</span>
   <h1 className="studio-stagger-item">Every order tells a story<span>.</span></h1>
   <p className="studio-stagger-item">Explore the shops, journeys, and numbers behind NexaCart.</p>
  </div>
  <div className="studio-entry-action studio-stagger-item">
   <Link prefetch={false} href="/map" ref={button} onClick={enter} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocus={()=>setHovered(true)} onBlur={()=>setHovered(false)} className="studio-enter-button" aria-label="Enter NexaCart commerce workspace">
    <span>{entering?'Opening your world…':'Enter NexaCart'}</span>
    <span className="studio-enter-arrow">
      <ArrowRight size={18} strokeWidth={2}/>
    </span>
   </Link>
  </div>
  <footer className="studio-footer studio-stagger-item">
   <span className="studio-origin"><i/>MAROLLANO & DAGASDAS<span>© 2026 NexaCart</span></span>
  </footer>
  <div className="studio-exit-wash"/>
 </main>;
}
