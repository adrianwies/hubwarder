const whatsappMarkup = `
  <a
    class="whatsapp-float"
    data-label="Contacta con un asesor"
    href="https://wa.me/?text=Hola%2C%20quisiera%20hablar%20con%20un%20asesor%20de%20HUB-WARDER%20sobre%20mi%20pr%C3%B3xima%20importaci%C3%B3n."
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contactar a HUB-WARDER por WhatsApp"
  >
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16.04 3A12.83 12.83 0 0 0 5.02 22.4L3.3 28.7l6.45-1.69A12.84 12.84 0 1 0 16.04 3Zm0 23.5c-1.96 0-3.88-.54-5.54-1.55l-.4-.24-3.82 1 1.02-3.72-.26-.42A10.65 10.65 0 1 1 16.04 26.5Zm5.84-7.97c-.32-.16-1.9-.94-2.2-1.05-.3-.1-.5-.16-.72.16-.21.32-.83 1.05-1.02 1.27-.19.21-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.59a9.63 9.63 0 0 1-1.78-2.21c-.19-.32-.02-.5.14-.66.14-.14.32-.38.48-.56.16-.19.21-.32.32-.54.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.99-2.37-.26-.63-.52-.54-.72-.55h-.61c-.21 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.69 0 1.58 1.16 3.11 1.32 3.33.16.21 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.25 1.48.21 2.03.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.62-.38Z" />
    </svg>
  </a>`;

export const mountWhatsApp = () => {
  if (document.querySelector('.whatsapp-float')) return;
  document.body.insertAdjacentHTML('beforeend', whatsappMarkup);
};