import './final-cta.css';

export function mountFinalCta(target=document.querySelector('[data-final-cta]')){
  if(!target)return;
  target.innerHTML=`<section class="home-final-cta"><div class="home-final-cta__rings" aria-hidden="true"><i></i><i></i><i></i></div><div class="container home-reveal"><p class="eyebrow">Tu próxima operación</p><h2>La ruta puede ser compleja.<br><em>Tu experiencia no tiene que serlo.</em></h2><div><p>Cuéntanos qué necesitas importar y construyamos una operación visible, coordinada y preparada para avanzar.</p><a href="/contacto/">Hablar con un especialista <span>→</span></a></div></div></section>`;
}
