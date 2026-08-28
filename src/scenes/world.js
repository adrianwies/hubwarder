import * as THREE from 'three';
import { MOBILE,REDUCED_MOTION } from '../config.js';
import { disposeTree } from '../utils/three-utils.js';

function point(lat,lng,r=4.15){const p=(90-lat)*Math.PI/180,t=(lng+180)*Math.PI/180;return new THREE.Vector3(-r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t));}
function labelSprite(text){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=72;const c=canvas.getContext('2d');c.fillStyle='rgba(8,3,5,.9)';c.fillRect(0,8,256,56);c.strokeStyle='#c45d7c';c.strokeRect(1,9,254,54);c.fillStyle='#fff';c.font='700 24px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,128,37);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.scale.set(1.35,.38,1);return sprite;
}
function isLand(lat,lng){
  const ellipse=(a,b,x,y,rx,ry)=>((a-x)/rx)**2+((b-y)/ry)**2<1;
  return ellipse(lat,lng,48,-105,28,55)||ellipse(lat,lng,17,-95,14,22)||ellipse(lat,lng,-18,-60,34,22)||ellipse(lat,lng,51,18,18,38)||ellipse(lat,lng,7,20,36,27)||ellipse(lat,lng,42,82,30,72)||ellipse(lat,lng,-25,135,14,24);
}
function createGlobe(){
  const group=new THREE.Group();group.position.set(MOBILE?4.7:7.2,.25,0);group.scale.setScalar(1.14);
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(4.1,MOBILE?48:96,MOBILE?32:64),new THREE.MeshPhysicalMaterial({color:0x050103,roughness:.8,metalness:.16,clearcoat:.4,clearcoatRoughness:.5}));group.add(sphere);
  const values=[];for(let lat=-70;lat<=75;lat+=3.5)for(let lng=-175;lng<180;lng+=3.5)if(isLand(lat,lng))values.push(...point(lat,lng,4.14).toArray());const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(values,3));group.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xf4cbd5,size:.048,transparent:true,opacity:.88,sizeAttenuation:true})));
  const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(4.34,64,40),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;void main(){float f=pow(1.-max(0.,dot(n,v)),2.25);gl_FragColor=vec4(mix(vec3(.77,.36,.49),vec3(.85,.43,.42),f),f*.72);}'}));group.add(atmosphere);
  const movers=[],routes=[{name:'USA',to:[38,-97]},{name:'SPAIN',to:[40,-4]},{name:'GERMANY',to:[51,10]},{name:'CHINA',to:[35,104]},{name:'BRAZIL',to:[-14,-51]}];
  routes.forEach((r,i)=>{const start=point(-12,-77),end=point(...r.to),mid=start.clone().add(end).normalize().multiplyScalar(5.55),curve=new THREE.QuadraticBezierCurve3(start,mid,end);group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(110)),new THREE.LineBasicMaterial({color:i%2?0xd96d6c:0xc45d7c,transparent:true,opacity:.95})));const pin=new THREE.Mesh(new THREE.SphereGeometry(.075,10,10),new THREE.MeshBasicMaterial({color:0xff8b84}));pin.position.copy(end.clone().multiplyScalar(1.008));group.add(pin);const label=labelSprite(r.name);label.position.copy(end.clone().multiplyScalar(1.13));group.add(label);const marker=new THREE.Mesh(new THREE.SphereGeometry(.052,8,8),new THREE.MeshBasicMaterial({color:0xffffff}));group.add(marker);movers.push({marker,curve,offset:i/routes.length});});
  const starGeo=new THREE.BufferGeometry(),count=MOBILE?180:600,pos=new Float32Array(count*3);for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*44;pos[i*3+1]=(Math.random()-.5)*26;pos[i*3+2]=-5-Math.random()*20;}starGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xd9b3bd,size:.035,transparent:true,opacity:.55}));group.add(stars);
  return {group,sphere,stars,movers};
}
export function createWorld(canvas){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:!MOBILE,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,MOBILE?1.25:1.8));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.setClearColor(0x000000,0);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(MOBILE?42:30,innerWidth/innerHeight,.1,220);camera.position.set(0,2,MOBILE?25:22);const lookTarget=new THREE.Vector3(2.2,.4,0);scene.add(new THREE.HemisphereLight(0xffd9e2,0x26040b,2.1));const key=new THREE.DirectionalLight(0xffd8db,4);key.position.set(2,10,8);scene.add(key);const globe=createGlobe();scene.add(globe.group);const clock=new THREE.Clock();let raf;
  function render(){const t=clock.getElapsedTime();if(!REDUCED_MOTION){globe.group.rotation.y=t*.045;globe.group.rotation.x=Math.sin(t*.16)*.025;globe.stars.rotation.y=t*.0015;globe.movers.forEach(({marker,curve,offset})=>marker.position.copy(curve.getPointAt((t*.07+offset)%1)));}camera.lookAt(lookTarget);renderer.render(scene,camera);raf=requestAnimationFrame(render);}render();
  const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false)};addEventListener('resize',resize,{passive:true});
  return {renderer,scene,camera,lookTarget,globe,ready:Promise.resolve(),destroy(){cancelAnimationFrame(raf);removeEventListener('resize',resize);disposeTree(scene);renderer.dispose();renderer.forceContextLoss();}};
}
