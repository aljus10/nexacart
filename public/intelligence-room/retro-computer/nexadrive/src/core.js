export const TAU=Math.PI*2;
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
export const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const mul=(v,s)=>v.map(x=>x*s);
export const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const length=v=>Math.hypot(...v);
export const unit=v=>mul(v,1/(length(v)||1));
export function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const COURSES=[
 {id:'aster',name:'Aster Reach',eyebrow:'01 / THE LUNAR BELT',description:'Trace the moon. Thread the asteroid belt.',seed:83,accent:'#b9e4e7',planet:'#b5aaa0',sky:'#071319',haze:'#19313a',label:'Lunar slalom',difficulty:'Flow',gates:24},
 {id:'ember',name:'Ember Rift',eyebrow:'02 / THE RED FRONTIER',description:'A rising spiral through a red planet’s orbit.',seed:197,accent:'#ffb17e',planet:'#ba6743',sky:'#160c12',haze:'#432022',label:'Vertical switchbacks',difficulty:'Technical',gates:28},
 {id:'halo',name:'Halo Meridian',eyebrow:'03 / THE OUTER RING',description:'Bank beneath the rings. Find your own line.',seed:409,accent:'#c1c6ff',planet:'#a5b5c7',sky:'#090e1d',haze:'#222b4c',label:'Orbital sprint',difficulty:'Fast',gates:30}
];
function controlPoint(id,u){const a=u*TAU;if(id==='aster')return[720*Math.sin(a)+110*Math.sin(a*3),70*Math.sin(a*2)+35*Math.cos(a*3),820*Math.cos(a)+110*Math.sin(a*2)];if(id==='ember')return[760*Math.sin(a)+150*Math.sin(a*2),160*Math.sin(a*3),760*Math.cos(a)+130*Math.cos(a*2)];return[900*Math.sin(a)+90*Math.sin(a*3),160*Math.sin(a*2)+45*Math.sin(a*5),680*Math.cos(a)+120*Math.cos(a*3)];}
function catmull(points,u){const n=points.length,v=((u%1+1)%1)*n,i=Math.floor(v),t=v-i,t2=t*t,t3=t2*t,p0=points[(i+n-1)%n],p1=points[i%n],p2=points[(i+1)%n],p3=points[(i+2)%n];return p1.map((p,k)=>.5*((2*p)+(-p0[k]+p2[k])*t+(2*p0[k]-5*p+4*p2[k]-p3[k])*t2+(-p0[k]+3*p-3*p2[k]+p3[k])*t3));}
export function makeCourse(def){
 const points=Array.from({length:32},(_,i)=>controlPoint(def.id,i/32)),table=[0];let previous=catmull(points,0),total=0;
 for(let i=1;i<=2048;i++){const p=catmull(points,i/2048);total+=length(sub(p,previous));table.push(total);previous=p;}
 const course={...def,points,table,length:total};
 course.sample=distance=>{
  const d=((distance%total)+total)%total;let lo=0,hi=2048;while(lo+1<hi){const mid=(lo+hi)>>1;if(table[mid]<d)lo=mid;else hi=mid;}
  const u=(lo+(d-table[lo])/(table[lo+1]-table[lo]||1))/2048,p=catmull(points,u),forward=unit(sub(catmull(points,u+.00015),catmull(points,u-.00015))),right=unit(cross(forward,[0,1,0])),up=unit(cross(right,forward));return{p,forward,right,up};
 };
 const random=rng(def.seed);
 course.gateList=Array.from({length:def.gates},(_,i)=>({distance:(i+1)*total/def.gates,x:Math.sin(i*1.71+def.seed)*31,y:Math.cos(i*1.19+def.seed)*19,radius:31,index:i}));
 course.rocks=Array.from({length:40},(_,i)=>({distance:(i+.47)*total/40,x:(random()-.5)*180,y:(random()-.5)*125,radius:5+random()*7,spin:random()*TAU,seed:Math.floor(random()*1e5),lastHit:-1}));
 return course;
}
export function atOffset(frame,x,y){return add(frame.p,add(mul(frame.right,x),mul(frame.up,y)));}
export function createFlight(course){return{phase:'ready',course,distance:0,speed:0,x:0,y:0,vx:0,vy:0,elapsed:0,penalty:0,boost:100,shield:100,nextGate:0,cleared:0,perfect:0,score:0,combo:0,bestCombo:0,cooldown:0,hit:0,boosting:false,events:[],collisions:0,grade:null};}
export function beginFlight(state){state.phase='running';state.speed=65;return state;}
export function finishFlight(s,failed=false){s.phase=failed?'failed':'finished';s.boosting=false;const rate=s.cleared/s.course.gates;s.grade=failed?'—':rate>=.96&&s.collisions<2?'S':rate>=.8?'A':rate>=.6?'B':'C';s.events.push({type:failed?'failed':'finish'});}
export function stepFlight(s,dt,input={}){
 s.events.length=0;if(s.phase!=='running')return;dt=clamp(dt,0,.05);const previous=s.distance;
 s.elapsed+=dt;s.cooldown=Math.max(0,s.cooldown-dt);s.hit=Math.max(0,s.hit-dt*2.2);
 s.boosting=!!input.boost&&(s.boosting?s.boost>0:s.boost>=12)&&!input.brake;
 const cruise=s.course.id==='halo'?107:96,target=input.brake?42:s.boosting?175:cruise;
 s.speed=damp(s.speed,target,s.boosting?2.2:1.7,dt);s.boost=clamp(s.boost+(s.boosting?-30:12)*dt,0,100);s.shield=clamp(s.shield+(s.cooldown===0?2.5:0)*dt,0,100);
 s.vx=damp(s.vx,clamp(input.x||0,-1,1)*65,8,dt);s.vy=damp(s.vy,clamp(input.y||0,-1,1)*50,8,dt);s.x=clamp(s.x+s.vx*dt,-72,72);s.y=clamp(s.y+s.vy*dt,-51,51);s.distance=Math.min(s.course.length,s.distance+s.speed*dt);
 while(s.nextGate<s.course.gates&&s.distance>=s.course.gateList[s.nextGate].distance){
  const gate=s.course.gateList[s.nextGate],dist=Math.hypot(s.x-gate.x,s.y-gate.y),hit=dist<=gate.radius-3;
  if(hit){s.cleared++;s.combo++;s.bestCombo=Math.max(s.bestCombo,s.combo);const perfect=dist<12;if(perfect)s.perfect++;s.score+=(perfect?1200:800)+Math.min(s.combo,10)*60;s.boost=clamp(s.boost+14,0,100);s.events.push({type:perfect?'perfect':'gate',combo:s.combo});}
  else{s.combo=0;s.penalty+=2;s.events.push({type:'miss'});}s.nextGate++;
 }
 if(!s.cooldown)for(const rock of s.course.rocks){if(rock.distance+rock.radius<previous||rock.distance-rock.radius>s.distance)continue;if(Math.hypot(rock.x-s.x,rock.y-s.y)<rock.radius+5){s.shield=Math.max(0,s.shield-24);s.speed*=.62;s.cooldown=1.4;s.hit=1;s.collisions++;s.combo=0;s.score=Math.max(0,s.score-250);s.events.push({type:'collision'});break;}}
 if(s.shield<=0)finishFlight(s,true);else if(s.distance>=s.course.length)finishFlight(s);
}
export const formatTime=seconds=>{const value=Math.max(0,seconds);return Math.floor(value/60).toString().padStart(2,'0')+':'+(value%60).toFixed(2).padStart(5,'0');};
export function resultRecord(s){return{course:s.course.id,time:Number((s.elapsed+s.penalty).toFixed(3)),cleared:s.cleared,perfect:s.perfect,score:s.score,grade:s.grade,date:new Date().toISOString()};}
export function isBetter(a,b){return!b||a.score>b.score||(a.score===b.score&&a.time<b.time);}
