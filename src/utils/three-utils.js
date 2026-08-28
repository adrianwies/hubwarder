import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const mat = (color, roughness=.72, metalness=.12) => new THREE.MeshStandardMaterial({color,roughness,metalness});
export const mesh = (geometry, material, position=[0,0,0]) => { const m=new THREE.Mesh(geometry,material); m.position.set(...position); m.castShadow=m.receiveShadow=true; return m; };
export function latLngToVector3(lat,lng,radius=3){
  const phi=(90-lat)*Math.PI/180, theta=(lng+180)*Math.PI/180;
  return new THREE.Vector3(-radius*Math.sin(phi)*Math.cos(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.sin(theta));
}
export async function loadOptionalModel(url,fallback){
  try { const gltf=await new GLTFLoader().loadAsync(url); gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}}); return gltf.scene; }
  catch { return fallback(); }
}
export function disposeTree(root){
  root.traverse(o=>{if(!o.isMesh)return;o.geometry?.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>{if(!m)return;Object.values(m).forEach(v=>v?.isTexture&&v.dispose());m.dispose();});});
}
