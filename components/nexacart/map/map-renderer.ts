import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {PLACES,JOURNEYS,REGIONS,toWorld,placePoint,getPlace,loadingPoint,PLACE_SIZE,type MapState,type GeoLand,type Journey} from '@/lib/nexacart/map-data';
import {routePoints,playbackFrame,playbackPose,arrangeLabels,type Rect} from '@/lib/nexacart/map-playback';
import {placeModel,vehicleModel,parcel,disposeMapMaterials} from './map-models';
import {createPhilippinesLand,LAND_TOP} from './geography';
export type Projected={id:string;x:number;y:number;visible:boolean};
type Options={getState:()=>MapState;onReady:()=>void;onFailure:()=>void;onPlace:(id:string)=>void;onVehicle:(id:string)=>void;onStopJump?:(stageIndex:number)=>void;onManual:()=>void;onProject:(p:Projected[])=>void;labelSize:(id:string)=>{width:number;height:number};overlays:()=>Rect[]};
type RouteObject={journey:Journey;first:THREE.Curve<THREE.Vector3>;last:THREE.Curve<THREE.Vector3>;firstVehicle:THREE.Group;lastVehicle:THREE.Group;lines:THREE.Line[];trails:THREE.Mesh<THREE.BufferGeometry,THREE.ShaderMaterial>[];parcel:THREE.Group};
export function routeCurve(j:Journey,leg:'first'|'last'){
 const mode=leg==='first'?j.firstMode:j.lastMode,y=mode==='ferry'?.07:LAND_TOP+.055;
 const points=routePoints(j,leg).map(([x,z])=>new THREE.Vector3(x,y,z)),path=new THREE.CurvePath<THREE.Vector3>();
 let previous=points[0];
 for(let i=1;i<points.length-1;i++){
  const corner=points[i],radius=Math.min(.14,corner.distanceTo(points[i-1])*.2,corner.distanceTo(points[i+1])*.2);
  const before=corner.clone().lerp(points[i-1],radius/corner.distanceTo(points[i-1])),after=corner.clone().lerp(points[i+1],radius/corner.distanceTo(points[i+1]));
  if(previous.distanceTo(before)>1e-6)path.add(new THREE.LineCurve3(previous,before));
  path.add(new THREE.QuadraticBezierCurve3(before,corner,after));previous=after;
 }
 path.add(new THREE.LineCurve3(previous,points[points.length-1]));path.arcLengthDivisions=600;return path;
}
function routeRibbon(curve:THREE.Curve<THREE.Vector3>,color:string){
 const positions:number[]=[],progress:number[]=[],indices:number[]=[],samples=320;
 for(let i=0;i<=samples;i++){const t=i/samples,p=curve.getPointAt(t),d=curve.getTangentAt(t),n=new THREE.Vector3(d.z,0,-d.x).normalize().multiplyScalar(.024);positions.push(p.x+n.x,p.y+.012,p.z+n.z,p.x-n.x,p.y+.012,p.z-n.z);progress.push(t,t);if(i<samples){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('routeT',new THREE.Float32BufferAttribute(progress,1));geometry.setIndex(indices);
 const material=new THREE.ShaderMaterial({uniforms:{progress:{value:0},color:{value:new THREE.Color(color)}},vertexShader:'attribute float routeT; varying float vRoute; void main(){vRoute=routeT;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform float progress; uniform vec3 color; varying float vRoute; void main(){if(vRoute>progress)discard;gl_FragColor=vec4(color,1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',side:THREE.DoubleSide,depthTest:false,depthWrite:false});
 const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=4;return mesh;
}
const cameraKey=(s:MapState)=>[s.region,s.selectedPlace,s.focusRequest,s.topDown,s.journeyFocus,s.journeyId,s.follow].join('|');
export function mountPhilippinesMap(host:HTMLElement,land:GeoLand,options:Options){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setClearColor(0xe6f0f8);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xe6f0f8);scene.fog=new THREE.Fog(0xe6f0f8,52,95);
 const camera=new THREE.OrthographicCamera(-18,18,9.9,-9.9,.1,150);camera.position.set(0,25,19);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.screenSpacePanning=true;controls.minZoom=.55;controls.maxZoom=11;controls.minPolarAngle=.06;controls.maxPolarAngle=Math.PI*.43;controls.maxTargetRadius=35;
 controls.target.set(0,0,-.7);controls.update();
 scene.add(new THREE.HemisphereLight(0xffffff,0xc2d9ec,2.7));
 const sun=new THREE.DirectionalLight(0xfffaea,3.4);sun.position.set(-9,22,-8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;sun.shadow.camera.top=21;sun.shadow.camera.bottom=-21;sun.shadow.camera.far=65;sun.shadow.bias=-.0008;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun);
 const fill=new THREE.DirectionalLight(0xcde2f8,.75);fill.position.set(10,9,12);scene.add(fill);
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(130,130),new THREE.MeshStandardMaterial({color:0xd8e8f5,roughness:.92,metalness:.02}));sea.rotation.x=-Math.PI/2;sea.position.y=-.055;sea.receiveShadow=true;scene.add(sea);
 const grid=new THREE.GridHelper(100,100,0xb0c7dc,0xb0c7dc);grid.position.y=-.045;const gridMat=grid.material as THREE.Material;gridMat.transparent=true;gridMat.opacity=.10;gridMat.depthWrite=false;scene.add(grid);
 scene.add(createPhilippinesLand(land));
 const pickables:THREE.Object3D[]=[];const modelMap=new Map<string,THREE.Group>();
 for(const place of PLACES){
  const group=new THREE.Group(),miniature=placeModel(place.kind,place.name,place.sellerIds?.length||1);group.add(miniature);const [x,z]=placePoint(place);group.position.set(x,LAND_TOP+.025,z);group.userData.placeId=place.id;group.userData.baseY=LAND_TOP+.025;const [w,d]=PLACE_SIZE[place.kind];const plinthMat=new THREE.MeshStandardMaterial({color:0xd2dde6,roughness:1});const plinth=new THREE.Mesh(new THREE.BoxGeometry(w+.05,LAND_TOP+.08,d+.05),plinthMat);plinth.position.y=-(LAND_TOP+.08)/2;plinth.receiveShadow=true;group.add(plinth);group.userData.plinthMat=plinthMat;
  group.traverse(o=>{if(o instanceof THREE.Mesh)pickables.push(o);});scene.add(group);modelMap.set(place.id,group);
  // A faint anchor dot marks the city position independently of the schematic model offset.
  const [gx,gz]=toWorld(place.geo);const anchor=new THREE.Mesh(new THREE.CircleGeometry(.033,16),new THREE.MeshBasicMaterial({color:place.kind==='hq'?0xef7955:0x9baec2}));anchor.rotation.x=-Math.PI/2;anchor.position.set(gx-x,.008,gz-z);group.add(anchor);if(Math.hypot(gx-x,gz-z)>.12){const tether=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(gx-x,.006,gz-z),new THREE.Vector3(0,.006,0)]),new THREE.LineDashedMaterial({color:0xacbdcd,transparent:true,opacity:.42,dashSize:.06,gapSize:.05,depthWrite:false}));tether.computeLineDistances();group.add(tether);}
 }
 const selectedRing=new THREE.Mesh(new THREE.RingGeometry(.57,.60,56),new THREE.MeshBasicMaterial({color:0xf47a54,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));selectedRing.rotation.x=-Math.PI/2;selectedRing.position.y=LAND_TOP+.03;scene.add(selectedRing);
 const routes:RouteObject[]=JOURNEYS.map(j=>{
  const first=routeCurve(j,'first'),last=routeCurve(j,'last');const lines:THREE.Line[]=[],trails:THREE.Mesh<THREE.BufferGeometry,THREE.ShaderMaterial>[]=[];
  [first,last].forEach(curve=>{
   const points=curve.getPoints(180);
   const lineMat=new THREE.LineDashedMaterial({color:0xaab9cb,dashSize:.12,gapSize:.08,transparent:true,opacity:.4,depthTest:false});
   lineMat.onBeforeCompile=(shader)=>{shader.uniforms.dashOffset={value:0};shader.fragmentShader='uniform float dashOffset;\n'+shader.fragmentShader.replace('mod( vLineDistance, totalSize )','mod( vLineDistance - dashOffset, totalSize )');lineMat.userData.shader=shader;};
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),lineMat);line.computeLineDistances();line.renderOrder=3;scene.add(line);lines.push(line);
   const trail=routeRibbon(curve,j.color);scene.add(trail);trails.push(trail);
  });
  const firstVehicle=vehicleModel(j.firstMode,new THREE.Color(j.color).getHex()),lastVehicle=vehicleModel(j.lastMode,new THREE.Color(j.color).getHex());
  for(const v of [firstVehicle,lastVehicle]){v.userData.journeyId=j.id;v.traverse(o=>{if(o instanceof THREE.Mesh)pickables.push(o);});scene.add(v);}
  const pack=parcel();pack.position.set(0,0,0);scene.add(pack);
  return {journey:j,first,last,firstVehicle,lastVehicle,lines,trails,parcel:pack};
 });
 const focusRing=new THREE.Mesh(new THREE.RingGeometry(.48,.51,64),new THREE.MeshBasicMaterial({color:0xed7957,side:THREE.DoubleSide,transparent:true,opacity:.55,depthWrite:false}));focusRing.rotation.x=-Math.PI/2;scene.add(focusRing);
 const stopRings=[0,1,2].map(i=>{const ring=new THREE.Mesh(new THREE.RingGeometry(.12,.28,48),new THREE.MeshBasicMaterial({color:0x9caebd,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.userData.stopStage=i;pickables.push(ring);scene.add(ring);return ring;});
 const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();let down:{x:number;y:number}|null=null;
 let width=1,height=1,frame=0,lastFrame=0,disposed=false,ready=false,lost=false;
 let lastKey='',lastZoom=0,flying=true,zooming=false,targetZoom=1;
 const poseTarget=new THREE.Vector3(0,0,-.7),posePosition=new THREE.Vector3(0,25,18.3);
 const resize=()=>{if(!host.clientWidth||!host.clientHeight)return;width=Math.max(1,host.clientWidth);height=Math.max(1,host.clientHeight);const aspect=width/height;camera.left=-9.9*aspect;camera.right=9.9*aspect;camera.top=9.9;camera.bottom=-9.9;camera.updateProjectionMatrix();renderer.setSize(width,height,false);};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const manual=()=>{flying=false;zooming=false;lastKey=cameraKey({...options.getState(),follow:false});options.onManual();};controls.addEventListener('start',manual);
 const pointerDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY};};
 const hits=(e:PointerEvent)=>{const rect=host.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);raycaster.setFromCamera(mouse,camera);return raycaster.intersectObjects(pickables,false);};
 const hitMeta=(object:THREE.Object3D)=>{let current:THREE.Object3D|null=object;while(current){if(!current.visible)return null;if(current.userData.stopStage!==undefined)return current.userData;if(current.userData.placeId||current.userData.journeyId){const data=current.userData;let parent=current.parent;while(parent){if(!parent.visible)return null;parent=parent.parent;}return data;}current=current.parent;}return null;};
 const pointerUp=(e:PointerEvent)=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down=null;return;}down=null;const hit=hits(e).find(h=>hitMeta(h.object));if(!hit)return;const meta=hitMeta(hit.object);if(meta?.stopStage!==undefined)options.onStopJump?.(meta.stopStage as number);else if(meta?.placeId)options.onPlace(meta.placeId);else if(meta?.journeyId)options.onVehicle(meta.journeyId);};
 let hoveredPlaceId:string|null=null;
 const pointerMove=(e:PointerEvent)=>{if(down)return;const hit=hits(e).find(h=>hitMeta(h.object));const meta=hit?hitMeta(hit.object):null;renderer.domElement.style.cursor=meta?'pointer':'grab';hoveredPlaceId=meta?.placeId||null;};
 const pointerLeave=()=>{hoveredPlaceId=null;};
 const doubleClick=(e:MouseEvent)=>{const hit=hits(e as unknown as PointerEvent).find(h=>hitMeta(h.object));if(!hit)return;const meta=hitMeta(hit.object);if(meta?.placeId){options.onPlace(meta.placeId);targetZoom=Math.min(11,Math.max(camera.zoom*1.45,5.2));zooming=true;}else if(meta?.journeyId){options.onVehicle(meta.journeyId);targetZoom=Math.min(11,Math.max(camera.zoom*1.35,4.6));zooming=true;}};
 renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointermove',pointerMove,{passive:true});renderer.domElement.addEventListener('pointerleave',pointerLeave);renderer.domElement.addEventListener('dblclick',doubleClick);
 const contextLost=(e:Event)=>{e.preventDefault();lost=true;options.onFailure();};renderer.domElement.addEventListener('webglcontextlost',contextLost);
 const vehiclePosition=(vehicle:THREE.Group,curve:THREE.Curve<THREE.Vector3>,progress:number,dt:number,snap:boolean)=>{vehicle.position.copy(curve.getPointAt(progress));const tangent=curve.getTangentAt(Math.min(.9999,Math.max(.0001,progress)));const angle=Math.atan2(tangent.x,tangent.z),delta=Math.atan2(Math.sin(angle-vehicle.rotation.y),Math.cos(angle-vehicle.rotation.y));vehicle.rotation.y=snap?angle:vehicle.rotation.y+delta*(1-Math.exp(-dt*12));};
 let previousTime=0,previousJourney="";
 const currentPosition=new THREE.Vector3();
 function tick(now:number){
  if(disposed)return;frame=requestAnimationFrame(tick);const dt=Math.min(.06,(now-lastFrame)/1000||.033);lastFrame=now;if(document.hidden||lost)return;
  const s=options.getState();if(s.active===false)return;const flow=playbackPose(s.time),chosen=routes.find(r=>r.journey.id===s.journeyId)!,snap=previousJourney!==s.journeyId||Math.abs(s.time-previousTime)>.5;previousTime=s.time;previousJourney=s.journeyId;
  for(const [id,group] of modelMap){
   group.visible=!s.journeyFocus||[chosen.journey.source,chosen.journey.hub,chosen.journey.destination].includes(id)||id===s.selectedPlace;
   const isHovered=id===hoveredPlaceId,isSelected=id===s.selectedPlace;
   const baseY=(group.userData.baseY as number)||LAND_TOP+.025;
   const targetY=baseY+(isHovered?.055:0);
   group.position.y+=(targetY-group.position.y)*Math.min(1,dt*14);
   const plinthMat=group.userData.plinthMat as THREE.MeshStandardMaterial|undefined;
   if(plinthMat){const targetColor=isSelected?0xd8e6f3:isHovered?0xdde7f0:0xd2dde6;plinthMat.color.lerp(new THREE.Color(targetColor),Math.min(1,dt*10));}
  }
  for(const r of routes){
   const active=r===chosen;
   vehiclePosition(r.firstVehicle,r.first,active?flow.firstTravel:0,dt,snap);vehiclePosition(r.lastVehicle,r.last,active?flow.lastTravel:0,dt,snap);
   r.firstVehicle.visible=active&&flow.vehicle==='first';r.lastVehicle.visible=active&&flow.vehicle==='last';
   r.firstVehicle.scale.setScalar(1);r.lastVehicle.scale.setScalar(1);
   r.lines.forEach(line=>{
    line.visible=s.routes&&(active||!s.journeyFocus);
    const material=line.material as THREE.LineDashedMaterial;
    material.color.set(active?0xa3b1bd:0xb5c2cf);
    material.opacity=active?.65:.14;
    if(!reducedMotion&&material.userData.shader?.uniforms?.dashOffset){
     const flowRate=active?.38:.12;
     material.userData.shader.uniforms.dashOffset.value=(material.userData.shader.uniforms.dashOffset.value+dt*flowRate)%.20;
    }
   });
   r.trails.forEach((trail,i)=>{trail.visible=active&&s.routes;trail.material.uniforms.progress.value=i===0?flow.firstTravel:flow.lastTravel;});
   const location=flow.stageIndex<2?getPlace(r.journey.source):flow.stageIndex===2?getPlace(r.journey.hub):getPlace(r.journey.destination),dock=loadingPoint(location),door=placePoint(location);
   r.parcel.position.set(THREE.MathUtils.lerp(dock[0],door[0]+.18,flow.delivered?flow.handoff:0),LAND_TOP+.04,THREE.MathUtils.lerp(dock[1],door[1]+.34,flow.delivered?flow.handoff:0));
   r.parcel.visible=active&&(flow.stageIndex===2||flow.delivered);
  }
  if(flow.vehicle==='first')currentPosition.copy(chosen.firstVehicle.position);else if(flow.vehicle==='last')currentPosition.copy(chosen.lastVehicle.position);else currentPosition.copy(chosen.parcel.position);
  focusRing.visible=!!s.journeyFocus;focusRing.position.set(currentPosition.x,currentPosition.y+.015,currentPosition.z);focusRing.scale.setScalar(flow.vehicle?1:.65);(focusRing.material as THREE.MeshBasicMaterial).color.set(flow.delivered?0x7eaa91:chosen.journey.color);(focusRing.material as THREE.MeshBasicMaterial).opacity=reducedMotion?.55:.44+Math.sin(now*.003)*.1;
  [chosen.journey.source,chosen.journey.hub,chosen.journey.destination].forEach((id,i)=>{const p=loadingPoint(getPlace(id)),complete=i===0?flow.stageIndex>=1:i===1?flow.stageIndex>=3:flow.delivered;stopRings[i].position.set(p[0],LAND_TOP+.04,p[1]);stopRings[i].visible=!!s.journeyFocus;(stopRings[i].material as THREE.MeshBasicMaterial).color.set(complete?0x7fa591:0xb8c3ce);});

  if(s.selectedPlace){const p=placePoint(getPlace(s.selectedPlace));selectedRing.position.set(p[0],LAND_TOP+.036,p[1]);selectedRing.visible=true;selectedRing.scale.setScalar(1+(reducedMotion?0:Math.sin(now*.0018)*.025));}else selectedRing.visible=false;
  const focusKey=cameraKey(s);
  if(focusKey!==lastKey){
   lastKey=focusKey;const region=REGIONS.find(r=>r.id===s.region)||REGIONS[0];const routeFrame=s.journeyFocus?playbackFrame(chosen.journey):null;const [x,z]=s.selectedPlace&&s.focusRequest>0?placePoint(getPlace(s.selectedPlace)):routeFrame?.center||toWorld(region.center);
   poseTarget.set(x,0,z);posePosition.copy(poseTarget).add(s.topDown?new THREE.Vector3(0,30,.01):new THREE.Vector3(0,25,19));
   const h=s.selectedPlace&&s.focusRequest>0?3.65:routeFrame?.height||region.height;const safeWidth=width>1040?Math.max(300,width-650):width>760?width-320:width-80;targetZoom=Math.min(19.8/h,19.8*(safeWidth/height)/h)*(width<700?.88:1);flying=true;zooming=true;
  }
  if(s.zoomRequest!==lastZoom){const delta=s.zoomRequest-lastZoom;lastZoom=s.zoomRequest;targetZoom=Math.max(.55,Math.min(11,(flying?targetZoom:camera.zoom)*Math.pow(1.25,delta)));zooming=true;}
  if(s.follow){
   poseTarget.copy(currentPosition);posePosition.copy(poseTarget).add(s.topDown?new THREE.Vector3(0,30,.01):new THREE.Vector3(0,25,19));targetZoom=width>1040?4.6:width>760?3.9:3.5;flying=true;zooming=true;
  }
  const alpha=reducedMotion?1:1-Math.exp(-dt*(s.follow?3.8:4.7));
  if(flying){controls.target.lerp(poseTarget,alpha);camera.position.lerp(posePosition,alpha);if(!s.follow&&controls.target.distanceTo(poseTarget)<.005&&camera.position.distanceTo(posePosition)<.01)flying=false;}
  if(zooming){camera.zoom=THREE.MathUtils.lerp(camera.zoom,targetZoom,alpha);if(Math.abs(camera.zoom-targetZoom)<.001)zooming=false;camera.updateProjectionMatrix();}
  controls.update();
  const candidates=PLACES.map(place=>{const p=placePoint(place),v=new THREE.Vector3(p[0],LAND_TOP+(place.kind==='hq'?1.08:.70),p[1]).project(camera),related=[chosen.journey.source,chosen.journey.hub,chosen.journey.destination].includes(place.id);return {id:place.id,x:(v.x+1)*width/2,y:(1-v.y)*height/2,...options.labelSize(place.id),visible:s.labels&&(!s.journeyFocus||related||place.id===s.selectedPlace)&&v.z>-1&&v.z<1&&v.x>-.95&&v.x<.95&&v.y>-.85&&v.y<.91,priority:place.id===s.selectedPlace?110:related?100:place.kind==='hq'?25:place.kind==='shop'?20:5};});
  const projected=arrangeLabels(candidates,width,height,options.overlays());
  options.onProject(projected);
  try{renderer.render(scene,camera);if(!ready){ready=true;options.onReady();}}catch{lost=true;options.onFailure();}
 }
 frame=requestAnimationFrame(tick);
 return()=>{
  disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.removeEventListener('start',manual);controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerleave',pointerLeave);renderer.domElement.removeEventListener('dblclick',doubleClick);renderer.domElement.removeEventListener('webglcontextlost',contextLost);
  const geometries=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
  scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{mats.add(m);const tex=(m as THREE.MeshBasicMaterial).map;if(tex)textures.add(tex);});}});
  geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());disposeMapMaterials();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
 };
}
