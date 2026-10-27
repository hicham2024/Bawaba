(() => {
  const normalizedPath = location.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  const excluded = [
    '/', '/about', '/contact', '/livres', '/acheter',
    '/acheter-recherche', '/merci', '/admin-wero.html',
    '/admin-bank-transfer.html', '/admin-books.html'
  ];
  if (excluded.includes(normalizedPath) || normalizedPath.startsWith('/admin-')) return;
  if (document.querySelector('.article-share')) return;

  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  const url = canonical || `${location.origin}${location.pathname}`;
  const title = document.querySelector('meta[property="og:title"]')?.content || document.title;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedMessage = encodeURIComponent(`${title} — ${url}`);

  const lang = (document.documentElement.lang || 'ar').toLowerCase().split('-')[0];
  const translations = {
    ar: {heading:'شارك هذا المقال',hint:'ساعد القراء على الوصول إلى هذا البحث.',whatsapp:'واتساب',facebook:'فيسبوك',x:'منصة X',linkedin:'لينكدإن',telegram:'تيليغرام',copy:'نسخ الرابط',copied:'تم نسخ رابط المقال.',native:'مشاركة عبر الهاتف',failed:'تعذّرت المشاركة. يمكنك نسخ الرابط.',shareVia:'مشاركة المقال عبر '},
    fr: {heading:'Partager cet article',hint:'Aidez les lecteurs à découvrir cette analyse.',whatsapp:'WhatsApp',facebook:'Facebook',x:'X',linkedin:'LinkedIn',telegram:'Telegram',copy:'Copier le lien',copied:'Lien de l’article copié.',native:'Partager depuis cet appareil',failed:'Le partage a échoué. Vous pouvez copier le lien.',shareVia:'Partager l’article sur '},
    es: {heading:'Compartir este artículo',hint:'Ayuda a otros lectores a descubrir este análisis.',whatsapp:'WhatsApp',facebook:'Facebook',x:'X',linkedin:'LinkedIn',telegram:'Telegram',copy:'Copiar enlace',copied:'Enlace del artículo copiado.',native:'Compartir desde este dispositivo',failed:'No se pudo compartir. Puedes copiar el enlace.',shareVia:'Compartir el artículo en '},
    en: {heading:'Share this article',hint:'Help readers discover this analysis.',whatsapp:'WhatsApp',facebook:'Facebook',x:'X',linkedin:'LinkedIn',telegram:'Telegram',copy:'Copy link',copied:'Article link copied.',native:'Share from this device',failed:'Sharing failed. You can copy the link.',shareVia:'Share article on '}
  };
  const t = translations[lang] || translations.ar;

  const networks = [
    ['whatsapp', 'WA', t.whatsapp, `https://wa.me/?text=${encodedMessage}`],
    ['facebook', 'f', t.facebook, `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`],
    ['x', 'X', t.x, `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`],
    ['linkedin', 'in', t.linkedin, `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`],
    ['telegram', 'TG', t.telegram, `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`]
  ];

  const panel = document.createElement('aside');
  panel.className = 'article-share';
  panel.setAttribute('aria-labelledby', 'articleShareTitle');
  panel.innerHTML = `
    <div class="article-share__head">
      <div>
        <h2 class="article-share__title" id="articleShareTitle">${t.heading}</h2>
        <p class="article-share__hint">${t.hint}</p>
      </div>
    </div>
    <div class="article-share__links">
      ${networks.map(([network, mark, label, href]) => `<a class="article-share__link" data-network="${network}" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${t.shareVia}${label}"><span class="article-share__mark" aria-hidden="true">${mark}</span>${label}</a>`).join('')}
      <button class="article-share__button" type="button" data-copy-link><span class="article-share__mark" aria-hidden="true">↗</span>${t.copy}</button>
    </div>
    <p class="article-share__status" role="status" aria-live="polite"></p>`;

  const footer = document.querySelector('footer');
  if (footer) footer.before(panel);
  else (document.querySelector('main') || document.body).append(panel);

  const status = panel.querySelector('.article-share__status');
  panel.querySelector('[data-copy-link]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(url);
      status.textContent = t.copied;
    } catch {
      const input = document.createElement('input');
      input.value = url;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.append(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      status.textContent = t.copied;
    }
  });

  if (navigator.share) {
    const button = document.createElement('button');
    button.className = 'article-share__button';
    button.type = 'button';
    button.dataset.nativeShare = '';
    button.innerHTML = '<span class="article-share__mark" aria-hidden="true">↗</span>' + t.native;
    button.addEventListener('click', async () => {
      try { await navigator.share({ title, url }); } catch (error) {
        if (error?.name !== 'AbortError') status.textContent = t.failed;
      }
    });
    panel.querySelector('.article-share__links').prepend(button);
  }
})();
