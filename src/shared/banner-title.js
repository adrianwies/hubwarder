const title = document.querySelector('.page-hero h1');

if (title) {
  const highlights = [
    'mueve tu negocio.',
    'de origen a destino.',
    'en un solo lugar.',
    'buena conversación.'
  ];
  const phrase = highlights.find(item => title.textContent.trim().endsWith(item));

  if (phrase) {
    const fullTitle = title.textContent.trim();
    const leadingText = fullTitle.slice(0, -phrase.length);
    title.textContent = leadingText;
    const accent = document.createElement('span');
    accent.className = 'text-gradient';
    accent.textContent = phrase;
    title.append(accent);
  }
}
