import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class HomeExperience {
  constructor(){this.animations=[];}
  init(){
    document.querySelectorAll('.home-reveal').forEach((element,index)=>{
      const commandReveal=element.closest('.home-command-route');
      const tween=gsap.fromTo(
        element,
        {autoAlpha:0,y:commandReveal?30:48},
        {autoAlpha:1,y:0,duration:commandReveal?1.08:.9,ease:'power3.out',scrollTrigger:{trigger:element,start:commandReveal?'top 92%':'top 86%',once:true},delay:(index%3)*.04}
      );
      this.animations.push(tween);
    });
    const route=document.querySelector('[data-route-progress]');
    if(route){
      const length=route.getTotalLength();
      const points=[...document.querySelectorAll('.home-route__map li')];
      const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const routeDuration=reducedMotion ? .01 : 3.2;
      gsap.set(route,{strokeDasharray:length,strokeDashoffset:length});
      gsap.set(points,{autoAlpha:.28});
      const timeline=gsap.timeline({
        repeat:-1,
        repeatDelay:.65,
        scrollTrigger:{
          trigger:'.home-route',
          start:'top 72%',
          toggleActions:'play pause resume pause',
        },
      });
      timeline
        .set(points,{autoAlpha:.28},0)
        .to(points[0],{autoAlpha:1,duration:.18},0)
        .to(route,{strokeDashoffset:0,duration:routeDuration,ease:'power1.inOut'},0);
      points.slice(1).forEach((point,index)=>{
        timeline.to(point,{autoAlpha:1,duration:.22},routeDuration*((index+1)/3));
      });
      this.animations.push(timeline);
    }
    return this;
  }
  destroy(){this.animations.forEach(animation=>{animation.scrollTrigger?.kill();animation.kill();});}
}
