(() => {
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const excluded = [
    '/', '/about', '/contact', '/livres.html', '/acheter.html',
    '/acheter-recherche.html', '/merci.html', '/admin-wero.html',
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

  const networks = [
    ['whatsapp', 'WA', 'واتساب', `https://wa.me/?text=${encodedMessage}`],
    ['facebook', 'f', 'فيسبوك', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`],
    ['x', 'X', 'منصة X', `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`],
    ['linkedin', 'in', 'لينكدإن', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`],
    ['telegram', 'TG', 'تيليغرام', `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`]
  ];

  const panel = document.createElement('aside');
  panel.className = 'article-share';
  panel.setAttribute('aria-labelledby', 'articleShareTitle');
  panel.innerHTML = `
    <div class="article-share__head">
      <div>
        <h2 class="article-share__title" id="articleShareTitle">شارك هذا المقال</h2>
        <p class="article-share__hint">ساعد القراء على الوصول إلى هذا البحث.</p>
      </div>
    </div>
    <div class="article-share__links">
      ${networks.map(([network, mark, label, href]) => `<a class="article-share__link" data-network="${network}" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="مشاركة المقال عبر ${label}"><span class="article-share__mark" aria-hidden="true">${mark}</span>${label}</a>`).join('')}
      <button class="article-share__button" type="button" data-copy-link><span class="article-share__mark" aria-hidden="true">↗</span>نسخ الرابط</button>
    </div>
    <p class="article-share__status" role="status" aria-live="polite"></p>`;

  const footer = document.querySelector('footer');
  if (footer) footer.before(panel);
  else (document.querySelector('main') || document.body).append(panel);

  const status = panel.querySelector('.article-share__status');
  panel.querySelector('[data-copy-link]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(url);
      status.textContent = 'تم نسخ رابط المقال.';
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
      status.textContent = 'تم نسخ رابط المقال.';
    }
  });

  if (navigator.share) {
    const button = document.createElement('button');
    button.className = 'article-share__button';
    button.type = 'button';
    button.dataset.nativeShare = '';
    button.innerHTML = '<span class="article-share__mark" aria-hidden="true">↗</span>مشاركة عبر الهاتف';
    button.addEventListener('click', async () => {
      try { await navigator.share({ title, url }); } catch (error) {
        if (error?.name !== 'AbortError') status.textContent = 'تعذّرت المشاركة. يمكنك نسخ الرابط.';
      }
    });
    panel.querySelector('.article-share__links').prepend(button);
  }
})();
