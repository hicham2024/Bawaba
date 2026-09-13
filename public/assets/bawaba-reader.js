(() => {
  const article = document.querySelector('main, .page, article, .content');
  if (!article || document.querySelector('[data-bawaba-reader]')) return;
  const headings = [...article.querySelectorAll('h2')].filter((heading) => heading.textContent.trim());
  if (headings.length < 3) return;

  const style = document.createElement('style');
  style.textContent = `
    .bawaba-progress{position:fixed;top:0;inset-inline:0;height:4px;background:transparent;z-index:120;pointer-events:none}
    .bawaba-progress span{display:block;width:0;height:100%;background:#d8a737;transition:width .12s linear}
    .bawaba-reader-toc{position:fixed;top:92px;inset-inline-end:18px;z-index:45;width:min(280px,calc(100vw - 36px));background:#fffdf8;border:1px solid #ded2bf;border-radius:14px;box-shadow:0 14px 38px rgba(23,37,31,.14);overflow:hidden}
    .bawaba-toc-toggle{width:100%;min-height:46px;border:0;background:#0b3b2e;color:#fff;padding:10px 14px;font:700 .82rem Tahoma,Arial,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px}
    .bawaba-toc-list{max-height:56vh;overflow:auto;padding:8px 12px 12px;margin:0;list-style:none}
    .bawaba-toc-list[hidden]{display:none}
    .bawaba-toc-list li{margin:0;border-bottom:1px solid #eee5d8}
    .bawaba-toc-list li:last-child{border:0}
    .bawaba-toc-list a{display:block;padding:9px 3px;color:#28463a!important;text-decoration:none!important;font:700 .74rem/1.65 Tahoma,Arial,sans-serif}
    .bawaba-toc-list a[aria-current=true]{color:#8b661e!important}
    @media(max-width:1100px){.bawaba-reader-toc{top:auto;bottom:18px;inset-inline:18px;width:auto}.bawaba-toc-list{max-height:42vh}}
    @media(prefers-reduced-motion:reduce){.bawaba-progress span{transition:none}}
  `;
  document.head.appendChild(style);

  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = 'section-' + (index + 1);
  });

  const progress = document.createElement('div');
  progress.className = 'bawaba-progress';
  progress.dataset.bawabaReader = '';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';

  const toc = document.createElement('aside');
  toc.className = 'bawaba-reader-toc';
  toc.dataset.bawabaReader = '';
  toc.setAttribute('aria-label', 'فهرس المقال');
  toc.innerHTML = `<button class="bawaba-toc-toggle" type="button" aria-expanded="false">فهرس المقال <span aria-hidden="true">عرض</span></button><ol class="bawaba-toc-list" hidden>${headings.map((heading) => `<li><a href="#${heading.id}">${heading.textContent.trim()}</a></li>`).join('')}</ol>`;
  document.body.append(progress, toc);

  const toggle = toc.querySelector('.bawaba-toc-toggle');
  const list = toc.querySelector('.bawaba-toc-list');
  toggle.addEventListener('click', () => {
    const open = list.hidden;
    list.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? 'إخفاء' : 'عرض';
  });

  const links = [...toc.querySelectorAll('a')];
  links.forEach((link) => link.addEventListener('click', () => {
    if (matchMedia('(max-width:1100px)').matches) {
      list.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('span').textContent = 'عرض';
    }
  }));

  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.firstElementChild.style.width = Math.min(100, Math.max(0, scrollY / max * 100)) + '%';
    let current = headings[0].id;
    headings.forEach((heading) => {
      if (heading.getBoundingClientRect().top <= 150) current = heading.id;
    });
    links.forEach((link) => link.setAttribute('aria-current', String(link.hash === '#' + current)));
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();
