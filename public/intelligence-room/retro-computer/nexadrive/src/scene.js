import * as THREE from 'three';
import {makeShip} from './ship.js';
import {atOffset,rng,TAU} from './core.js';

const planetCache = new Map();
function planetTexture(seed,color){
 const key = seed + '_' + color;
 if(planetCache.has(key)) {
   const cached = planetCache.get(key);
   cached.needsUpdate = true;
   return cached;
 }
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;const ctx=canvas.getContext('2d'),rand=rng(seed);ctx.fillStyle=color;ctx.fillRect(0,0,768,384);
 for(let i=0;i<18000;i++){const x=rand()*768,y=rand()*384,r=rand()*8+.5;ctx.fillStyle=i%3?`rgba(20,18,22,${rand()*.13})`:`rgba(235,207,177,${rand()*.15})`;ctx.beginPath();ctx.ellipse(x,y,r,r*.5,0,0,TAU);ctx.fill();}
 for(let i=0;i<170;i++){const x=rand()*768,y=rand()*384,r=2+rand()*17;const g=ctx.createRadialGradient(x-r*.2,y-r*.25,r*.05,x,y,r);g.addColorStop(0,'#100e1424');g.addColorStop(.7,'#08071040');g.addColorStop(.84,'#f7e5ca2a');g.addColorStop(1,'#f7e5ca00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
 planetCache.set(key, t);
 return t;
}
export class SpaceScene{
 constructor(canvas){
  this.canvas=canvas;this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(58,1,.5,13000);this.renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,powerPreference:'high-performance'});this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  this.scene.add(new THREE.HemisphereLight(0xabcbdc,0x182635,2.2));const key=new THREE.DirectionalLight(0xffe6cc,3.7);key.position.set(-200,450,500);this.scene.add(key);const rim=new THREE.DirectionalLight(0x7499cc,2.7);rim.position.set(100,100,-300);this.scene.add(rim);this.ship=makeShip();this.shipRoot=new THREE.Group();this.shipRoot.add(this.ship);this.scene.add(this.shipRoot);this.shipBasis=new THREE.Matrix4();this.q=new THREE.Quaternion();this.tmp=new THREE.Vector3();this.target=new THREE.Vector3();this.shipPos=new THREE.Vector3();this.cameraPos=new THREE.Vector3();this.f=new THREE.Vector3();this.up=new THREE.Vector3();this.right=new THREE.Vector3();this.tmpStreakA=new THREE.Vector3();this.tmpStreakB=new THREE.Vector3();this.dynamic=new THREE.Group();this.scene.add(this.dynamic);this.gates=[];this.rocks=[];this.trails=[];this.time=0;this.resetCamera=true;this.pixelRatio=1;this.quality='auto';
  const random=rng(112),stars=new Float32Array(1900*3),colors=new Float32Array(1900*3);for(let i=0;i<1900;i++){const a=random()*TAU,z=random()*2-1,r=Math.sqrt(1-z*z),radius=5200+random()*1800;stars.set([Math.cos(a)*r*radius,z*radius,Math.sin(a)*r*radius],i*3);const c=new THREE.Color().setHSL(.54+random()*.12,.12+random()*.2,.48+random()*.45);colors.set([c.r,c.g,c.b],i*3);}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(stars,3));sg.setAttribute('color',new THREE.BufferAttribute(colors,3));this.stars=new THREE.Points(sg,new THREE.PointsMaterial({vertexColors:true,size:3.2,sizeAttenuation:true,transparent:true,opacity:.86,depthWrite:false}));this.scene.add(this.stars);
  const lineGeom=new THREE.BufferGeometry();lineGeom.setAttribute('position',new THREE.BufferAttribute(new Float32Array(70*6),3));this.streaks=new THREE.LineSegments(lineGeom,new THREE.LineBasicMaterial({color:0xc7eaf1,transparent:true,opacity:0,depthWrite:false}));this.scene.add(this.streaks);this.streakData=Array.from({length:70},()=>({x:(random()-.5)*250,y:(random()-.5)*155,d:random()*600}));
 }
 clearCourse(){while(this.dynamic.children.length){const node=this.dynamic.children[0];node.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material])){if(m.map&&!Array.from(planetCache.values()).includes(m.map))m.map.dispose();m.dispose();}});this.dynamic.remove(node);}this.gates=[];this.rocks=[];}
 setCourse(course){
  this.clearCourse();this.course=course;this.scene.background=new THREE.Color(course.sky);this.scene.fog=new THREE.FogExp2(course.haze,.00018);const accent=new THREE.Color(course.accent);const ringGeometry=new THREE.TorusGeometry(31,1.1,6,64),ringLightGeometry=new THREE.TorusGeometry(29.7,.16,4,64);
  for(const gate of course.gateList){const frame=course.sample(gate.distance),group=new THREE.Group();group.position.fromArray(atOffset(frame,gate.x,gate.y));group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...frame.forward));const material=new THREE.MeshStandardMaterial({color:0x3a535c,metalness:.75,roughness:.25});const glowMaterial=new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.86});group.add(new THREE.Mesh(ringGeometry,material),new THREE.Mesh(ringLightGeometry,glowMaterial));for(let j=0;j<4;j++){const box=new THREE.Mesh(new THREE.BoxGeometry(3.8,5,1.8),new THREE.MeshStandardMaterial({color:0x819590,metalness:.7,roughness:.3}));const a=j*Math.PI/2;box.position.set(Math.cos(a)*31.8,Math.sin(a)*31.8,0);box.rotation.z=a;group.add(box);}this.dynamic.add(group);this.gates.push({group,material,glowMaterial,gate});}
  const routes=[[],[]];for(let i=0;i<=640;i++){const frame=course.sample(course.length*i/640);for(let side=0;side<2;side++)routes[side].push(new THREE.Vector3(...atOffset(frame,side?-52:52,-27)));}
  for(const points of routes){const geometry=new THREE.BufferGeometry().setFromPoints(points);this.dynamic.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:.27})));}
  const rockGeometry=new THREE.IcosahedronGeometry(1,1);for(const rock of course.rocks){const random=rng(rock.seed),g=rockGeometry.clone(),attr=g.getAttribute('position');for(let i=0;i<attr.count;i++){const factor=.8+random()*.35;attr.setXYZ(i,attr.getX(i)*factor,attr.getY(i)*factor,attr.getZ(i)*factor);}g.computeVertexNormals();const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:course.id==='ember'?0x6e4c43:0x485a62,metalness:.13,roughness:.95,flatShading:true}));const frame=course.sample(rock.distance);mesh.position.fromArray(atOffset(frame,rock.x,rock.y));mesh.scale.setScalar(rock.radius);mesh.rotation.set(rock.spin,rock.spin*.7,0);this.dynamic.add(mesh);this.rocks.push(mesh);}
  const random=rng(course.seed+100),debrisCount=course.id==='aster'?290:190,outer=new THREE.InstancedMesh(rockGeometry,new THREE.MeshStandardMaterial({color:course.id==='ember'?0x674940:0x3d4e5d,roughness:.95,flatShading:true}),debrisCount),dummy=new THREE.Object3D();for(let i=0;i<debrisCount;i++){const frame=course.sample(random()*course.length),sign=random()<.5?-1:1;dummy.position.fromArray(atOffset(frame,sign*(110+random()*500),(random()-.5)*750));dummy.rotation.set(random()*TAU,random()*TAU,random()*TAU);dummy.scale.setScalar(3+random()*19);dummy.updateMatrix();outer.setMatrixAt(i,dummy.matrix);}this.dynamic.add(outer);
  const pframe=course.sample(0);this.planet=new THREE.Mesh(new THREE.SphereGeometry(1,64,40),new THREE.MeshStandardMaterial({map:planetTexture(course.seed,course.planet),roughness:.93,metalness:.04}));this.planet.position.fromArray(atOffset(pframe,course.id==='ember'?800:1000,course.id==='ember'?550:780));this.planet.position.addScaledVector(new THREE.Vector3(...pframe.forward),1800);this.planet.scale.setScalar(course.id==='halo'?950:1100);this.dynamic.add(this.planet);
  if(course.id==='halo'){const g=new THREE.RingGeometry(1250,1820,160),m=new THREE.MeshStandardMaterial({color:0xbdb6a4,transparent:true,opacity:.42,side:THREE.DoubleSide,roughness:1,depthWrite:false});const ring=new THREE.Mesh(g,m);ring.position.copy(this.planet.position);ring.rotation.set(1.12,0,.35);this.dynamic.add(ring);const line=new THREE.Mesh(new THREE.RingGeometry(1460,1480,160),new THREE.MeshBasicMaterial({color:0xe9d8c2,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}));line.position.copy(ring.position);line.rotation.copy(ring.rotation);this.dynamic.add(line);}
  // Two large orbital arcs form architectural landmarks, not a copied track.
  const frame=course.sample(course.length*.38);for(let i=0;i<2;i++){const arch=new THREE.Mesh(new THREE.TorusGeometry(180+i*25,2.5,6,96,Math.PI*1.65),new THREE.MeshStandardMaterial({color:0x667c88,metalness:.8,roughness:.35}));arch.position.fromArray(frame.p);arch.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...frame.forward));arch.rotation.z+=i*.4;this.dynamic.add(arch);}
  // Warm up shaders, materials, and GPU buffers upfront to eliminate first-play lag
  try{
   this.camera.position.set(0,19,-70);
   this.camera.lookAt(0,4,110);
   this.camera.updateMatrixWorld();
   this.renderer.compile(this.scene,this.camera);
   this.renderer.render(this.scene,this.camera);
  }catch(_){}
  this.resetCamera=true;
 }
 resize(w,h,quality='auto',ratio){this.width=w;this.height=h;this.quality=quality;this.pixelRatio=ratio??Math.min(devicePixelRatio||1,quality==='low'?1:quality==='high'?1.5:1.25);this.renderer.setPixelRatio(this.pixelRatio);this.renderer.setSize(w,h,false);this.camera.aspect=w/(h||1);this.camera.updateProjectionMatrix();}
 render(state,dt,menu,pointer,reduced){
  this.time+=dt;const course=state.course,frame=course.sample(menu?0:state.distance),pos=atOffset(frame,menu?0:state.x,menu?0:state.y);this.f.fromArray(frame.forward);this.up.fromArray(frame.up);this.right.fromArray(frame.right);const f=this.f,up=this.up,right=this.right;this.shipPos.fromArray(pos);
  this.shipRoot.position.copy(this.shipPos);this.shipBasis.makeBasis(right,up,f.clone().negate());this.q.setFromRotationMatrix(this.shipBasis);this.shipRoot.quaternion.slerp(this.q,menu?1:1-Math.exp(-dt*12));this.ship.rotation.z=menu?Math.sin(this.time*.55)*.055:-state.vx*.006;this.ship.rotation.x=menu?Math.sin(this.time*.6)*.035:state.vy*.0025;
  if(menu)this.ship.position.y=Math.sin(this.time*1.1)*.5;else this.ship.position.y=0;
  const small=this.width<650;
  if(menu){this.cameraPos.copy(this.shipPos).addScaledVector(f,small?-90:-55).addScaledVector(up,small?29:22).addScaledVector(right,small?-35:-33);this.cameraPos.addScaledVector(right,pointer.x*6);this.cameraPos.addScaledVector(up,pointer.y*3);this.target.copy(this.shipPos).addScaledVector(right,small?0:-15).addScaledVector(up,small?12:1);}
  else{this.cameraPos.copy(this.shipPos).addScaledVector(f,-(state.boosting?76:66)).addScaledVector(up,19).addScaledVector(right,-state.vx*.05);this.target.copy(this.shipPos).addScaledVector(f,110).addScaledVector(up,4);}
  if(this.resetCamera){this.camera.position.copy(this.cameraPos);this.look=this.target.clone();this.resetCamera=false;}else{this.camera.position.lerp(this.cameraPos,1-Math.exp(-dt*(menu?3:7)));this.look.lerp(this.target,1-Math.exp(-dt*10));}
  if(state.hit&&!reduced){this.camera.position.addScaledVector(right,Math.sin(this.time*100)*state.hit*.5);this.camera.position.addScaledVector(up,Math.cos(this.time*83)*state.hit*.4);}
  this.camera.up.copy(up);this.camera.lookAt(this.look);const fov=menu?50:state.boosting&&!reduced?67:58;if(Math.abs(this.camera.fov-fov)>.01){this.camera.fov=THREE.MathUtils.damp(this.camera.fov,fov,4,dt);this.camera.updateProjectionMatrix();}
  for(const item of this.gates){const passed=!menu&&item.gate.index<state.nextGate,next=item.gate.index===state.nextGate;item.group.visible=menu||!passed||item.gate.distance>state.distance-180;item.glowMaterial.opacity=passed?.16:next?1:.6;item.material.color.set(passed?0x23363b:next?0x91b1b2:0x3a535c);}
  for(let i=0;i<this.ship.userData.flames.length;i++){const flame=this.ship.userData.flames[i];flame.scale.y=(menu?.45:state.boosting?2:1)*(1+Math.sin(this.time*35+i)*.08);flame.material.opacity=menu?.4:state.boosting?.9:.6;}
  const attr=this.streaks.geometry.getAttribute('position');this.streaks.material.opacity=menu||reduced?0:state.boosting?.42:.09;for(let i=0;i<this.streakData.length;i++){const s=this.streakData[i];s.d=(s.d-dt*state.speed*1.5+600)%600;this.tmpStreakA.copy(this.shipPos).addScaledVector(f,s.d-50).addScaledVector(right,s.x).addScaledVector(up,s.y);this.tmpStreakB.copy(this.tmpStreakA).addScaledVector(f,state.boosting?24:7);attr.setXYZ(i*2,this.tmpStreakA.x,this.tmpStreakA.y,this.tmpStreakA.z);attr.setXYZ(i*2+1,this.tmpStreakB.x,this.tmpStreakB.y,this.tmpStreakB.z);}attr.needsUpdate=true;
  this.renderer.render(this.scene,this.camera);
 }
 dispose(){this.clearCourse();this.renderer.dispose();}
}
