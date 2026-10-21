import * as THREE from 'three';
import {createStudioCart} from './cart-model';
import {cartIntro,entryReveal,ENTRY_TRANSITION_MS,smooth,studioFraming} from './entry-motion';
import {createPhilippinesLand} from '../map/geography';
import {toWorld,type GeoLand} from '@/lib/nexacart/map-data';

type Options={paused:()=>boolean;hovered:()=>boolean;entering:()=>boolean;onReady:()=>void;onFailure:()=>void;onMapReady:()=>void};

export function mountCartScene(host:HTMLElement,options:Options){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.18;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFShadowMap;
 renderer.setClearColor(0xf2f3ed);
 renderer.domElement.setAttribute('aria-hidden','true');
 host.appendChild(renderer.domElement);

 const scene=new THREE.Scene();
 scene.background=new THREE.Color(0xf2f3ed);

 const camera=new THREE.OrthographicCamera(-18,18,9.9,-9.9,.1,150);
 const cart=createStudioCart();
 scene.add(cart.group);

 const hemisphere=new THREE.HemisphereLight(0xffffff,0xc3c9bb,2.6);
 scene.add(hemisphere);

 const sun=new THREE.DirectionalLight(0xffffff,3.4);
 sun.position.set(-3.8,7.5,5.2);
 sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);
 sun.shadow.camera.left=-6;
 sun.shadow.camera.right=6;
 sun.shadow.camera.top=6;
 sun.shadow.camera.bottom=-6;
 sun.shadow.camera.near=.1;
 sun.shadow.camera.far=40;
 sun.shadow.bias=-.0002;
 sun.shadow.normalBias=.025;
 sun.shadow.radius=5;
 scene.add(sun);

 const fill=new THREE.DirectionalLight(0xe5ebda,1.9);
 fill.position.set(5,3,-3);
 scene.add(fill);

 const edge=new THREE.DirectionalLight(0xffffff,1.4);
 edge.position.set(-2,2,-5);
 scene.add(edge);

 const floorMaterial=new THREE.MeshStandardMaterial({color:0xf2f3ed,roughness:.96,metalness:0});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(140,140),floorMaterial);
 floor.rotation.x=-Math.PI/2;
 floor.position.y=-.02;
 floor.receiveShadow=true;
 scene.add(floor);

 const studio=new THREE.Scene();
 studio.background=new THREE.Color(0xd5dacd);
 const cards:THREE.Mesh[]=[];
 for(const [w,h,x,y,z,power] of [[7,4,-3,5,4,3],[2,6,5,3,1,2],[6,2,0,6,-4,2.5],[.6,5,-5,1,-1,.5]]){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(0xffffff).multiplyScalar(power),side:THREE.DoubleSide}));
  m.position.set(x,y,z);
  m.lookAt(0,1,0);
  studio.add(m);
  cards.push(m);
 }
 const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.09,.1,50);
 scene.environment=environment.texture;
 scene.environmentIntensity=.82;
 cards.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose();});
 pmrem.dispose();

 let land:THREE.Group|null=null,disposed=false,contextLost=false,frame=0,last=0,elapsed=0,drawn=false,entryStart:number|null=null,width=1,height=1;
 const controller=new AbortController();
 fetch('/philippines-land.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Map unavailable');return r.json();}).then(data=>{if(disposed)return;land=createPhilippinesLand(data as GeoLand);land.visible=false;scene.add(land);options.onMapReady();}).catch(()=>{});

 const pointer=new THREE.Vector2(),softPointer=new THREE.Vector2();
 let hover=0;

 const startTarget=new THREE.Vector3(0,2.2,0),startPosition=new THREE.Vector3(5.1,3.6,9.3);
 const [mx,mz]=toWorld([122.2,12.55]);
 const endTarget=new THREE.Vector3(mx,0,mz),endPosition=new THREE.Vector3(mx,25,mz+19),aim=new THREE.Vector3();

 const move=(event:PointerEvent)=>{
  const rect=host.getBoundingClientRect();
  pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
 };
 const leave=()=>pointer.set(0,0);
 host.parentElement?.addEventListener('pointermove',move,{passive:true});
 host.parentElement?.addEventListener('pointerleave',leave);

 const resize=()=>{
  width=Math.max(1,host.clientWidth);
  height=Math.max(1,host.clientHeight);
  camera.left=-9.9*width/height;
  camera.right=9.9*width/height;
  camera.top=9.9;
  camera.bottom=-9.9;
  camera.updateProjectionMatrix();
  renderer.setSize(width,height,false);
 };
 const observer=new ResizeObserver(resize);
 observer.observe(host);
 resize();

 const lost=(e:Event)=>{e.preventDefault();contextLost=true;options.onFailure();};
 renderer.domElement.addEventListener('webglcontextlost',lost);

 function tick(now:number){
  if(disposed)return;
  frame=requestAnimationFrame(tick);
  const dt=Math.min(.05,(now-(last||now))/1000||.016);
  last=now;
  if(document.hidden||contextLost)return;

  const entering=options.entering(),paused=options.paused();
  if(entering&&entryStart==null)entryStart=now;
  if(paused&&drawn&&!entering)return;
  if(!paused)elapsed+=dt;

  softPointer.lerp(paused?new THREE.Vector2():pointer,1-Math.exp(-dt*5));
  hover=THREE.MathUtils.lerp(hover,options.hovered()?1:0,1-Math.exp(-dt*6));

  const intro=cartIntro(elapsed,paused);
  const progress=entryStart==null?0:Math.min(1,(now-entryStart)/ENTRY_TRANSITION_MS);
  const reveal=entryReveal(progress);

  // Organic idle suspension & breathing physics
  const settled=Math.min(1,Math.max(0,(elapsed-.5)/.5));
  const idleTime=elapsed*2.1;
  const idleY=(Math.sin(idleTime)*.022+Math.sin(idleTime*.5)*.007)*settled*(1-progress);
  const idlePitch=Math.sin(idleTime+.4)*.012*settled*(1-progress);
  const idleRoll=Math.cos(idleTime*.75)*.008*settled*(1-progress);
  const idleYaw=Math.sin(idleTime*.6)*.015*settled*(1-progress);
  const idleWheel=Math.sin(idleTime)*.045*settled*(1-progress);

  // Responsive button hover feedback: cart perks up and leans forward
  const hoverLift=hover*.035*(1-progress);
  const hoverPitch=-hover*.022*(1-progress);
  const hoverYaw=hover*.11*(1-progress);
  const hoverWheel=hover*.14*(1-progress);

  // Cart position: roll-in + organic suspension + hover lift + workspace exit trajectory
  cart.group.position.set(
   intro.x+reveal.cart*7.5,
   .965+idleY+hoverLift,
   -reveal.cart*1.8
  );

  // Cart rotation: parallax tilt + subtle suspension roll/pitch/yaw + button hover interaction
  cart.group.rotation.set(
   softPointer.y*.035*(1-progress)+idlePitch+hoverPitch,
   -.25+softPointer.x*.12*(1-progress)+idleYaw+hoverYaw+reveal.cart*.25,
   idleRoll-softPointer.x*.015*(1-progress)
  );

  // Parcel physics: drop impact + subtle suspension inertia
  cart.parcel.position.y=intro.parcelY+(idleY*.4);
  cart.parcel.scale.set(
   1+(1-intro.parcelSquash)*.4,
   intro.parcelSquash,
   1+(1-intro.parcelSquash)*.4
  );
  cart.parcel.rotation.y=.06+softPointer.x*.02+hover*.03;

  // Wheels: roll-in rotation + idle sway + hover response + swift exit spin
  cart.wheels.forEach(w=>{
   w.rotation.z=-intro.wheel-(reveal.cart*22)-idleWheel-hoverWheel;
  });

  cart.group.visible=progress<.94;

  const {zoom:initialZoom,targetY}=studioFraming(width,height);
  startTarget.y=targetY;
  camera.zoom=THREE.MathUtils.lerp(initialZoom,1,reveal.camera);
  camera.position.lerpVectors(startPosition,endPosition,reveal.camera);
  aim.lerpVectors(startTarget,endTarget,reveal.camera);
  camera.lookAt(aim);
  camera.updateProjectionMatrix();

  if(land){
   land.visible=progress>.1;
   land.scale.setScalar(reveal.landScale);
   land.position.copy(endTarget).multiplyScalar(1-reveal.landScale);
   land.position.y=0;
  }

  const color=new THREE.Color(0xf2f3ed).lerp(new THREE.Color(0xe9eef4),smooth(progress));
  scene.background=color;
  floorMaterial.color.set(0xf2f3ed).lerp(new THREE.Color(0xe3eaf3),smooth(progress));
  floor.position.y=THREE.MathUtils.lerp(-.02,-.055,progress);

  sun.position.lerpVectors(new THREE.Vector3(-3.8,7.5,5.2),new THREE.Vector3(-9,22,-8),reveal.camera);
  sun.intensity=THREE.MathUtils.lerp(3.4,3.2,progress);
  fill.intensity=THREE.MathUtils.lerp(1.9,.7,progress);
  edge.intensity=1.4*(1-progress);
  hemisphere.intensity=2.6-.1*progress;

  try{
   renderer.render(scene,camera);
   if(!drawn){drawn=true;options.onReady();}
  }catch{
   contextLost=true;
   options.onFailure();
  }
 }

 frame=requestAnimationFrame(tick);
 return()=>{
  disposed=true;
  controller.abort();
  cancelAnimationFrame(frame);
  observer.disconnect();
  host.parentElement?.removeEventListener('pointermove',move);
  host.parentElement?.removeEventListener('pointerleave',leave);
  renderer.domElement.removeEventListener('webglcontextlost',lost);
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
  scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});
  geometries.forEach(g=>g.dispose());
  materials.forEach(m=>m.dispose());
  environment.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
 };
}
