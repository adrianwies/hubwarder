import gsap from 'gsap';

export async function runLoader(criticalPromise){
  const loader=document.querySelector('#loader'), value=loader.querySelector('[data-loader-value]'), rail=loader.querySelector('.loader__rail i');
  const state={value:0};
  const tween=gsap.to(state,{value:92,duration:1.35,ease:'power2.out',onUpdate(){value.textContent=Math.round(state.value);gsap.set(rail,{scaleX:state.value/100});}});
  await Promise.all([criticalPromise,new Promise(r=>setTimeout(r,650))]); tween.kill();
  return new Promise(resolve=>gsap.to(state,{value:100,duration:.35,ease:'power1.out',onUpdate(){value.textContent=Math.round(state.value);gsap.set(rail,{scaleX:state.value/100});},onComplete(){gsap.to(loader,{clipPath:'inset(0 0 100% 0)',duration:.9,ease:'power4.inOut',onComplete(){loader.remove();resolve();}});}}));
}
