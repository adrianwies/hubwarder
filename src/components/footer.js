import './footer.css';

export const footerMarkup = () => `
  <footer class="hub-footer">
    <div class="hub-footer__main container">
      <a class="hub-footer__brand" href="/" aria-label="HUB-WARDER, inicio">
        <img src="/images/logo-hub-blanco.png" alt="HUB-WARDER">
      </a>

      <nav class="hub-footer__column" aria-label="Enlaces">
        <small>Enlaces</small>
        <a href="/">Inicio</a>
        <a href="/nosotros/">Nosotros</a>
        <a href="/servicios/">Servicios</a>
        <a href="/contacto/">Contacto</a>
      </nav>

      <nav class="hub-footer__column" aria-label="Servicios">
        <small>Servicios</small>
        <a href="/servicios/">Soluciones</a>
        <a href="/plataforma/">Plataforma</a>
      </nav>

      <div class="hub-footer__column hub-footer__contact">
        <small>Contacto</small>
        <a href="mailto:informes@hubwarder.com.pe">informes@hubwarder.com.pe</a>
        <a href="/contacto/">Iniciar una conversación <b>↗</b></a>
      </div>

      <div class="hub-footer__column hub-footer__social">
        <small>Síguenos</small>
        <div class="hub-footer__social-icons" aria-label="Redes sociales">
          <span aria-label="Instagram" role="img">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
          </span>
        </div>
        <p>© <b data-year></b> HUB-WARDER.<br>Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>`;

export function mountFooter(target=document.querySelector('[data-footer]')){
  if(!target)return;
  target.innerHTML=footerMarkup();
  target.querySelectorAll('[data-year]').forEach(node=>node.textContent=new Date().getFullYear());
}
