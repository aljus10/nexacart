import * as THREE from 'three';

// Kestrel NX-01: original mesh geometry, authored specifically for NexaDrive.
function loft(stations,segments=12){
 const vertices=[],indices=[];
 for(const [z,rx,ry,cy=0]of stations)for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2;vertices.push(Math.cos(a)*rx,cy+Math.sin(a)*ry,z);}
 for(let i=0;i<stations.length-1;i++)for(let j=0;j<segments;j++){const a=i*segments+j,b=i*segments+(j+1)%segments,c=a+segments,d=b+segments;indices.push(a,b,c,b,d,c);}
 for(const i of[0,stations.length-1]){const index=vertices.length/3;vertices.push(0,stations[i][3]||0,stations[i][0]);for(let j=0;j<segments;j++){const a=i*segments+j,b=i*segments+(j+1)%segments;indices.push(index,...(i?[a,b]:[b,a]));}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function plate(points,thickness=.34){const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.12,bevelThickness:.1});g.rotateX(-Math.PI/2);return g;}
export function makeShip(){
 const group=new THREE.Group(),flames=[];
 const mats={ivory:new THREE.MeshStandardMaterial({color:0xc6cfca,metalness:.65,roughness:.28}),dark:new THREE.MeshStandardMaterial({color:0x192934,metalness:.8,roughness:.24}),silver:new THREE.MeshStandardMaterial({color:0x687c85,metalness:.85,roughness:.22}),glass:new THREE.MeshPhysicalMaterial({color:0x10384d,metalness:.7,roughness:.12,clearcoat:1,clearcoatRoughness:.08,emissive:0x0b5261,emissiveIntensity:.3}),amber:new THREE.MeshStandardMaterial({color:0xe9ab6a,metalness:.55,roughness:.25,emissive:0xd7792d,emissiveIntensity:.2}),light:new THREE.MeshBasicMaterial({color:0xc2f4f5}),engine:new THREE.MeshBasicMaterial({color:0xffbf81})};
 function mesh(geometry,material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,mats[material]);m.position.set(x,y,z);group.add(m);return m;}
 mesh(loft([[-17,.06,.06,-.2],[-14,1.2,.32,-.15],[-8,2.8,1.1,0],[-2,3.55,1.62,0],[3,3.3,1.3,-.05],[8,2.5,.85,-.15],[10,1.7,.55,-.2]]),'ivory');
 mesh(loft([[-15,.08,.05,-.22],[-8,1.7,.65,-.4],[4,2.5,.7,-.55],[9,1.8,.55,-.4]],10),'dark');
 mesh(loft([[-9,.1,.06,1.0],[-6,1.3,.6,1.3],[-1.5,1.85,.98,1.5],[3,1.5,.65,1.25],[4.5,.8,.3,1.0]],12),'glass');
 mesh(plate([[-.13,-10],[.13,-10],[.2,6],[-.2,6]],.07),'silver',0,1.57,0);
 for(const side of[-1,1]){
  const points=[[2.2,-8],[5.4,-5],[14,6.4],[12.4,10],[5,5],[2,4]].map(([x,z])=>[x*side,z]);mesh(plate(points,.4),'ivory',0,-.25,0);
  mesh(plate([[5.9,-2],[12,6.5],[11.7,8.8],[7.3,5.2]].map(([x,z])=>[x*side,z]),.09),'dark',0,.25,0);
  mesh(plate([[10.1,4.7],[10.6,5.1],[12.6,8.3],[12.1,8.1]].map(([x,z])=>[x*side,z]),.1),'amber',0,.4,0);
  mesh(loft([[-5,.4,.35],[0,1.4,1.4],[5,1.75,1.65],[10,1.4,1.4],[10.8,1.2,1.2]],10),'dark',side*7,-.6,0);
  mesh(loft([[-3,.3,.28],[1,1.45,1.46],[6,1.7,1.55],[8.5,1.5,1.4]],10),'ivory',side*7,-.5,0);
  for(const z of[8,9,10])mesh(new THREE.TorusGeometry(1.34,.13,5,16),'silver',side*7,-.6,z);
  mesh(new THREE.TorusGeometry(1.05,.15,6,20),'engine',side*7,-.6,10.8);
  mesh(new THREE.CircleGeometry(.9,18),'dark',side*7,-.6,10.85);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.95,8,12,1,true),new THREE.MeshBasicMaterial({color:0xffb96e,transparent:true,opacity:.58,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));flame.rotation.x=Math.PI/2;flame.position.set(side*7,-.6,14.3);flame.userData.effect=true;group.add(flame);flames.push(flame);
  const core=new THREE.Mesh(new THREE.ConeGeometry(.45,6,10,1,true),new THREE.MeshBasicMaterial({color:0xc8f2ff,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));core.rotation.x=Math.PI/2;core.position.set(side*7,-.6,13.5);core.userData.effect=true;group.add(core);flames.push(core);
  mesh(new THREE.BoxGeometry(.18,.11,5),'light',side*11.7,.42,6);
  mesh(new THREE.BoxGeometry(.3,.15,5),'amber',side*2.8,1.06,5.5);
  for(let j=0;j<4;j++)mesh(new THREE.BoxGeometry(.9,.14,.3),'dark',side*3.3,1.15,3+j*.7);
  const fin=mesh(plate([[0,4],[0,10],[1.2,9],[1.1,7]],.22),'silver',side*5.4,.6,0);fin.rotation.z=side*-.32;
 }
 // Merge static surfaces by material once. The moving engine plumes stay separate.
 group.updateMatrixWorld(true);const buckets=new Map();const source=[];
 for(const child of [...group.children]){if(!child.isMesh||child.userData.effect)continue;const g=(child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone());g.applyMatrix4(child.matrixWorld);const p=g.getAttribute('position'),n=g.getAttribute('normal');let b=buckets.get(child.material);if(!b){b={p:[],n:[]};buckets.set(child.material,b);}b.p.push(...p.array);b.n.push(...n.array);
  // Large surfaces only in software mode; tiny vent details would waste CPU.
  if(p.count>24&&p.count<1600&&child.material!==mats.light&&child.material!==mats.engine){const stride=3;for(let i=0;i<p.count;i+=stride){if(i+2>=p.count)break;const tri=[];for(let j=0;j<3;j++)tri.push([p.getX(i+j),p.getY(i+j),p.getZ(i+j)]);const normal=new THREE.Vector3(n.getX(i),n.getY(i),n.getZ(i));source.push({v:tri,c:child.material.color.clone(),n:[normal.x,normal.y,normal.z]});}}
  child.geometry.dispose();group.remove(child);g.dispose();
 }
 for(const [material,b]of buckets){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));group.add(new THREE.Mesh(g,material));}
 group.userData.flames=flames;group.userData.softwareFaces=source;return group;
}
