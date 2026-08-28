import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class GlobeController {
  constructor(camera,canvas,globeRoot){this.camera=camera;this.globeRoot=globeRoot;this.autoRotate=false;this.resumeTimer=0;this.controls=new OrbitControls(camera,canvas);this.controls.enableDamping=true;this.controls.dampingFactor=.045;this.controls.enablePan=false;this.controls.enableZoom=false;this.controls.enableRotate=true;this.controls.minDistance=350;this.controls.maxDistance=540;this.controls.rotateSpeed=.36;this.controls.addEventListener('start',()=>{clearTimeout(this.resumeTimer);this.autoRotate=false;});this.controls.addEventListener('end',()=>{clearTimeout(this.resumeTimer);this.resumeTimer=setTimeout(()=>{this.autoRotate=false;},2600);});}
  update(){this.controls.update();}
  tick(){/* Perú permanece centrado; no hay rotación automática. */}
  focus({lat,lng,duration=1.4}){this.autoRotate=false;return gsap.to(this.globeRoot.rotation,{x:THREE.MathUtils.degToRad(lat),y:THREE.MathUtils.degToRad(-lng),duration,ease:'power2.inOut'});}
  enable(){this.controls.enabled=true;}
  disable(){this.controls.enabled=false;}
  destroy(){clearTimeout(this.resumeTimer);this.controls.dispose();}
}
