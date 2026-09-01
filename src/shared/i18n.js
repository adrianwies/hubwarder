import './i18n.css';
const langs=['es','en'],store='hub-warder-language',original=new WeakMap();let words={};
const clean=s=>s.replace(/\s+/g,' ').trim();
const originalAttributes=new WeakMap();
function translate(root=document.body){if(!root)return;const nodes=[];if(root.nodeType===3)nodes.push(root);const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())nodes.push(n);nodes.forEach(n=>{if(!original.has(n))original.set(n,n.nodeValue);const s=original.get(n),k=clean(s);n.nodeValue=words[k]?s.replace(k,words[k]):s});const elements=root.nodeType===1?[root,...root.querySelectorAll('*')]:[...document.querySelectorAll('*')];elements.forEach(el=>{let saved=originalAttributes.get(el);if(!saved){saved={};originalAttributes.set(el,saved)};['placeholder','aria-label','title','alt','data-label','content'].forEach(attr=>{if(!el.hasAttribute(attr))return;if(!(attr in saved))saved[attr]=el.getAttribute(attr);const value=saved[attr];el.setAttribute(attr,words[value]||value)})})}
async function change(lang){lang=langs.includes(lang)?lang:'es';words=lang==='en'?await fetch('/locales/en.json').then(r=>r.json()):{};document.documentElement.lang=lang;localStorage.setItem(store,lang);translate();box.querySelector('[data-language-current]').textContent=lang.toUpperCase();box.querySelectorAll('[data-language-option]').forEach(option=>{const active=option.dataset.languageOption===lang;option.classList.toggle('is-active',active);option.setAttribute('aria-checked',String(active))})}
const box=document.createElement('div');
box.className='language-switcher';
box.innerHTML='<button class="language-switcher__trigger" type="button" aria-haspopup="listbox" aria-expanded="false"><span data-language-current>ES</span><svg viewBox="0 0 12 8" aria-hidden="true"><path d="m1 1 5 5 5-5"/></svg></button><div class="language-switcher__menu" role="listbox" aria-label="Seleccionar idioma"><button type="button" role="option" data-language-option="es">Español</button><button type="button" role="option" data-language-option="en">English</button></div>';
const trigger=box.querySelector('.language-switcher__trigger');
const close=()=>{box.classList.remove('is-open');trigger.setAttribute('aria-expanded','false')};
trigger.onclick=()=>{const open=box.classList.toggle('is-open');trigger.setAttribute('aria-expanded',String(open))};
box.querySelectorAll('[data-language-option]').forEach(option=>option.onclick=()=>{change(option.dataset.languageOption);close()});
document.addEventListener('pointerdown',event=>{if(!box.contains(event.target))close()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
const placeSwitcher=()=>{const auth=document.querySelector('.header__auth');if(auth&&box.parentElement!==auth)auth.append(box);else if(!box.isConnected)document.body.append(box)};
placeSwitcher();
change(localStorage.getItem(store)||(navigator.language.startsWith('en')?'en':'es'));
new MutationObserver(ms=>{ms.forEach(m=>m.addedNodes.forEach(translate));placeSwitcher()}).observe(document.body,{childList:true,subtree:true});