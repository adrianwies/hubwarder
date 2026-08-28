import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const PRIMARY_URL=new URL('../../imagenes3d/camion3.glb',import.meta.url).href;
const FALLBACK_URL=new URL('../../imagenes3d/camion.glb',import.meta.url).href;
let sourcePromise;

async function loadSource(){
  const loader=new GLTFLoader();
  let gltf=await loader.loadAsync(PRIMARY_URL);
  let source=gltf.scene.getObjectByName('Truck_Root');
  if(!source){
    console.warn('[TruckAsset] camion3.glb sin Truck_Root; usando camion.glb.');
    gltf=await loader.loadAsync(FALLBACK_URL);
    source=gltf.scene.getObjectByName('Truck_Root')??gltf.scene;
  }
  source.removeFromParent();
  return source;
}

export async function createTruckInstance({cloneMaterials=false}={}){
  sourcePromise??=loadSource();
  const source=await sourcePromise;
  const model=source.clone(true);
  const ownedMaterials=new Set();
  if(cloneMaterials){
    const materialMap=new Map();
    model.traverse(object=>{
      if(!object.isMesh)return;
      const originals=Array.isArray(object.material)?object.material:[object.material];
      const clones=originals.map(material=>{
        if(!materialMap.has(material)){const clone=material.clone();materialMap.set(material,clone);ownedMaterials.add(clone);}
        return materialMap.get(material);
      });
      object.material=Array.isArray(object.material)?clones:clones[0];
    });
  }
  return {model,ownedMaterials};
}
