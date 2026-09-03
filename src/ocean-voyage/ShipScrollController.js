import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export class ShipScrollController{
  constructor(section,shipRoot){this.section=section;this.shipRoot=shipRoot;this.mobile=matchMedia('(max-width: 768px)').matches;this.state={progress:0};this.previousProgress=0;this.motionIntensity=0;this.startZ=-12;this.endZ=12;}
  init(){
    this.shipMaterial=this.shipRoot.getObjectByName('CargoShipImage')?.material;
    if(this.shipMaterial)this.shipMaterial.opacity=0;
    this.tween=gsap.to(this.state,{progress:1,ease:'none',onUpdate:()=>this.setScrollProgress(this.state.progress),scrollTrigger:{trigger:this.section,start:'top bottom',end:'bottom top',scrub:.42}});

    const road=this.section.querySelector('.logistics-road');
    const cards=road?gsap.utils.toArray(road.querySelectorAll('[data-road-segment]')):[];
    this.cardTweens=[];
    if(road&&cards.length){
      gsap.set(cards,{autoAlpha:0,y:42});
      const setRoadActive=active=>road.classList.toggle('is-road-active',active);
      this.roadTrigger=ScrollTrigger.create({
        trigger:road,
        start:'top top',
        end:'bottom bottom',
        onEnter:()=>setRoadActive(true),
        onEnterBack:()=>setRoadActive(true),
        onLeave:()=>setRoadActive(false),
        onLeaveBack:()=>setRoadActive(false)
      });
      cards.forEach(card=>{
        const tween=gsap.timeline({
          scrollTrigger:{
            trigger:card,
            start:'top 84%',
            end:'bottom 16%',
            scrub:.55
          }
        })
          .fromTo(card,{autoAlpha:0,y:42},{autoAlpha:1,y:0,duration:.28,ease:'none'})
          .to(card,{autoAlpha:1,y:0,duration:.44,ease:'none'})
          .to(card,{autoAlpha:0,y:-38,duration:.28,ease:'none'});
        this.cardTweens.push(tween);
      });
    }

    const oceanSection=this.section.querySelector('.ocean-voyage');
    const lead=oceanSection?.querySelector('[data-ocean-lead]');
    const chapters=oceanSection?gsap.utils.toArray(oceanSection.querySelectorAll('[data-ocean-chapter]')):[];
    if(oceanSection&&lead&&chapters.length){
      gsap.set(lead,{autoAlpha:0,y:24});
      gsap.set(chapters,{autoAlpha:0,y:34,yPercent:-50});
      this.storyTimeline=gsap.timeline({
        scrollTrigger:{
          trigger:oceanSection,
          start:'top top',
          end:'bottom bottom',
          scrub:.9
        }
      })
        .fromTo(lead,{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.07,ease:'none'},0)
        .to(lead,{autoAlpha:0,y:-30,duration:.1,ease:'none'},.13);
      chapters.forEach((chapter,index)=>{
        const spacing=.7/Math.max(1,chapters.length-1);
        const at=.22+index*spacing;
        this.storyTimeline
          .fromTo(chapter,{autoAlpha:0,y:34},{autoAlpha:1,y:0,duration:.08,ease:'none'},at)
          .to(chapter,{autoAlpha:0,y:-28,duration:.08,ease:'none'},at+Math.min(.16,spacing*.58));
      });
    }
    this.setScrollProgress(0);return this;
  }
  setTravelBounds(startZ,endZ){this.startZ=startZ;this.endZ=endZ;this.centerTravelProgress=Math.max(0,Math.min(1,(0-startZ)/(endZ-startZ)));this.setScrollProgress(this.state.progress);}
  setScrollProgress(progress){const visualProgress=this.mobile?Math.max(0,Math.min(1,(progress-.16)/.84)):progress;const reveal=Math.max(0,Math.min(1,visualProgress/.055));const revealEase=reveal*reveal*(3-2*reveal);if(this.shipMaterial)this.shipMaterial.opacity=revealEase;const speed=Math.min(1,Math.abs(progress-this.previousProgress)*32);this.motionIntensity+=(speed-this.motionIntensity)*.22;this.previousProgress=progress;const center=this.centerTravelProgress??.18;let travelProgress;if(visualProgress<.12){const entry=visualProgress/.12;const easedEntry=entry*entry*(3-2*entry);travelProgress=gsap.utils.interpolate(0,center,easedEntry);}else{const x=Math.max(0,Math.min(1,(visualProgress-.12)/.88));const delayed=Math.pow(x,1.65);const natural=delayed*delayed*(3-2*delayed);travelProgress=gsap.utils.interpolate(center,1,natural);}this.shipRoot.position.set(0,0,gsap.utils.interpolate(this.startZ,this.endZ,travelProgress));this.shipRoot.rotation.y=(visualProgress-.5)*.018;}
  update(delta){this.motionIntensity*=Math.exp(-2.4*delta);return this.motionIntensity;}
  destroy(){this.tween?.scrollTrigger?.kill();this.tween?.kill();this.roadTrigger?.kill();this.cardTweens?.forEach(tween=>{tween.scrollTrigger?.kill();tween.kill();});this.storyTimeline?.scrollTrigger?.kill();this.storyTimeline?.kill();}
}






