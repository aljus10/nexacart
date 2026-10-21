'use client';
import {useState,useRef} from 'react';
import {Plus,Minus,RotateCcw,Pause,Play,Layers,MousePointer2} from 'lucide-react';
import {type Snapshot,type Dimension,type TableName,availability,formatNumber} from '@/lib/nexacart/engine';
export type Zone='seller'|'category'|'payment'|'courier'|'city';
export const zones:{id:Zone;name:string;subtitle:string;table:TableName;color:string;x:number;z:number}[]=[
 {id:'seller',name:'Seller square',subtitle:'Where business begins',table:'dim_seller',color:'#447363',x:-4.8,z:-4.5},
 {id:'category',name:'Product quarter',subtitle:'A little of everything',table:'dim_product',color:'#ba8b52',x:-4.8,z:4.7},
 {id:'payment',name:'Checkout hub',subtitle:'Every order connects here',table:'dim_payment',color:'#71834b',x:0,z:0},
 {id:'courier',name:'Dispatch yard',subtitle:'The journey continues',table:'dim_shipping',color:'#678f91',x:4.8,z:4.8},
 {id:'city',name:'Customer neighborhoods',subtitle:'Your customers, connected',table:'dim_customer',color:'#b98475',x:4.8,z:-4.8},
];
const OX=620,OY=314;
function p(x:number,z:number,h=0){return [OX+(x-z)*28,OY+(x+z)*14-h*28];}
function poly(coords:number[][]){return coords.map(a=>a.join(',')).join(' ');}
function ground(x:number,z:number,w:number,d:number,h=0){return [p(x-w/2,z-d/2,h),p(x+w/2,z-d/2,h),p(x+w/2,z+d/2,h),p(x-w/2,z+d/2,h)];}
function Slab({x,z,w,d,h=.15,top='#e6e9de',side='#c7d0c1'}:{x:number;z:number;w:number;d:number;h?:number;top?:string;side?:string}){
 const a=ground(x,z,w,d,h),b=ground(x,z,w,d,0);
 return <g><polygon points={poly([a[1],a[2],b[2],b[1]])} fill={side}/><polygon points={poly([a[2],a[3],b[3],b[2]])} fill={side}/><polygon points={poly(a)} fill={top}/></g>;
}
function Box({x,z,w,d,h,y=.15,top='#f8f8ed',left='#e4e6d8',right='#d0d7c8',stroke}:{x:number;z:number;w:number;d:number;h:number;y?:number;top?:string;left?:string;right?:string;stroke?:string}){
 const a=ground(x,z,w,d,h+y),b=ground(x,z,w,d,y);
 return <g stroke={stroke||'none'} strokeWidth=".6" strokeLinejoin="round"><polygon points={poly([a[1],a[2],b[2],b[1]])} fill={right}/><polygon points={poly([a[2],a[3],b[3],b[2]])} fill={left}/><polygon points={poly(a)} fill={top}/></g>;
}
function Tree({x,z,small=false}:{x:number;z:number;small?:boolean}){const [sx,sy]=p(x,z,.2);const r=small?10:14;return <g><ellipse cx={sx+6} cy={sy+3} rx={r+3} ry={5} fill="#243e2920"/><path d={`M${sx} ${sy}v-${r+10}`} stroke="#899073" strokeWidth="4"/><ellipse cx={sx} cy={sy-r-10} rx={r*.86} ry={r*1.22} fill="#719379"/><ellipse cx={sx-3} cy={sy-r-13} rx={r*.64} ry={r*.9} fill="#8fa98a"/></g>;}
function Front({x,z,w,h,y,color}:{x:number;z:number;w:number;h:number;y:number;color:string}){return <polygon points={poly([p(x-w/2,z,y+h),p(x+w/2,z,y+h),p(x+w/2,z,y),p(x-w/2,z,y)])} fill={color}/>;}
function Building({x,z,w=2.6,d=2,h=2,color='#547869',name,roof=true}:{x:number;z:number;w?:number;d?:number;h?:number;color?:string;name?:string;roof?:boolean}){
 const sign=p(x-w/2+.15,z+d/2+.01,h-.35);
 return <g>
  <polygon points={poly(ground(x+.2,z+.25,w+.25,d+.25,.16))} fill="#1a342b14"/>
  <Box x={x} z={z} w={w} d={d} h={h} top="#f5f4e9" left="#eeeee4" right="#cdd7cf"/>
  <Front x={x} z={z+d/2+.015} w={w} h={.64} y={h-.65} color={color}/>
  {name&&<text transform={`translate(${sign}) rotate(26.565)`} fontSize="7.5" letterSpacing="1.1" fontWeight="700" fill="#fff">{name}</text>}
  {[-.65,.08,.7].filter(v=>Math.abs(v)<w/2-.15).map((o,i)=><Front key={i} x={x+o} z={z+d/2+.02} w={.46} h={h*.4} y={.2} color={i===1?'#819991':'#a9bdb3'}/>)}
  {roof&&<><Box x={x-.4} z={z-.1} w={.8} d={.65} h={.18} y={h+.15} top="#c9d2c8" left="#acb9b0" right="#9baaa1"/><polygon points={poly(ground(x+.48,z+.1,.8,1.2,h+.17))} fill="#648082"/>{[0,.28,.56].map(n=><path key={n} d={`M${p(x+.08+n,z-.5,h+.18)}L${p(x+.08+n,z+.7,h+.18)}`} stroke="#9bb6ae" strokeWidth=".65"/>)}</>}
 </g>;
}
function Van({x,z,color='#416859',reverse=false}:{x:number;z:number;color?:string;reverse?:boolean}){const axle1=p(x-.4,z+.45,.26),axle2=p(x+.4,z+.45,.26);return <g><ellipse cx={p(x,z)[0]+3} cy={p(x,z)[1]+8} rx="25" ry="10" fill="#192f2625"/><Box x={x} z={z} w={1.4} d={.75} h={.68} y={.22} top="#faf9f1" left="#f6f4e9" right="#d1ddd3"/><Box x={x+(reverse?-.9:.9)} z={z} w={.45} d={.75} h={.5} y={.22} top={color} left={color} right="#32584c"/><Front x={x} z={z+.38} w={1.2} h={.16} y={.28} color={color}/>{[axle1,axle2].map((a,i)=><ellipse key={i} cx={a[0]} cy={a[1]} rx="4.7" ry="6" fill="#344840" transform={`rotate(-12 ${a})`}/>)}<path d={`M${p(x-.25,z+.4,.66)}l7 3`} stroke={color} strokeWidth="3"/></g>;}
function Package({x,z}:{x:number;z:number}){return <g><Box x={x} z={z} w={.43} d={.45} h={.4} top="#dfc9a2" left="#cbb18a" right="#ba9d73"/><path d={`M${p(x,z-.23,.57)}L${p(x,z+.23,.57)}`} stroke="#f2dfbd" strokeWidth="3"/></g>;}
export default function DistrictScene({snapshot,selected,onSelect}:{snapshot:Snapshot;selected:Zone;onSelect:(z:Zone)=>void}){
 const [zoom,setZoom]=useState(1),[playing,setPlaying]=useState(true),[details,setDetails]=useState(true),[pan,setPan]=useState({x:0,y:0});
 const drag=useRef<{x:number;y:number;px:number;py:number}|null>(null);
 const allReady=!availability(snapshot,[['fact_order_items',[]]]);
 const sceneObjects: {depth:number;node:React.ReactNode}[]=[];
 const add=(x:number,z:number,node:React.ReactNode)=>sceneObjects.push({depth:x+z,node});
 zones.forEach(zone=>{
  const muted=snapshot.tables[zone.table].status!=='available';
  const sel=selected===zone.id;
  const color=muted?'#a5afa3':zone.color;
  let content:React.ReactNode;
  if(zone.id==='seller')content=<>
   <Building x={-5.8} z={-5.1} w={2.2} d={2.1} h={2.65} color={color} name="CIRCUIT & CO."/>
   <Building x={-3.25} z={-5.1} w={1.8} d={2.1} h={1.8} color="#bca173" name="DAILY EDIT"/>
   <Building x={-5.8} z={-2.9} w={2.2} d={1.4} h={1.35} color={color} name="EVERYDAY"/>
   {details&&<><Tree x={-3.3} z={-2.8} small/><Package x={-5.8} z={-1.8}/><Package x={-5.2} z={-1.8}/></>}
  </>;
  else if(zone.id==='category')content=<>
   <Building x={-6} z={3.7} w={2} d={2} h={2.5} color={color} name="THE EDIT"/>
   <Building x={-3.65} z={3.7} w={2} d={2} h={2} color="#9da681" name="HOME + LIVING"/>
   <Building x={-5.1} z={5.9} w={3.8} d={1.6} h={1.35} color={color} name="NEXACART MARKET" roof={false}/>
   {[0,.55,1.1,1.65,2.2,2.75,3.3].map((n,i)=><polygon key={n} points={poly([p(-6.9+n,6.2,1.45),p(-6.35+n,6.2,1.45),p(-6.35+n,6.95,1.15),p(-6.9+n,6.95,1.15)])} fill={i%2?'#f6f0dd':'#bd956a'}/>)}
   {details&&<Tree x={-2.6} z={6.3}/>}
  </>;
  else if(zone.id==='payment')content=<>
   <Slab x={0} z={0} w={3.5} d={3.5} top={sel?'#dbe7b6':'#e2e7d0'}/>
   <Box x={0} z={0} w={2.15} d={2.15} h={2.5} top="#dbe6bc" left={color} right="#456448"/>
   <Box x={0} z={0} w={2.35} d={2.35} h={.2} y={2.6} top="#f2f1df" left="#e0e5d0" right="#cbd6b6"/>
   <text transform={`translate(${p(-.7,1.08,1.3)}) rotate(26.565)`} fontSize="22" fontWeight="800" fill="#e8f2b6">N</text>
   <polygon points={poly([p(-.8,1.1,.15),p(.8,1.1,.15),p(.8,1.1,.9),p(-.8,1.1,.9)])} fill="#a9c3ab"/>
   {details&&<><Tree x={1.4} z={-1.3} small/><Tree x={-1.4} z={1.3} small/></>}
  </>;
  else if(zone.id==='city')content=<>
   {[[-.9,-1.3,1.8,'#d3ba9c'],[1.15,-1.3,2.3,'#cad4c5'],[-1,1.2,1.65,'#e2c5b0'],[1.15,1.1,2.65,'#d3d9cc']].map(([dx,dz,h,c],i)=><g key={i}><Building x={zone.x+Number(dx)} z={zone.z+Number(dz)} w={1.5} d={1.5} h={Number(h)} color={String(c)} roof={false}/><Box x={zone.x+Number(dx)} z={zone.z+Number(dz)} w={1.68} d={1.7} h={.18} y={Number(h)+.15} top="#c4947f" left="#b0836e" right="#a2715e"/></g>)}
   {details&&<><Tree x={7.25} z={-5.7}/><Tree x={3.5} z={-2.3} small/><Tree x={6.9} z={-2.8} small/></>}
  </>;
  else content=<>
   <Building x={4.5} z={3.95} w={4.8} d={2.8} h={2.05} color={color} name="NEXACART FULFILLMENT"/>
   {[3,4.45,5.9].map(x=><g key={x}><Front x={x} z={5.36} w={.85} h={1} y={.2} color="#73928c"/>{[.25,.48,.71].map(y=><path key={y} d={`M${p(x-.42,5.38,y)}L${p(x+.42,5.38,y)}`} stroke="#aac1b5" strokeWidth=".8"/>)}</g>)}
   <Van x={3.7} z={6.45} color={color}/><Van x={6.1} z={6.45} color="#bf9868"/>
   {details&&<><Package x={2.4} z={6.15}/><Package x={2.35} z={5.6}/><Tree x={7.5} z={3.2}/></>}
  </>;
  add(zone.x,zone.z,<g data-zone={zone.id} className={`district-building ${sel?'selected':''} ${muted?'unavailable':''}`} role="button" tabIndex={0} aria-label={`Explore ${zone.name}${muted?', data unavailable':''}`} onClick={()=>onSelect(zone.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(zone.id);}}}>
   {zone.id!=='payment'&&<Slab x={zone.x} z={zone.z} w={5.7} d={5.6} top={sel?'#e1e9cb':'#e5e7db'} side="#d2d8c7"/>}
   {sel&&<polygon points={poly(ground(zone.x,zone.z,zone.id==='payment'?3.65:5.85,zone.id==='payment'?3.65:5.75,.18))} fill="none" stroke="#698558" strokeWidth="1.5" strokeDasharray="5 3"/>}
   <g opacity={muted?.34:1}>{content}</g>
  </g>);
 });
 if(details)for(const [x,z] of [[-8,-8],[-8,-6],[-8,0],[-8,8],[-6,8],[0,8],[8,8],[8,0],[8,-8],[6,-8],[0,-8],[-8,4],[8,5]])add(x,z,<Tree x={x} z={z}/>);
 return <div className="scene-wrap">
  <svg className={`district-svg ${playing?'':'paused'}`} viewBox="0 0 1240 655" aria-label="Interactive isometric commerce district. Choose a district to inspect its data." onPointerDown={e=>{if((e.target as Element).closest('[data-zone]'))return;drag.current={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current){const rect=e.currentTarget.getBoundingClientRect();setPan({x:drag.current.px+(e.clientX-drag.current.x)*1240/rect.width,y:drag.current.py+(e.clientY-drag.current.y)*655/rect.height});}}} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
   <defs><radialGradient id="sceneHalo"><stop stopColor="#e3e7d7"/><stop offset="1" stopColor="#f0f1e9" stopOpacity="0"/></radialGradient><filter id="islandShadow" x="-25%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation="14"/></filter><filter id="tagShadow" x="-30%" y="-60%" width="170%" height="250%"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#254331" floodOpacity=".10"/></filter></defs>
   <ellipse cx="620" cy="345" rx="540" ry="290" fill="url(#sceneHalo)"/>
   <g transform={`translate(${pan.x} ${pan.y}) translate(620 325) scale(${zoom}) translate(-620 -325)`}>
    <polygon points={poly(ground(.1,.1,19,19,-.8))} fill="#345138" opacity=".12" filter="url(#islandShadow)"/>
    <Slab x={0} z={0} w={19} d={19} h={.15} top="#e9eadd" side="#d4dbca"/>
    <polygon points={poly(ground(0,0,18.7,2.25,.16))} fill="#ced5c9"/>
    <polygon points={poly(ground(0,0,2.25,18.7,.17))} fill="#ced5c9"/>
    {Array.from({length:18},(_,i)=>i-9).filter(n=>Math.abs(n)>2).map(n=><g key={n}><path d={`M${p(n+.1,0,.18)}L${p(n+.65,0,.18)}`} stroke="#eff1e5" strokeWidth="2"/><path d={`M${p(0,n+.1,.18)}L${p(0,n+.65,.18)}`} stroke="#eff1e5" strokeWidth="2"/></g>)}
    {[[-7.5,7.5],[-7.5,-7.5],[7.5,-7.5],[7.5,7.5]].map(([x,z],i)=><path key={i} d={`M${p(x-.55,z,.18)}L${p(x+.55,z,.18)}`} stroke="#b8c2af" strokeWidth="1"/>)}
    <g opacity={allReady?1:.2}>{playing&&allReady&&<><g className="route-van"><animateTransform attributeName="transform" type="translate" values="0 0;-420 210" dur="19s" repeatCount="indefinite"/><Van x={.5} z={-8.5}/></g><g className="route-van"><animateTransform attributeName="transform" type="translate" values="0 0;420 210" dur="23s" repeatCount="indefinite"/><Van x={-8} z={-.55} color="#bd9667" reverse/></g></>}</g>
    {sceneObjects.sort((a,b)=>a.depth-b.depth).map((o,i)=><g key={i}>{o.node}</g>)}
    {zones.map(zone=>{
      const [x,y]=p(zone.x,zone.z,zone.id==='payment'?4.4:4.3);
      const missing=snapshot.tables[zone.table].status!=='available';
      const width=zone.id==='city'?185:zone.id==='category'?146:140;
      return <g key={zone.id} className={`scene-label ${selected===zone.id?'active':''}`} data-zone={zone.id} role="button" tabIndex={0} aria-label={`Select ${zone.name}`} onClick={()=>onSelect(zone.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(zone.id);}}} transform={`translate(${x-width/2} ${y})`} filter="url(#tagShadow)"><rect width={width} height="34" rx="9" fill={selected===zone.id?'#243f34':'#fffffb'} stroke={selected===zone.id?'#243f34':'#d9dfd1'}/><circle cx="14" cy="17" r="3.4" fill={missing?'#b39b79':selected===zone.id?'#d6ed9b':zone.color}/><text x="25" y="21" fontSize="11" fontWeight="600" fill={selected===zone.id?'#f4f6e9':'#405344'}>{zone.name}</text><path d={`M${width/2} 34v10`} stroke="#9caa8c"/><circle cx={width/2} cy="46" r="2.5" fill="#899e77"/></g>;
    })}
   </g>
  </svg>
  <div className="map-caption"><span className="tiny-square"/>Illustrative activity<span className="caption-separator">·</span>Not live tracking</div>
  <div className="scene-legend"><span><i style={{background:'#447363'}}/>Sellers</span><span><i style={{background:'#ba8b52'}}/>Products</span><span><i style={{background:'#678f91'}}/>Shipping</span></div>
  <div className="map-controls"><button aria-label="Zoom in" title="Zoom in" onClick={()=>setZoom(z=>Math.min(1.8,z+.15))}><Plus size={16}/></button><button aria-label="Zoom out" title="Zoom out" onClick={()=>setZoom(z=>Math.max(.65,z-.15))}><Minus size={16}/></button><span/><button aria-label="Reset map view" title="Reset view" onClick={()=>{setZoom(1);setPan({x:0,y:0});}}><RotateCcw size={15}/></button><button aria-label={playing?'Pause illustrative activity':'Play illustrative activity'} title={playing?'Pause activity':'Play activity'} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={15}/>:<Play size={15}/>}</button><button aria-label="Toggle map details" title="Toggle landscaping" className={!details?'pressed':''} onClick={()=>setDetails(!details)}><Layers size={16}/></button></div>
  <span className="scene-instruction"><MousePointer2 size={12}/>Click a district to explore<span>· Drag to pan</span></span>
 </div>;
}
