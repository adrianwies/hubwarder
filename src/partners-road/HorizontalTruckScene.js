import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createTruckInstance } from '../logistics-road/TruckAsset.js';

gsap.registerPlugin(ScrollTrigger);

export class HorizontalTruckScene {
  constructor(section){
    this.section=section;this.canvas=section?.querySelector('[data-partners-truck]');this.progress=0;this.raf=0;this.visible=false;
    this.wheels=[];this.ownedMaterials=new Set();this.truckSize=new THREE.Vector3();this.startX=0;this.endX=0;this.motionState={progress:0};this.lastOpacity=-1;
    this.stops=[...section?.querySelectorAll('[data-partner-stop]')??[]];this.trackProgress=section?.querySelector('[data-partners-progress]');
  }
  async init(){
    if(!this.canvas)return this;
    this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-10,10,3,-3,.1,120);
    this.camera.position.set(0,1.7,12);this.camera.lookAt(0,1.7,0);
    this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1;
    this.renderer.shadowMap.enabled=false;
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x29364b,2.2));
    const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-8,13,12);key.castShadow=true;key.shadow.mapSize.set(1024,1024);this.scene.add(key);
    const rim=new THREE.DirectionalLight(0xff7a32,1.4);rim.position.set(12,7,-8);this.scene.add(rim);

    const instance=await createTruckInstance({cloneMaterials:true});this.model=instance.model;this.ownedMaterials=instance.ownedMaterials;
    this.model.traverse(object=>{if(object.isMesh){object.castShadow=false;object.receiveShadow=false;}if(/^Wheel_/.test(object.name))this.wheels.push({object,base:object.rotation.z});});
    const box=new THREE.Box3().setFromObject(this.model),size=box.getSize(new THREE.Vector3());
    const scale=7.2/size.x;this.model.scale.setScalar(scale);this.model.updateMatrixWorld(true);
    const scaledBox=new THREE.Box3().setFromObject(this.model),center=scaledBox.getCenter(new THREE.Vector3());
    this.model.position.set(-center.x,-scaledBox.min.y,-center.z);this.truckPivot=new THREE.Group();this.truckPivot.name='HorizontalTruckRoot';this.truckPivot.add(this.model);this.scene.add(this.truckPivot);
    scaledBox.setFromObject(this.model);scaledBox.getSize(this.truckSize);
    this.setOpacity(0);this.resize();
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.canvas);
    gsap.set(this.trackProgress,{scaleX:0,transformOrigin:'left'});
    this.timeline=gsap.timeline({scrollTrigger:{trigger:this.section,start:'top top',end:'bottom bottom',scrub:1.15,invalidateOnRefresh:true,onUpdate:self=>this.setActiveStop(self.progress),onEnter:()=>this.setActive(true),onEnterBack:()=>this.setActive(true),onLeave:()=>{this.setActiveStop(-1);this.setActive(false);},onLeaveBack:()=>{this.setActiveStop(-1);this.setActive(false);this.motionState.progress=0;this.update(0);}}});
    this.trigger=this.timeline.scrollTrigger;
    this.timeline.to(this.motionState,{progress:1,duration:100,ease:'none',onUpdate:()=>this.update(this.motionState.progress)},0)
      .to(this.trackProgress,{scaleX:1,duration:100,ease:'none'},0)
      .fromTo(this.section.querySelector('.partners-section__layout'),{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:8,ease:'none'},0);
    this.setActiveStop(0);
    this.intersectionObserver=new IntersectionObserver(([entry])=>this.setActive(entry.isIntersecting),{rootMargin:'30% 0px'});this.intersectionObserver.observe(this.section);
    this.update(0);return this;
  }
  resize(){
    const rect=this.canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
    const viewHeight=5.2,halfHeight=viewHeight/2,halfWidth=halfHeight*(rect.width/rect.height);
    this.camera.left=-halfWidth;this.camera.right=halfWidth;this.camera.top=halfHeight;this.camera.bottom=-halfHeight;this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setSize(rect.width,rect.height,false);
    const truckHalf=this.truckSize.x/2;
    this.startX=-halfWidth-truckHalf-1;this.endX=halfWidth+truckHalf+1;
    this.update(this.progress);
  }
  setOpacity(value){if(Math.abs(value-this.lastOpacity)<.008)return;this.lastOpacity=value;this.ownedMaterials.forEach(material=>{material.transparent=true;material.opacity=value;material.depthWrite=value>.98;});}
  update(progress){
    this.progress=THREE.MathUtils.clamp(progress,0,1);if(!this.truckPivot)return;
    const x=THREE.MathUtils.lerp(this.startX,this.endX,this.progress);
    // Keep a constant vertical position: the truck travels straight with its
    // tyre contact patch resting on the CSS road for the entire sequence.
    this.truckPivot.position.set(x,-.27,0);
    const distance=(this.endX-this.startX)*this.progress,wheelRotation=distance/(.48*this.model.scale.x);
    this.wheels.forEach(({object,base})=>{object.rotation.z=base-wheelRotation;});
    this.setOpacity(THREE.MathUtils.smoothstep(this.progress,.02,.1));
    this.requestRender();
  }
  setActiveStop(progress){
    if(!this.stops.length)return;
    let activeIndex=-1;
    if(progress>=0&&progress<.98){
      const boundaries=[.20,.36,.52,.68,.83];
      activeIndex=boundaries.findIndex(boundary=>progress<boundary);
      if(activeIndex===-1)activeIndex=this.stops.length-1;
    }
    this.stops.forEach((stop,index)=>stop.classList.toggle('is-active',index===activeIndex));
  }
  setActive(active){if(this.visible===active)return;this.visible=active;if(active)this.requestRender();else{cancelAnimationFrame(this.raf);this.raf=0;this.renderer.clear();}}
  requestRender(){if(!this.visible||this.raf)return;this.raf=requestAnimationFrame(()=>{this.raf=0;if(this.visible)this.renderer.render(this.scene,this.camera);});}
  destroy(){
    cancelAnimationFrame(this.raf);this.timeline?.kill();this.trigger?.kill();this.resizeObserver?.disconnect();this.intersectionObserver?.disconnect();
    this.ownedMaterials.forEach(material=>material.dispose());this.scene?.traverse(object=>{if(object===this.model||this.model?.getObjectById(object.id))return;object.geometry?.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material?.dispose());});this.renderer?.dispose();
  }
}
