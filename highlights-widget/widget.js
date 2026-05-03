/*!
 * EuGrifo
 * Exibe seu feed de destaques em qualquer site
 *
 * Baseado no Uoshi Highlights
 * oieuoshi.vercel.app/blog/misc/porque-eu-fiz-uma-extensao-pra-salvar-textos-destacados
 *
 * Como usar:
 *   <div id="meus-highlights"></div>
 *   <script src="widget.js"
 *     data-owner="seu-usuario-github"
 *     data-repo="seu-repositorio"
 *     data-file="lib/highlights.json"
 *     data-token="ghp_seu_token_readonly"   <- opcional, só pra repos privados
 *     data-accent="#f83735"                 <- cor principal
 *     data-theme="light"                    <- light | dark
 *     data-lang="pt"                        <- pt | en
 *     data-target="meus-highlights">        <- id do container
 *   </script>
 */
(function () {
  'use strict';

  const script =
    document.currentScript ||
    document.querySelector('script[data-owner]');

  const cfg = {
    owner:  script?.getAttribute('data-owner')  || '',
    repo:   script?.getAttribute('data-repo')   || '',
    file:   script?.getAttribute('data-file')   || 'lib/highlights.json',
    token:  script?.getAttribute('data-token')  || '',
    target: script?.getAttribute('data-target') || 'highlights-widget',
    accent: script?.getAttribute('data-accent') || '#f83735',
    theme:  script?.getAttribute('data-theme')  || 'light',
    lang:   script?.getAttribute('data-lang')   || 'pt',
  };

  // i18n

  const copy = {
    pt: {
      loading:     'Carregando destaques…',
      empty:       'Nenhum destaque encontrado.',
      noMatch:     'Nenhum resultado para esta busca.',
      search:      'Buscar por texto, título ou tag…',
      tags:        'Tags',
      tagsActive:  'Tags',
      credit:      'feito com eugrifo',
      error:       'Não foi possível carregar os destaques.',
      note:        'nota',
      notes:       'notas',
      close:       'fechar ↑',
      more:        'ver mais',
      remaining:   'restante',
      remainingPl: 'restantes',
    },
    en: {
      loading:     'Loading highlights…',
      empty:       'No highlights yet.',
      noMatch:     'No results for this search.',
      search:      'Search highlights…',
      tags:        'Tags',
      tagsActive:  'Tags',
      credit:      'made with eugrifo',
      error:       'Could not load highlights.',
      note:        'note',
      notes:       'notes',
      close:       'close ↑',
      more:        'load more',
      remaining:   'remaining',
      remainingPl: 'remaining',
    },
  };
  const t = copy[cfg.lang] || copy.pt;

  // Paleta de cores (igual ao original)

  const COLOR_BORDER = {
    yellow: '#fddf8e',
    green:  '#5CE65C',
    blue:   '#82a9f5',
    pink:   '#ffc0cb',
  };

  const COLOR_BG_LIGHT = {
    yellow: 'rgba(253,223,142,0.25)',
    green:  'rgba(92,230,92,0.15)',
    blue:   'rgba(130,169,245,0.2)',
    pink:   'rgba(255,192,203,0.25)',
  };

  const COLOR_BG_DARK = {
    yellow: 'rgba(253,223,142,0.1)',
    green:  'rgba(92,230,92,0.08)',
    blue:   'rgba(130,169,245,0.1)',
    pink:   'rgba(255,192,203,0.1)',
  };

  // CSS

  const isDark = cfg.theme === 'dark';

  const CSS = `
    @import url("https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

    .hw {
      --hw-accent:  ${cfg.accent};
      --hw-bg:      ${isDark ? '#191919' : '#ffffff'};
      --hw-surface: ${isDark ? '#222222' : '#fafafa'};
      --hw-border:  ${isDark ? '#555555' : '#dddddd'};
      --hw-text:    ${isDark ? '#ffffff' : '#000000'};
      --hw-muted:   ${isDark ? '#999999' : '#777777'};
      --hw-font-s:  12px;
      --hw-font-m:  16px;
      --hw-radius:  6px;

      font-family: 'Rubik', sans-serif;
      color: var(--hw-text);
      background: var(--hw-bg);
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }
    .hw *, .hw *::before, .hw *::after { box-sizing: border-box; }

    /* busca */
    .hw-search-wrap { margin-bottom: 1rem; }

    .hw-search {
      width: 100%;
      padding: 0.7rem 0.9rem;
      border: 3px solid var(--hw-text);
      border-radius: var(--hw-radius);
      font-size: var(--hw-font-m);
      font-family: 'Rubik', sans-serif;
      background: var(--hw-bg);
      color: var(--hw-text);
      outline: none;
      transition: border-color 0.15s;
    }
    .hw-search::placeholder { color: var(--hw-muted); }
    .hw-search:focus { border-color: var(--hw-muted); }

    /* toggle de tags */
    .hw-tags-toggle-wrap { margin-bottom: 0.75rem; }

    .hw-tags-toggle {
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-s);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: transparent;
      border: 1px solid var(--hw-border);
      border-radius: 4px;
      padding: 0.3rem 0.75rem;
      cursor: pointer;
      color: var(--hw-muted);
      transition: border-color 0.15s, color 0.15s;
    }
    .hw-tags-toggle:hover { border-color: var(--hw-text); color: var(--hw-text); }
    .hw-tags-toggle.has-active {
      background: var(--hw-text);
      color: var(--hw-bg);
      border-color: var(--hw-text);
    }

    /* nuvem de tags */
    .hw-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 1.5rem;
    }
    .hw-tags.hw-tags-hidden { display: none; }

    .hw-tag {
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-s);
      font-weight: normal;
      color: var(--hw-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      border: 1px solid var(--hw-border);
      padding: 0.15rem 0.55rem;
      border-radius: 4px;
      cursor: pointer;
      background: none;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .hw-tag:hover,
    .hw-tag.hw-tag-active {
      border-color: var(--hw-text);
      background: var(--hw-text);
      color: var(--hw-bg);
    }

    /* cards */
    .hw-list { display: flex; flex-direction: column; }

    .hw-article {
      border: 3px solid var(--hw-border);
      border-radius: var(--hw-radius);
      overflow: hidden;
      margin-bottom: 1.5rem;
      transition: border-color 0.2s;
    }
    .hw-article:hover { border-color: #aaa; }

    /* cabeçalho */
    .hw-article-head {
      display: flex;
      align-items: flex-start;
      gap: 0.9rem;
      padding: 1.1rem 1.2rem;
      cursor: pointer;
      user-select: none;
    }

    .hw-favicon { flex-shrink: 0; width: 28px; height: 28px; margin-top: 2px; }
    .hw-favicon img { width: 28px; height: 28px; border-radius: 4px; margin: 0; display: block; }

    .hw-article-main { flex: 1; min-width: 0; }

    .hw-article-title {
      font-family: 'Rubik', sans-serif;
      font-weight: 700;
      font-size: var(--hw-font-m);
      color: var(--hw-text);
      text-decoration: none;
      display: block;
      margin-bottom: 0.25rem;
      line-height: 1.4;
    }
    .hw-article-title:hover { text-decoration: underline; }

    .hw-article-hostname {
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-s);
      color: var(--hw-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .hw-article-date {
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-s);
      color: var(--hw-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-top: 0.15rem;
    }

    .hw-card-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.5rem; }

    .hw-card-tag {
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-s);
      font-weight: normal;
      color: var(--hw-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      border: 1px solid var(--hw-border);
      padding: 0.15rem 0.55rem;
      border-radius: 4px;
      cursor: pointer;
      background: none;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .hw-card-tag:hover,
    .hw-card-tag.hw-tag-active {
      border-color: var(--hw-text);
      background: var(--hw-text);
      color: var(--hw-bg);
    }

    /* contador + chevron */
    .hw-article-aside {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.4rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .hw-article-count {
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-s);
      color: var(--hw-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    .hw-chevron { font-size: 0.7rem; color: var(--hw-muted); transition: transform 0.2s; }
    .hw-article.hw-open .hw-chevron { transform: rotate(180deg); }

    /* body colapsável */
    .hw-article-body {
      display: none;
      border-top: 1px solid var(--hw-border);
      padding: 1.2rem;
      background: var(--hw-surface);
    }
    .hw-article.hw-open .hw-article-body { display: block; }

    /* page comment */
    .hw-page-comment {
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-m);
      font-style: italic;
      line-height: 1.65;
      color: ${isDark ? '#bbb' : '#555'};
      border-left: 3px solid var(--hw-border);
      padding: 0.5rem 0 0.5rem 1rem;
      margin-bottom: 1.5rem;
    }

    /* highlights */
    .hw-highlights { display: flex; flex-direction: column; }

    .hw-hl {
      margin-bottom: 1.2rem;
      padding: 0.8rem 1rem;
      border-radius: 4px;
      border-left: 3px solid transparent;
    }
    .hw-hl:last-child { margin-bottom: 0; }

    .hw-hl-text {
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-m);
      line-height: 1.65;
      color: var(--hw-text);
      margin: 0;
    }
    .hw-hl-note {
      margin: 0.6rem 0 0;
      padding-top: 0.6rem;
      border-top: 1px solid var(--hw-border);
      font-family: 'Rubik', sans-serif;
      font-size: var(--hw-font-s);
      color: var(--hw-muted);
    }

    /* botão fechar */
    .hw-hide-btn {
      display: inline-block;
      margin-top: 1.2rem;
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-s);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--hw-muted);
      background: transparent;
      border: 1px solid var(--hw-border);
      border-radius: 4px;
      padding: 0.3rem 0.75rem;
      cursor: pointer;
      width: auto;
      transition: border-color 0.15s, color 0.15s;
    }
    .hw-hide-btn:hover { border-color: var(--hw-text); color: var(--hw-text); }

    /* ver mais */
    .hw-more-btn {
      display: block;
      width: 100%;
      padding: 0.7rem 1rem;
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-s);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--hw-muted);
      background: transparent;
      border: 1px solid var(--hw-border);
      border-radius: 4px;
      cursor: pointer;
      text-align: center;
      transition: border-color 0.15s, color 0.15s;
    }
    .hw-more-btn:hover { border-color: var(--hw-text); color: var(--hw-text); }

    /* estados */
    .hw-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--hw-muted);
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-m);
      font-style: italic;
    }

    /* rodapé */
    .hw-footer {
      margin-top: 20px;
      text-align: right;
      font-family: 'Merriweather', serif;
      font-size: var(--hw-font-s);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--hw-muted);
      opacity: .5;
    }
    .hw-footer a { color: inherit; text-decoration: none; }
    .hw-footer a:hover { opacity: 1; text-decoration: underline; }
  `;

  // Helpers

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hostname(url) {
    try { return new URL(url).hostname; } catch { return url; }
  }

  // Fetch

  async function fetchData() {
    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (cfg.token) headers.Authorization = `Bearer ${cfg.token}`;

    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.file}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      if (res.status === 404) throw new Error('Arquivo não encontrado. Verifique as configurações do widget.');
      if (res.status === 401) throw new Error('Token inválido ou repositório privado sem token.');
      throw new Error(`Erro ${res.status} ao buscar os destaques.`);
    }

    const data = await res.json();
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(data.content), c => c.charCodeAt(0))
    );
    return JSON.parse(decoded);
  }

  // Render

  function render(root, raw) {
    const articles = Object.entries(raw)
      .map(([url, article]) => ({ url, ...article }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (articles.length === 0) {
      root.innerHTML = `<div class="hw-state">📚 ${t.empty}</div>`;
      return;
    }

    const allTags = [...new Set(articles.flatMap(a => a.tags || []))].sort();

    let activeTags  = new Set();
    let searchTerm  = '';
    let tagsVisible = false;
    let visiveis    = 10;

    function filtered() {
      return articles.filter(a => {
        if (activeTags.size > 0) {
          const at = new Set(a.tags || []);
          for (const tag of activeTags) { if (!at.has(tag)) return false; }
        }
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const inTitle = (a.title || '').toLowerCase().includes(q);
          const inHl    = (a.highlights || []).some(h =>
            (h.highlight || '').toLowerCase().includes(q) ||
            (h.highlight_note || '').toLowerCase().includes(q)
          );
          if (!inTitle && !inHl) return false;
        }
        return true;
      });
    }

    function articleHTML(a, idx) {
      const host    = hostname(a.url);
      const favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
      const date    = a.date
        ? new Date(a.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
        : '';
      const count   = (a.highlights || []).length;

      const highlightsHTML = (a.highlights || []).map(h => {
        const color  = (h.color || 'yellow').toLowerCase();
        const border = COLOR_BORDER[color] || cfg.accent;
        const bg     = isDark
          ? (COLOR_BG_DARK[color]  || 'rgba(255,255,255,0.05)')
          : (COLOR_BG_LIGHT[color] || 'rgba(0,0,0,0.03)');
        return `
          <div class="hw-hl" style="border-left-color:${border};background:${bg}">
            <p class="hw-hl-text">${esc(h.highlight)}</p>
            ${h.highlight_note ? `<div class="hw-hl-note">${esc(h.highlight_note)}</div>` : ''}
          </div>`;
      }).join('');

      const tagsHTML = (a.tags || []).map(tag =>
        `<button class="hw-card-tag${activeTags.has(tag) ? ' hw-tag-active' : ''}"
                 data-tag="${esc(tag)}">${esc(tag)}</button>`
      ).join('');

      return `
        <article class="hw-article" id="hw-card-${idx}">
          <div class="hw-article-head">
            <div class="hw-favicon">
              <img src="${esc(favicon)}" alt="" loading="lazy" onerror="this.style.display='none'">
            </div>
            <div class="hw-article-main">
              <a class="hw-article-title"
                 href="${esc(a.url)}" target="_blank" rel="noopener noreferrer"
                 onclick="event.stopPropagation()">
                ${esc(a.title || a.url)}
              </a>
              <div class="hw-article-hostname">${esc(host)}</div>
              ${date ? `<div class="hw-article-date">${esc(date)}</div>` : ''}
              ${tagsHTML ? `<div class="hw-card-tags">${tagsHTML}</div>` : ''}
            </div>
            <div class="hw-article-aside">
              <span class="hw-article-count">${count} ${count !== 1 ? t.notes : t.note}</span>
              <span class="hw-chevron">▼</span>
            </div>
          </div>
          <div class="hw-article-body">
            ${a.page_comment ? `<div class="hw-page-comment">${esc(a.page_comment)}</div>` : ''}
            <div class="hw-highlights">${highlightsHTML}</div>
            <button class="hw-hide-btn">${t.close}</button>
          </div>
        </article>`;
    }

    function refreshList() {
      const list  = root.querySelector('.hw-list');
      const items = filtered();

      if (!items.length) {
        list.innerHTML = `<div class="hw-state">🔍 ${t.noMatch}</div>`;
        return;
      }

      const pagina = items.slice(0, visiveis);
      list.innerHTML = pagina.map((a, i) => articleHTML(a, i)).join('');

      // Toggle abrir/fechar
      list.querySelectorAll('.hw-article-head').forEach(head => {
        head.addEventListener('click', () => head.closest('.hw-article').classList.toggle('hw-open'));
      });

      // Botão fechar
      list.querySelectorAll('.hw-hide-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          btn.closest('.hw-article').classList.remove('hw-open');
        });
      });

      // Tags inline nos cards
      list.querySelectorAll('.hw-card-tag').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const tag = btn.dataset.tag;
          if (activeTags.has(tag)) activeTags.delete(tag);
          else activeTags.add(tag);
          refreshTagButtons();
          visiveis = 10;
          refreshList();
        });
      });

      // Ver mais
      if (visiveis < items.length) {
        const restantes = items.length - visiveis;
        const btn = document.createElement('button');
        btn.className = 'hw-more-btn';
        btn.textContent = `${t.more} (${restantes} ${restantes !== 1 ? t.remainingPl : t.remaining})`;
        btn.addEventListener('click', () => { visiveis += 10; refreshList(); });
        list.appendChild(btn);
      }
    }

    function refreshTagButtons() {
      root.querySelectorAll('.hw-tag').forEach(btn => {
        btn.classList.toggle('hw-tag-active', activeTags.has(btn.dataset.tag));
      });
      const toggle = root.querySelector('.hw-tags-toggle');
      const count  = activeTags.size;
      toggle.textContent = count > 0
        ? `${t.tagsActive} ▴ (${count}) ✕`
        : (tagsVisible ? `${t.tags} ▴` : `${t.tags} ▾`);
      toggle.classList.toggle('has-active', count > 0);
    }

    function refreshTagsVisibility() {
      root.querySelector('.hw-tags').classList.toggle('hw-tags-hidden', !tagsVisible);
    }

    const tagButtons = allTags.map(tag =>
      `<button class="hw-tag" data-tag="${esc(tag)}">${esc(tag)}</button>`
    ).join('');

    root.innerHTML = `
      <div class="hw-search-wrap">
        <input class="hw-search" type="search" placeholder="${t.search}" autocomplete="off">
      </div>
      ${allTags.length ? `
        <div class="hw-tags-toggle-wrap">
          <button class="hw-tags-toggle">${t.tags} ▾</button>
        </div>
        <div class="hw-tags hw-tags-hidden">${tagButtons}</div>
      ` : ''}
      <div class="hw-list"></div>
      <div class="hw-footer">
        <a href="https://oieuoshi.vercel.app/blog/misc/porque-eu-fiz-uma-extensao-pra-salvar-textos-destacados"
           target="_blank" rel="noopener">✦ ${t.credit}</a>
      </div>`;

    refreshList();

    // Busca
    root.querySelector('.hw-search').addEventListener('input', e => {
      searchTerm = e.target.value.trim();
      if (searchTerm && activeTags.size > 0) {
        activeTags.clear();
        refreshTagButtons();
      }
      visiveis = 10;
      refreshList();
    });

    // Toggle visibilidade das tags
    root.querySelector('.hw-tags-toggle')?.addEventListener('click', () => {
      if (activeTags.size > 0) {
        activeTags.clear();
        tagsVisible = false;
        refreshTagButtons();
        refreshTagsVisibility();
        visiveis = 10;
        refreshList();
        return;
      }
      tagsVisible = !tagsVisible;
      refreshTagButtons();
      refreshTagsVisibility();
    });

    // Clique nas tags do painel (multi-select)
    root.querySelectorAll('.hw-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        if (activeTags.has(tag)) activeTags.delete(tag);
        else {
          activeTags.add(tag);
          const searchEl = root.querySelector('.hw-search');
          if (searchEl) { searchEl.value = ''; searchTerm = ''; }
        }
        visiveis = 10;
        refreshTagButtons();
        refreshList();
      });
    });
  }

  // Init

  function init() {
    const root = document.getElementById(cfg.target);
    if (!root) {
      console.error(`[Highlights Widget] Container #${cfg.target} não encontrado.`);
      return;
    }

    if (!document.getElementById('hw-styles')) {
      const style = document.createElement('style');
      style.id = 'hw-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    root.className = (root.className + ' hw').trim();
    root.innerHTML = `<div class="hw-state">🌿 ${t.loading}</div>`;

    if (!cfg.owner || !cfg.repo) {
      root.innerHTML = `<div class="hw-state">⚠️ Configure data-owner e data-repo no script.</div>`;
      return;
    }

    fetchData()
      .then(data => render(root, data))
      .catch(err => {
        console.error('[Highlights Widget]', err);
        root.innerHTML = `<div class="hw-state">❌ ${err.message}</div>`;
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
