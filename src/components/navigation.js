export function initNavigation(){
  const button=document.querySelector('.nav__menu'),menu=document.querySelector('#menu');
  const close=()=>{menu.classList.remove('is-open');menu.setAttribute('aria-hidden','true');button.setAttribute('aria-expanded','false');};
  button.addEventListener('click',()=>{const open=!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);menu.setAttribute('aria-hidden',String(!open));button.setAttribute('aria-expanded',String(open));});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  return ()=>{close();};
}
