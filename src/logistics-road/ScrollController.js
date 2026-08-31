import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ROAD_CONFIG } from './RoadPath.js';

gsap.registerPlugin(ScrollTrigger);

export class ScrollController {
  constructor(section,scene,config=ROAD_CONFIG){this.section=section;this.scene=scene;this.config=config;this.state={progress:0};this.tween=null;this.visibilityTrigger=null;this.cardTweens=[];}
  init(){
    // Muestra el camión cuando la carretera entra por debajo del hero; el progreso conserva su inicio en top top.
    this.visibilityTrigger=ScrollTrigger.create({trigger:this.section,start:'top bottom',end:'bottom top',onEnter:()=>this.scene.setSectionActive(true),onEnterBack:()=>this.scene.setSectionActive(true),onLeave:()=>this.scene.setSectionActive(false),onLeaveBack:()=>this.scene.setSectionActive(false)});
    this.trigger=ScrollTrigger.create({trigger:this.section,start:'top top',end:'bottom bottom',invalidateOnRefresh:true,onUpdate:self=>{this.state.progress=self.progress;this.scene.setProgress(self.progress);}});
    this.cardTweens=gsap.utils.toArray('[data-road-segment]',this.section).map(card=>gsap.fromTo(card,{autoAlpha:0,y:46},{autoAlpha:1,y:0,duration:.72,ease:'power2.out',scrollTrigger:{trigger:card,start:'top 84%',end:'top 52%',toggleActions:'play none none reverse'}}));
    return this;
  }
  refresh(){ScrollTrigger.refresh();}
  destroy(){this.cardTweens.forEach(tween=>{tween.scrollTrigger?.kill();tween.kill();});this.visibilityTrigger?.kill();this.trigger?.kill();this.tween?.kill();}
}
