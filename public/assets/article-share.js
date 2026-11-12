(() => {

  if (!document.getElementById('article-share-modern-style')) {
    const style = document.createElement('style');
    style.id = 'article-share-modern-style';
    style.textContent = `
      .article-share{
        width:min(1180px,calc(100% - 32px));
        margin:56px auto 42px;
        padding:30px;
        border:1px solid rgba(15,59,48,.10);
        border-radius:28px;
        background:
          radial-gradient(circle at 100% 0%,rgba(201,160,74,.10),transparent 34%),
          linear-gradient(145deg,#ffffff 0%,#fbfaf6 100%);
        box-shadow:0 22px 60px rgba(18,48,40,.10);
        position:relative;
        overflow:hidden
      }
      .article-share:before{
        content:"";position:absolute;inset:0 auto 0 0;width:5px;
        background:linear-gradient(180deg,#c9a04a,#0f3b30)
      }
      .article-share__head{
        display:flex;align-items:flex-end;justify-content:space-between;gap:20px;
        margin-bottom:22px
      }
      .article-share__title{
        margin:0;color:#0f3b30;font-size:clamp(24px,2.4vw,34px);line-height:1.2;font-weight:900
      }
      .article-share__hint{
        margin:8px 0 0;color:#6d7772;font-size:14px
      }
      .article-share__links{
        display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px
      }
      .article-share__link,.article-share__button{
        min-height:58px;border-radius:16px;border:1px solid #e6e0d3;background:#fff;
        color:#173029;text-decoration:none;font:800 14px/1.2 Tahoma,Arial,sans-serif;
        display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 14px;
        cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease
      }
      .article-share__link:hover,.article-share__button:hover{
        transform:translateY(-2px);box-shadow:0 10px 24px rgba(18,48,40,.10);border-color:#d3c29a
      }
      .article-share__mark{
        width:30px;height:30px;border-radius:10px;display:grid;place-items:center;
        font:900 12px/1 Arial,sans-serif;background:#f1eee6;color:#0f3b30;flex:0 0 auto
      }
      .article-share__link[data-network="whatsapp"] .article-share__mark{background:#e8f7ed;color:#138a46}
      .article-share__link[data-network="facebook"] .article-share__mark{background:#edf3ff;color:#315fbc}
      .article-share__link[data-network="x"] .article-share__mark{background:#111;color:#fff}
      .article-share__link[data-network="linkedin"] .article-share__mark{background:#eef4ff;color:#0a66c2}
      .article-share__link[data-network="telegram"] .article-share__mark{background:#eaf6ff;color:#2389c9}
      .article-share__button[data-copy-link]{
        background:#0f3b30;color:#fff;border-color:#0f3b30
      }
      .article-share__button[data-copy-link] .article-share__mark{background:#fff;color:#0f3b30}
      .article-share__button[data-native-share]{
        background:linear-gradient(135deg,#c9a04a,#dfc278);color:#173029;border:0
      }
      .article-share__button[data-native-share] .article-share__mark{background:rgba(255,255,255,.72)}
      .article-share__status{
        min-height:20px;margin:14px 2px 0;color:#477267;font-size:13px;font-weight:700
      }
      @media(max-width:1050px){
        .article-share__links{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media(max-width:650px){
        .article-share{width:min(100% - 20px,1180px);margin:38px auto 26px;padding:22px 16px;border-radius:22px}
        .article-share__links{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .article-share__link,.article-share__button{min-height:54px;font-size:13px;padding:9px 10px}
        .article-share__head{margin-bottom:18px}
      }
      @media(max-width:390px){
        .article-share__links{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }
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
    ar: {heading:'شارك البحث',hint:'انشر هذا الملف الموثّق وساعد الآخرين على الوصول إلى مصادره.',whatsapp:'واتساب',facebook:'فيسبوك',x:'منصة X',linkedin:'لينكدإن',telegram:'تيليغرام',copy:'نسخ الرابط',copied:'تم نسخ رابط المقال.',native:'مشاركة عبر الهاتف',failed:'تعذّرت المشاركة. يمكنك نسخ الرابط.',shareVia:'مشاركة المقال عبر '},
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
