const sectionHighlights = new Map([
  ['Nos adaptamos a tu operación, no al revés.', 'operación, no al revés.'],
  ['Profesionales cerca de cada decisión.', 'de cada decisión.'],
  ['Una sola gestión para toda la cadena.', 'para toda la cadena.'],
  ['Visibilidad en cada hito.', 'en cada hito.'],
  ['Seguimiento simple. Datos confiables.', 'Datos confiables.'],
  ['Conecta con un especialista.', 'con un especialista.']
]);

document.querySelectorAll('.section-head h2').forEach(title => {
  const fullTitle = title.textContent.trim();
  const highlight = sectionHighlights.get(fullTitle);
  if (!highlight) return;

  title.textContent = fullTitle.slice(0, -highlight.length).trimEnd();
  const accent = document.createElement('span');
  accent.className = 'section-accent';
  accent.textContent = highlight;
  title.append(accent);
});
