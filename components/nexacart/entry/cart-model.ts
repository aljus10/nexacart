import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
type Point=[number,number,number];
export function createStudioCart(){
 const group=new THREE.Group();group.name='NexaCart · charcoal studio cart';
 const graphite=new THREE.MeshStandardMaterial({color:0x272e25,metalness:.72,roughness:.24});
 const satin=new THREE.MeshStandardMaterial({color:0x697563,metalness:.82,roughness:.22});
 const rubber=new THREE.MeshStandardMaterial({color:0x20241f,roughness:.92,metalness:0});
 const hubMaterial=new THREE.MeshStandardMaterial({color:0x9ca393,metalness:.86,roughness:.18});
 const frosted=new THREE.MeshPhysicalMaterial({color:0xd3dbcd,roughness:.28,metalness:.03,transmission:.48,thickness:.06,transparent:true,opacity:.75,ior:1.44,clearcoat:.62,clearcoatRoughness:.18,side:THREE.DoubleSide,depthWrite:false});
 const green=new THREE.MeshStandardMaterial({color:0x4b6837,roughness:.52,metalness:.02});
 const tape=new THREE.MeshStandardMaterial({color:0x394e28,roughness:.74});
 const ink=new THREE.MeshStandardMaterial({color:0x1e2c1a,roughness:.7});
 const paper=new THREE.MeshStandardMaterial({color:0xf5f7ef,roughness:.82});
 const wheels:THREE.Group[]=[];
 const tube=(points:Point[],radius=.027,material:THREE.Material=graphite,closed=false)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed,'centripetal');const m=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(14,points.length*10),radius,10,closed),material);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;};
 const box=(g:THREE.Group,position:Point,size:Point,material:THREE.Material,radius=.025)=>{const mesh=new THREE.Mesh(new RoundedBoxGeometry(...size,2,radius),material);mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;};
 function panel(points:Point[]){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();const m=new THREE.Mesh(geometry,frosted);m.name='Frosted basket panel';m.renderOrder=4;group.add(m);return m;}
 const A:Point=[-1.13,1.40,-.64],B:Point=[1.30,1.40,-.64],C:Point=[1.30,1.40,.64],D:Point=[-1.13,1.40,.64];
 const a:Point=[-.85,.17,-.42],b:Point=[.94,.17,-.42],c:Point=[.94,.17,.42],d:Point=[-.85,.17,.42];
 panel([A,B,b,a]);panel([D,d,c,C]);panel([B,C,c,b]);panel([A,a,d,D]);
 box(group,[.05,.15,0],[1.84,.07,.87],graphite,.025);
 tube([A,B,C,D],.045,graphite,true);tube([a,b,c,d],.029,satin,true);
 for(const [top,bottom] of [[A,a],[B,b],[C,c],[D,d]])tube([top,bottom],.032);
 // Sparse inset ribs keep the glass and the single parcel visible.
 for(const z of [-1,1]){
  for(const x of [-.48,.19,.84])tube([[x,.19,z*.428],[x,1.38,z*.644]],.012,satin);
  tube([[-1.0,.83,z*.55],[1.14,.83,z*.55]],.01,satin);
  tube([[-1.12,-.43,z*.54],[1.08,-.43,z*.54]],.043);
  tube([[-.94,-.43,z*.54],[-.69,.12,z*.42]],.033,satin);
  tube([[.88,-.43,z*.54],[.66,.12,z*.42]],.033,satin);
  tube([[-1.21,-.43,z*.54],[-1.42,.56,z*.64],[-1.57,1.40,z*.67],[-1.81,1.81,z*.68]],.039);
 }
 tube([[-1.81,1.81,-.68],[-1.84,1.85,-.57],[-1.84,1.85,.57],[-1.81,1.81,.68]],.071);
 tube([[-1.8,1.85,-.45],[-1.8,1.85,.45]],.074,rubber);
 tube([[-1.04,-.43,-.54],[-1.04,-.43,.54]],.03,satin);
 tube([[1.0,-.43,-.54],[1.0,-.43,.54]],.03,satin);
 for(const x of [-1.04,1.0])for(const z of [-.54,.54]){
  box(group,[x,-.51,z],[.12,.19,.11],graphite,.02);
  const wheelGroup=new THREE.Group();wheelGroup.position.set(x,-.72,z);group.add(wheelGroup);wheels.push(wheelGroup);
  const tire=new THREE.Mesh(new THREE.CylinderGeometry(.238,.238,.115,40),rubber);tire.rotation.x=Math.PI/2;tire.castShadow=true;wheelGroup.add(tire);
  for(const side of [-1,1]){const hub=new THREE.Mesh(new THREE.CylinderGeometry(.145,.145,.012,32),hubMaterial);hub.rotation.x=Math.PI/2;hub.position.z=side*.063;wheelGroup.add(hub);const bolt=new THREE.Mesh(new THREE.CylinderGeometry(.042,.042,.017,16),graphite);bolt.rotation.x=Math.PI/2;bolt.position.z=side*.072;wheelGroup.add(bolt);}
 }
 const parcel=new THREE.Group();parcel.name='NexaCart · green parcel';parcel.position.set(.16,.78,0);parcel.rotation.y=.06;group.add(parcel);
 box(parcel,[0,0,0],[.96,1.00,.68],green,.065);
 box(parcel,[0,.506,0],[.14,.012,.69],tape,.005);box(parcel,[0,0,.344],[.14,.99,.009],tape,.004);
 box(parcel,[.26,.09,.348],[.27,.26,.008],paper,.012);
 for(let i=0;i<9;i++)box(parcel,[.155+i*.023,.02,.355],[i%3===0?.012:.006,.09,.004],ink,.001);
 box(parcel,[.26,.16,.355],[.18,.017,.004],ink,.001);
 // A small metal badge catches the key light on the cart's front rim.
 box(group,[1.322,1.34,0],[.018,.10,.27],satin,.014);
 group.position.y=.965;
 return {group,parcel,wheels};
}
