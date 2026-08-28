import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { REDUCED_MOTION } from '../config.js';

export function initLenis(){
  if(REDUCED_MOTION) return null;
  const lenis=new Lenis({duration:1.15,smoothWheel:true,wheelMultiplier:.9,touchMultiplier:1.05});
  lenis.on('scroll',ScrollTrigger.update);
  const tick=time=>lenis.raf(time*1000);
  gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
  return {lenis,destroy(){gsap.ticker.remove(tick);lenis.destroy();}};
}
