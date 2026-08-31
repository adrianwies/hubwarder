import './footer.css';

export const footerMarkup = () => `
  <footer class="hub-footer">
    <div class="hub-footer__main container">
      <a class="hub-footer__brand" href="/" aria-label="HUB-WARDER, inicio">
        <img src="/images/logo-hub-blanco.png" alt="HUB-WARDER">
        <span>Logística internacional<br>clara, visible y conectada.</span>
      </a>
      <div class="hub-footer__nav">
        <nav aria-label="Empresa"><small>Empresa</small><a href="/nosotros/">Nosotros</a><a href="/contacto/">Contacto</a></nav>
        <nav aria-label="Soluciones"><small>Soluciones</small><a href="/servicios/">Servicios</a><a href="/plataforma/">Plataforma</a></nav>
        <nav aria-label="Acceso"><small>Acceso</small><a href="/iniciar-sesion/">Iniciar sesión</a><a href="/registrarse/">Registrarse</a></nav>
      </div>
      <div class="hub-footer__contact"><small>Hablemos</small><a href="mailto:operaciones@hubwarder.com">operaciones@hubwarder.com</a><a href="/contacto/">Iniciar una conversación <b>↗</b></a></div>
    </div>
    <div class="hub-footer__bottom container"><span>© <b data-year></b> HUB-WARDER</span><span>Importación · Logística · Aduanas</span><a href="#top">Volver arriba ↑</a></div>
  </footer>`;

export function mountFooter(target=document.querySelector('[data-footer]')){
  if(!target)return;
  target.innerHTML=footerMarkup();
  target.querySelectorAll('[data-year]').forEach(node=>node.textContent=new Date().getFullYear());
}
