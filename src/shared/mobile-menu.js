const menuLinks = [
  ['Inicio', '/'],
  ['Nosotros', '/nosotros/'],
  ['Servicios', '/servicios/'],
  ['Plataforma', '/plataforma/'],
  ['Contacto', '/contacto/']
];

function mountMobileMenu(header){
  if(!header || header.dataset.mobileMenuMounted) return;
  header.dataset.mobileMenuMounted='true';
  const inner=header.querySelector('.header__inner');
  if(!inner) return;

  const button=document.createElement('button');
  button.className='mobile-menu-toggle';
  button.type='button';
  button.setAttribute('aria-label','Abrir menu');
  button.setAttribute('aria-expanded','false');
  button.setAttribute('aria-controls','mobile-navigation');
  button.innerHTML='<span></span><span></span><span></span>';

  const panel=document.createElement('div');
  panel.className='mobile-menu';
  panel.id='mobile-navigation';
  panel.setAttribute('aria-hidden','true');
  const path=location.pathname.replace(/\/+$/,'')||'/';
  panel.innerHTML=`<div class="mobile-menu__backdrop" data-mobile-menu-close></div><div class="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Menu principal"><div class="mobile-menu__top"><span>Explorar HUB-WARDER</span><button type="button" data-mobile-menu-close aria-label="Cerrar menu">&times;</button></div><nav aria-label="Navegacion movil">${menuLinks.map(([label,href],index)=>{const target=href.replace(/\/+$/,'')||'/';return `<a class="${path===target?'active':''}" href="${href}"><small>0${index+1}</small><span>${label}</span><b aria-hidden="true">&#8599;</b></a>`}).join('')}</nav><div class="mobile-menu__actions"><a href="/iniciar-sesion/">Iniciar sesion</a><a class="btn-primary" href="/registrarse/">Registrarse</a></div><p>Importacion inteligente, visible y coordinada.</p></div>`;

  inner.append(button);
  document.body.append(panel);
  const closeButton=panel.querySelector('[data-mobile-menu-close]:last-of-type');
  let previousFocus=null;
  const setOpen=open=>{
    header.classList.toggle('is-mobile-menu-open',open);
    panel.classList.toggle('is-open',open);
    panel.setAttribute('aria-hidden',String(!open));
    button.setAttribute('aria-expanded',String(open));
    button.setAttribute('aria-label',open?'Cerrar menu':'Abrir menu');
    document.documentElement.classList.toggle('has-mobile-menu-open',open);
    if(open){previousFocus=document.activeElement;requestAnimationFrame(()=>closeButton?.focus())}
    else if(previousFocus instanceof HTMLElement) previousFocus.focus();
  };
  button.addEventListener('click',()=>setOpen(!panel.classList.contains('is-open')));
  panel.querySelectorAll('[data-mobile-menu-close]').forEach(node=>node.addEventListener('click',()=>setOpen(false)));
  panel.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('is-open'))setOpen(false)});
  matchMedia('(min-width:1101px)').addEventListener('change',event=>{if(event.matches)setOpen(false)});
}

const mount=()=>document.querySelectorAll('.site-header').forEach(mountMobileMenu);
mount();
new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});