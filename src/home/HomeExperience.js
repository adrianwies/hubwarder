import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class HomeExperience {
  constructor(){this.animations=[];}
  init(){
    document.querySelectorAll('.home-reveal').forEach((element,index)=>{
      const tween=gsap.fromTo(element,{autoAlpha:0,y:48},{autoAlpha:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 86%',once:true},delay:(index%3)*.04});
      this.animations.push(tween);
    });
    const route=document.querySelector('[data-route-progress]');
    if(route){
      const length=route.getTotalLength();
      gsap.set(route,{strokeDasharray:length,strokeDashoffset:length});
      const tween=gsap.to(route,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.home-route',start:'top 70%',end:'bottom 65%',scrub:1}});
      this.animations.push(tween);
    }
    return this;
  }
  destroy(){this.animations.forEach(animation=>{animation.scrollTrigger?.kill();animation.kill();});}
}
