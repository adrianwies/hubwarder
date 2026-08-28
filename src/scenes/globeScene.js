import * as THREE from 'three';
import { ROUTES, MOBILE } from '../config.js';
import { latLngToVector3,mat,mesh } from '../utils/three-utils.js';
import { createAirplane } from './airplaneScene.js';

function earthTexture(){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d');
  const ocean=c.createLinearGradient(0,0,0,512);ocean.addColorStop(0,'#163e43');ocean.addColorStop(.55,'#0a292f');ocean.addColorStop(1,'#061c24');c.fillStyle=ocean;c.fillRect(0,0,1024,512);
  c.fillStyle='#536a58';c.strokeStyle='#7c8b70';c.lineWidth=3;
  const shapes=[
    [[90,90],[165,62],[245,80],[290,132],[265,185],[230,210],[205,285],[165,315],[142,265],[120,210],[72,170]],
    [[275,248],[330,230],[365,270],[350,350],[310,450],[270,400],[255,320]],
    [[445,95],[520,65],[610,86],[675,70],[760,108],[840,118],[925,170],[880,230],[785,235],[730,205],[670,220],[620,300],[555,278],[530,215],[470,195],[430,145]],
    [[555,250],[630,240],[675,295],[650,390],[595,440],[550,370],[530,300]],
    [[835,350],[900,330],[952,365],[930,420],[865,425],[820,390]]
  ];
  shapes.forEach(points=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.globalAlpha=.35;c.stroke();c.globalAlpha=1;});
  const img=c.getImageData(0,0,1024,512);for(let i=0;i<img.data.length;i+=4){const n=(Math.random()-.5)*12;img.data[i]+=n;img.data[i+1]+=n;img.data[i+2]+=n;}c.putImageData(img,0,0);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;return texture;
}

function routeCurve(from,to){
  const start=latLngToVector3(...from),end=latLngToVector3(...to);
  const distance=start.distanceTo(end),mid=start.clone().add(end).normalize().multiplyScalar(3+Math.min(1.65,distance*.25));
  return new THREE.QuadraticBezierCurve3(start,mid,end);
}
export function createGlobeScene(){
  const group=new THREE.Group();group.name='globe-world';group.position.set(3,0,-82);group.scale.setScalar(.02);
  const globe=mesh(new THREE.SphereGeometry(3,MOBILE?40:96,MOBILE?24:64),new THREE.MeshPhysicalMaterial({map:earthTexture(),color:0xffffff,roughness:.82,metalness:.04,clearcoat:.12,clearcoatRoughness:.8,emissive:0x03100f,emissiveIntensity:.28}));
  const wire=mesh(new THREE.SphereGeometry(3.015,MOBILE?24:48,MOBILE?16:32),new THREE.MeshBasicMaterial({color:0x7bb7a5,wireframe:true,transparent:true,opacity:.025}));
  const atmosphere=mesh(new THREE.SphereGeometry(3.16,40,24),new THREE.MeshBasicMaterial({color:0x9dffcf,side:THREE.BackSide,transparent:true,opacity:.08}));
  group.add(globe,wire,atmosphere);
  const routeObjects=ROUTES.map((route,index)=>{
    const curve=routeCurve(route.from,route.to),points=curve.getPoints(MOBILE?80:150);
    const geometry=new THREE.BufferGeometry().setFromPoints(points);geometry.setDrawRange(0,0);
    const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:route.color,transparent:true,opacity:.85}));group.add(line);
    [route.from,route.to].forEach(coords=>{const marker=mesh(new THREE.SphereGeometry(.055,10,10),new THREE.MeshBasicMaterial({color:route.color}),latLngToVector3(...coords,3.055).toArray());group.add(marker);});
    const arrows=[];for(let i=0;i<(MOBILE?1:3);i++){const arrow=mesh(new THREE.ConeGeometry(.045,.16,6),mat(route.color,.45,.25));arrow.rotation.x=Math.PI/2;group.add(arrow);arrows.push(arrow);}
    return {curve,geometry,line,arrows,index,progress:0};
  });
  const airplane=createAirplane();group.add(airplane);
  const stars=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0xbcd7ce,size:.025,transparent:true,opacity:.45}));
  const count=MOBILE?120:360,positions=new Float32Array(count*3);for(let i=0;i<count;i++){const r=7+Math.random()*10,theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);positions.set([r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta)],i*3);}stars.geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));group.add(stars);
  function updateRoutes(){
    routeObjects.forEach(route=>{
      const p=Math.max(0,Math.min(1,route.progress));route.geometry.setDrawRange(0,Math.floor(route.geometry.attributes.position.count*p));
      route.arrows.forEach((arrow,i)=>{const t=Math.min(.999,Math.max(0,p-(i*.13)));arrow.visible=t>0&&t<p+.01;const pos=route.curve.getPointAt(t),tangent=route.curve.getTangentAt(t);arrow.position.copy(pos);arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tangent.normalize());});
    });
    const flight=routeObjects[0],t=Math.max(0,Math.min(.999,flight.progress));airplane.position.copy(flight.curve.getPointAt(t));airplane.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),flight.curve.getTangentAt(t).normalize());airplane.visible=t>.03;
  }
  return {group,globe,routeObjects,airplane,stars,updateRoutes};
}
