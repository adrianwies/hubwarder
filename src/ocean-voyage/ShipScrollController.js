import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export class ShipScrollController{
  constructor(section,shipRoot){this.section=section;this.shipRoot=shipRoot;this.state={progress:0};this.previousProgress=0;this.motionIntensity=0;this.startZ=-12;this.endZ=12;}
  init(){
    this.tween=gsap.to(this.state,{progress:1,ease:'none',onUpdate:()=>this.setScrollProgress(this.state.progress),scrollTrigger:{trigger:this.section,start:'top bottom',end:'bottom top',scrub:1.15}});
    const lead=this.section.querySelector('[data-ocean-lead]');
    const chapters=gsap.utils.toArray(this.section.querySelectorAll('[data-ocean-chapter]'));
    if(lead&&chapters.length){
      gsap.set(chapters,{autoAlpha:0,y:34,yPercent:-50});
      this.storyTimeline=gsap.timeline({scrollTrigger:{trigger:this.section,start:'top top',end:'bottom bottom',scrub:.9}})
        .to(lead,{autoAlpha:0,y:-30,duration:.12,ease:'none'},.08);
      chapters.forEach((chapter,index)=>{
        const at=.18+index*.25;
        this.storyTimeline
          .fromTo(chapter,{autoAlpha:0,y:34},{autoAlpha:1,y:0,duration:.09,ease:'none'},at)
          .to(chapter,{autoAlpha:0,y:-28,duration:.08,ease:'none'},at+.17);
      });
    }
    this.setScrollProgress(0);return this;
  }
  setTravelBounds(startZ,endZ){this.startZ=startZ;this.endZ=endZ;this.setScrollProgress(this.state.progress);}
  setScrollProgress(progress){const speed=Math.min(1,Math.abs(progress-this.previousProgress)*32);this.motionIntensity+=(speed-this.motionIntensity)*.22;this.previousProgress=progress;this.shipRoot.position.set(0,0,gsap.utils.interpolate(this.startZ,this.endZ,progress));this.shipRoot.rotation.y=(progress-.5)*.018;}
  update(delta){this.motionIntensity*=Math.exp(-2.4*delta);return this.motionIntensity;}
  destroy(){this.tween?.scrollTrigger?.kill();this.tween?.kill();this.storyTimeline?.scrollTrigger?.kill();this.storyTimeline?.kill();}
}
