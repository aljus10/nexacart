import * as THREE from 'three';
import type {PlaceKind,Transport} from '@/lib/nexacart/map-data';
const C={wall:0xffffff,roof:0x2c3e50,glass:0x7ec8e3,orange:0xff5722,asphalt:0xa4b6c6,green:0x10b981};
const materials=new Map<number,THREE.MeshStandardMaterial>();
function mat(color:number){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.78,metalness:.04}));return materials.get(color)!;}
function box(g:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number,color:number){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function cylinder(g:THREE.Group,x:number,y:number,z:number,r:number,h:number,color:number,sides=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,sides),mat(color));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;}
function sign(g:THREE.Group,text:string,x:number,y:number,z:number,w:number,h:number){
 if(typeof document==='undefined')return;
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');if(!c)return;
 c.fillStyle='#243447';c.fillRect(0,0,512,128);c.fillStyle='#ffffff';c.font='600 43px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text.length>20?text.slice(0,19)+'…':text,256,67,475);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));m.position.set(x,y,z);g.add(m);
}
export function parcel(x=0,y=0,z=0){const g=new THREE.Group();box(g,x,y+.075,z,.16,.15,.15,0xdab282);box(g,x,y+.153,z,.032,.004,.15,0xf0d3a6);return g;}
function tree(g:THREE.Group,x:number,z:number,scale=1){cylinder(g,x,.17*scale,z,.023*scale,.34*scale,0x8b6e4e,6);const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.15*scale,1),mat(0x34d399));m.position.set(x,.39*scale,z);m.scale.y=1.3;m.castShadow=true;g.add(m);}
function roof(g:THREE.Group,x:number,y:number,z:number,w:number,d:number,h:number,color:number){const vertices=new Float32Array([-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2,0,h,-d/2,0,h,d/2]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(vertices,3));geo.setIndex([0,4,1,3,2,5,0,3,5,0,5,4,1,4,5,1,5,2,0,1,2,0,2,3]);geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=true;g.add(m);}
function house(g:THREE.Group,x:number,z:number,color:number,scale=1){box(g,x,.19*scale,z,.44*scale,.38*scale,.42*scale,0xf5efe5);roof(g,x,.38*scale,z,.53*scale,.5*scale,.2*scale,color);box(g,x,.13*scale,z+.213*scale,.095*scale,.26*scale,.008*scale,0x697d8d);box(g,x+.13*scale,.25*scale,z+.214*scale,.095*scale,.1*scale,.008*scale,0xa8c4d4);}
export function placeModel(kind:PlaceKind,name:string,count=1){
 const g=new THREE.Group();
 if(kind==='hq'){
  box(g,0,.02,0,1.5,.04,1.3,0xd8e1e9);box(g,0,.45,-.1,1.05,.86,.76,0xf8fafb);box(g,0,.45,.285,.94,.72,.025,0x88acc9);
  for(const x of [-.32,0,.32])box(g,x,.46,.307,.017,.76,.02,0xc4d4df);for(const y of [.29,.58])box(g,0,y,.312,.95,.015,.018,0xc4d4df);
  box(g,0,.90,-.1,1.15,.06,.86,0x25374b);sign(g,'NEXACART',0,.82,.32,.89,.11);box(g,0,.13,.37,.22,.22,.04,0x405a70);box(g,0,.042,.55,.53,.02,.25,0xb6c5d1);
  const mast=cylinder(g,-.49,1.19,-.38,.013,.53,0x687c8e,8);mast.name='NexaCart HQ flagpole';box(g,-.34,1.35,-.38,.3,.14,.012,0xed7957);tree(g,-.61,.27,.78);tree(g,.61,.24,.7);
 }else if(kind==='shop'){
  box(g,0,.02,0,1.35,.04,1.06,0xd6dfe6);
  box(g,0,.33,-.09,.98,.62,.68,C.wall);box(g,0,.65,-.09,1.04,.045,.74,0xe8edf0);
  box(g,0,.3,.255,.85,.39,.015,C.glass);box(g,-.1,.24,.27,.1,.48,.02,0xdbe5ec);box(g,0,.13,.32,1.12,.02,.18,0x64798c);
  box(g,0,.47,.37,1.13,.07,.27,C.orange);
  for(let i=0;i<7;i++)box(g,-.47+i*.155,.508,.37,.077,.005,.26,i%2?0xf9f6ed:0xeaaa8d);
  sign(g,count>1?`NEXACART · ${count} SHOPS`:name,0,.575,.258,.85,.13);
  box(g,-.21,.71,-.12,.22,.08,.24,0xa6b4c0);box(g,.26,.68,-.22,.25,.014,.24,0x667f96);
  g.add(parcel(.52,.045,.28));tree(g,-.57,-.35,.67);
  if(count>4){box(g,-.48,.17,-.37,.24,.28,.28,0xd6e0e7);}
 }else if(kind==='hub'){
  box(g,0,.02,0,1.65,.04,1.38,0xcbd5de);box(g,0,.29,-.17,1.37,.54,.76,0xf7f8fa);
  roof(g,0,.56,-.17,1.5,.88,.20,0x5c7491);
  for(const x of [-.45,0,.45]){box(g,x,.19,.219,.29,.36,.025,0x688198);for(let i=0;i<4;i++)box(g,x,.065+i*.07,.238,.28,.008,.01,0xa4b4c1);}
  sign(g,'NEXACART HUB',0,.48,.234,1.05,.1);
  for(const x of [-.57,0,.57]){box(g,x,.046,.48,.016,.006,.28,0xf7e0a2);}
  g.add(parcel(-.69,.04,.16));g.add(parcel(-.69,.04,.38));tree(g,.73,-.45,.75);
 }else{
  box(g,0,.018,0,1.45,.035,1.12,0xd9e5df);house(g,-.3,-.1,0xc78472,.9);house(g,.32,-.16,0x7394af,.85);
  box(g,-.03,.042,.34,.35,.018,.5,0xe7dfd1);tree(g,-.59,.27,.67);tree(g,.58,.22,.63);
  const step=box(g,.31,.052,.17,.27,.03,.09,0xc6d1d7);step.name='Recipient doorstep';
 }
 g.scale.setScalar(.68);return g;
}
function wheel(g:THREE.Group,x:number,y:number,z:number,r:number,width=.04){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,width,14),mat(0x25313f));m.rotation.z=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;g.add(m);const h=new THREE.Mesh(new THREE.CylinderGeometry(r*.53,r*.53,width+.004,12),mat(0xabb8c4));h.rotation.z=Math.PI/2;h.position.copy(m.position);g.add(h);}
export function vehicleModel(mode:Transport,color=0xef7955){
 const g=new THREE.Group();
 if(mode==='van'){
  box(g,0,.16,0,.29,.27,.62,0xf9fbfc);box(g,0,.30,-.04,.29,.015,.5,0xfefefe);box(g,0,.16,.34,.28,.22,.18,color);
  box(g,0,.245,.438,.235,.105,.008,0x506a7e);box(g,0,.12,.438,.29,.045,.01,0xd0dce5);
  for(const x of [-.152,.152]){box(g,x,.15,-.03,.008,.05,.47,color);wheel(g,x,.055,-.2,.075);wheel(g,x,.055,.27,.075);}
  for(const x of [-.09,.09])box(g,x,.13,.447,.05,.025,.005,0xfff1d1);
 }else if(mode==='car'){
  box(g,0,.1,0,.3,.13,.57,color);box(g,0,.2,-.035,.25,.13,.29,0xf5f8fb);box(g,0,.205,.119,.23,.085,.012,0x7297b2);box(g,0,.205,-.187,.23,.085,.012,0x7297b2);
  for(const x of [-.154,.154]){wheel(g,x,.055,-.19,.07);wheel(g,x,.055,.19,.07);}
  box(g,0,.11,.29,.2,.025,.006,0xe4d6b2);
 }else if(mode==='motorcycle'){
  wheel(g,0,.07,-.16,.075,.045);wheel(g,0,.07,.18,.075,.045);box(g,0,.13,0,.075,.08,.25,0x405775);box(g,0,.19,-.025,.11,.04,.18,0x1d2b3a);
  box(g,0,.25,-.135,.16,.15,.14,color);box(g,0,.335,-.135,.15,.012,.13,0xf6f6f2);
  cylinder(g,0,.265,.035,.043,.12,0x445f80,8);const helmet=new THREE.Mesh(new THREE.SphereGeometry(.052,10,8),mat(0xf9fcff));helmet.position.set(0,.37,.045);g.add(helmet);
  box(g,0,.25,.15,.2,.02,.025,0x647689);box(g,0,.16,.21,.05,.05,.02,0xfff4da);
 }else{
  const hull=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.48,4,12),mat(0xf8fbfc));hull.rotation.x=Math.PI/2;hull.scale.set(1,.7,1);hull.position.y=.08;g.add(hull);
  box(g,0,.16,-.03,.23,.16,.39,0xdce7f0);box(g,0,.25,-.03,.24,.02,.41,color);box(g,0,.19,.17,.19,.065,.012,0x7399b9);box(g,0,.34,-.15,.04,.16,.035,0x748493);
 }
 g.scale.setScalar(.95);return g;
}
export function disposeMapMaterials(){materials.forEach(m=>m.dispose());materials.clear();}
