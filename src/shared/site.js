import './site.css';
import './section-title.js';
import './i18n.js';
import './mobile-menu.js';

const sharedHero=document.querySelector('.inner-page:not(.contact-page) .page-hero');
if(sharedHero){
  const heroCopy=sharedHero.querySelector('.services-hero__copy,.platform-hero__copy,.container');
  const heroItems=heroCopy?[...heroCopy.children].filter(item=>item.matches('.eyebrow,h1,p:not(.eyebrow),.services-hero__actions,.platform-hero__actions')):[];
  heroItems.forEach((item,index)=>{
    item.classList.add('hero-intro-item');
    item.style.setProperty('--hero-intro-order',index);
  });
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    sharedHero.classList.add('is-hero-ready');
  }else{
    requestAnimationFrame(()=>requestAnimationFrame(()=>sharedHero.classList.add('is-hero-ready')));
  }
}
const header=document.querySelector('.site-header');const onScroll=()=>header?.classList.toggle('is-scrolled',scrollY>16);onScroll();addEventListener('scroll',onScroll,{passive:true});document.querySelectorAll('[data-year]').forEach(n=>n.textContent=new Date().getFullYear());document.querySelectorAll('form[data-demo-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const message=form.querySelector('[data-form-message]');if(message)message.textContent='Gracias. Hemos recibido tus datos y un asesor continuarÃ¡ contigo.';}));

