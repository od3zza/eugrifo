/*!
 * eugrifo — Highlights Widget  v4.0
 * Exibe seu feed de destaques em qualquer site.
 *
 * Como usar:
 *   <div id="meus-grifos"></div>
 *   <script
 *     src="https://cdn.jsdelivr.net/gh/od3zza/eugrifo@main/highlights-widget/widget.js"
 *     data-owner="seu-usuario"
 *     data-repo="seu-repositorio"
 *     data-file="eugrifo-highlights.json"
 *     data-token="ghp_token_readonly"   ← opcional, repositórios privados
 *     data-lang="pt"                    ← pt | en
 *     data-target="meus-grifos">
 *   </script>
 *
 * NOTA: O visual é definido inteiramente pelo widget.js hospedado no GitHub.
 * Atualizar o arquivo lá reflete em todos os widgets instalados automaticamente
 * (via jsDelivr CDN, que faz cache por ~24h; force com @sha ou versão pinada).
 */
 
(function () {
  'use strict';

  const script =
    document.currentScript ||
    document.querySelector('script[data-owner]');

  const isDark = (script?.getAttribute('data-theme') || 'light') === 'dark';

  const cfg = {
    owner:   script?.getAttribute('data-owner')   || '',
    repo:    script?.getAttribute('data-repo')    || '',
    file:    script?.getAttribute('data-file')    || 'lib/highlights.json',
    token:   script?.getAttribute('data-token')   || '',
    target:  script?.getAttribute('data-target')  || 'highlights-widget',
    accent:  script?.getAttribute('data-accent')  || '#ffd700',
    theme:   script?.getAttribute('data-theme')   || 'light',
    lang:    script?.getAttribute('data-lang')    || 'pt',
    font:    script?.getAttribute('data-font')    || "'Georgia', 'Times New Roman', serif",
    radius:  script?.getAttribute('data-radius')  || '10px',
    bg:      script?.getAttribute('data-bg')      || (isDark ? '#141414' : '#ffffff'),
    surface: script?.getAttribute('data-surface') || (isDark ? '#1e1e1e' : '#f8f8f6'),
    border:  script?.getAttribute('data-border')  || (isDark ? '#2a2a2a' : '#e8e4df'),
    text:    script?.getAttribute('data-text')    || (isDark ? '#e2ddd8' : '#2a2520'),
    muted:   script?.getAttribute('data-muted')   || (isDark ? '#6b6560' : '#8a8480'),
  };

  // ─── i18n ────────────────────────────────────────────────────────────────────

  const copy = {
    pt: {
      loading:    'Carregando destaques…',
      empty:      'Nenhum destaque encontrado.',
      noMatch:    'Nenhum resultado para esta busca.',
      search:     'Buscar nos destaques…',
      tags:       'filtrar por tag',
      tagsActive: 'tags ativas',
      read:       'ler artigo ↗',
      showHl:     'ver destaques',
      hideHl:     'ocultar destaques',
      credit:     'feito com eugrifo',
      error:      'Não foi possível carregar os destaques.',
    },
    en: {
      loading:    'Loading highlights…',
      empty:      'No highlights yet.',
      noMatch:    'No results for this search.',
      search:     'Search highlights…',
      tags:       'filter by tag',
      tagsActive: 'active tags',
      read:       'read article ↗',
      showHl:     'show highlights',
      hideHl:     'hide highlights',
      credit:     'made with eugrifo',
      error:      'Could not load highlights.',
    },
  };
  const t = copy[cfg.lang] || copy.pt;

  // ─── Paleta de cores ─────────────────────────────────────────────────────────

  const COLOR_MAP = {
    yellow: '#ffd700',
    green:  '#90ee90',
    blue:   '#add8e6',
    pink:   '#ffb6c1',
  };

  // ─── CSS ─────────────────────────────────────────────────────────────────────

  const CSS = `
    .hw {
      --hw-accent:   ${cfg.accent};
      --hw-bg:       ${cfg.bg};
      --hw-surface:  ${cfg.surface};
      --hw-border:   ${cfg.border};
      --hw-text:     ${cfg.text};
      --hw-muted:    ${cfg.muted};
      --hw-radius:   ${cfg.radius};

      font-family: ${cfg.font};
      color: var(--hw-text);
      background: var(--hw-bg);
      line-height: 1.6;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
    .hw *, .hw *::before, .hw *::after { box-sizing: border-box; }

    /* ── controles ── */
    .hw-controls {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 28px;
    }
    .hw-search {
      width: 100%;
      padding: 11px 16px;
      background: var(--hw-surface);
      border: 1px solid var(--hw-border);
      border-radius: var(--hw-radius);
      font-size: 14px;
      font-family: inherit;
      color: var(--hw-text);
      outline: none;
      transition: border-color .2s;
    }
    .hw-search::placeholder { color: var(--hw-muted); }
    .hw-search:focus { border-color: var(--hw-accent); }

    .hw-tags-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .hw-tags-toggle {
      flex-shrink: 0;
      padding: 5px 13px;
      border-radius: 999px;
      border: 1px solid var(--hw-border);
      background: transparent;
      color: var(--hw-muted);
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: all .15s;
      white-space: nowrap;
    }
    .hw-tags-toggle:hover { border-color: var(--hw-accent); color: var(--hw-text); }
    .hw-tags-toggle.has-active {
      background: var(--hw-accent);
      border-color: var(--hw-accent);
      color: #1a1410;
      font-weight: 600;
    }

    .hw-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .hw-tags.hw-tags-hidden { display: none; }

    .hw-tag {
      padding: 5px 14px;
      border-radius: 999px;
      border: 1px solid var(--hw-border);
      background: transparent;
      color: var(--hw-muted);
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: all .15s;
    }
    .hw-tag:hover { border-color: var(--hw-accent); color: var(--hw-text); }
    .hw-tag.hw-tag-active {
      background: var(--hw-accent);
      border-color: var(--hw-accent);
      color: #1a1410;
      font-weight: 600;
    }

    /* ── lista de artigos ── */
    .hw-list { display: flex; flex-direction: column; gap: 12px; }

    .hw-article {
      border: 1px solid var(--hw-border);
      border-radius: var(--hw-radius);
      overflow: hidden;
      transition: box-shadow .15s;
    }
    .hw-article:hover { box-shadow: 0 2px 12px rgba(0,0,0,.07); }

    /* ── cabeçalho do artigo ── */
    .hw-article-head {
      padding: 14px 18px 10px;
      background: var(--hw-surface);
    }

    .hw-article-top {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;
    }

    .hw-article-main { flex: 1; min-width: 0; }

    .hw-article-title {
      margin: 0 0 6px;
      font-size: 15px;
      font-weight: normal;
      font-style: italic;
    }
    .hw-article-title a {
      color: var(--hw-text);
      text-decoration: none;
      pointer-events: all;
    }
    .hw-article-title a:hover { text-decoration: underline; }

    .hw-article-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--hw-muted);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .hw-article-tags { display: flex; gap: 5px; flex-wrap: wrap; }
    .hw-article-tag {
      background: var(--hw-accent);
      color: #1a1410;
      border-radius: 4px;
      padding: 1px 7px;
      font-size: 11px;
      font-weight: 700;
      text-transform: lowercase;
      letter-spacing: .02em;
    }

    /* contador de highlights */
    .hw-article-count {
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--hw-muted);
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* ── botão toggle — ABAIXO do cabeçalho ── */
    .hw-article-footer {
      padding: 0 18px 12px;
      background: var(--hw-surface);
    }
    .hw-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 999px;
      border: 1px solid var(--hw-border);
      background: transparent;
      color: var(--hw-muted);
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      cursor: pointer;
      transition: all .15s;
      user-select: none;
    }
    .hw-toggle-btn:hover {
      border-color: var(--hw-accent);
      color: var(--hw-text);
    }
    .hw-article.hw-open .hw-toggle-btn {
      background: var(--hw-accent);
      border-color: var(--hw-accent);
      color: #1a1410;
      font-weight: 600;
    }
    .hw-chevron {
      font-size: 9px;
      transition: transform .2s;
      display: inline-block;
    }
    .hw-article.hw-open .hw-chevron { transform: rotate(180deg); }

    /* ── corpo colapsável ── */
    .hw-article-body {
      display: none;
      border-top: 1px solid var(--hw-border);
    }
    .hw-article.hw-open .hw-article-body { display: block; }

    /* ── highlights ── */
    .hw-highlights {
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .hw-hl {
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      background: var(--hw-surface);
      border-left: 4px solid var(--hw-accent);
    }
    .hw-hl-text {
      margin: 0;
      font-size: 14px;
      font-style: italic;
      line-height: 1.65;
      color: var(--hw-text);
    }
    .hw-hl-note {
      margin: 8px 0 0;
      padding-top: 8px;
      border-top: 1px solid var(--hw-border);
      font-size: 12px;
      font-style: normal;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--hw-muted);
    }

    /* ── page comment ── */
    .hw-page-comment {
      margin: 0;
      padding: 10px 18px;
      border-top: 1px solid var(--hw-border);
      font-size: 13px;
      font-style: italic;
      color: var(--hw-muted);
    }

    /* ── estados ── */
    .hw-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--hw-muted);
      font-size: 14px;
    }

    /* ── rodapé ── */
    .hw-footer {
      margin-top: 20px;
      text-align: right;
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--hw-muted);
      opacity: .5;
    }
    .hw-footer a { color: inherit; text-decoration: none; }
    .hw-footer a:hover { opacity: 1; text-decoration: underline; }

    /* ── responsivo ── */
    @media (max-width: 480px) {
      .hw-article-head  { padding: 12px 14px 8px; }
      .hw-article-footer { padding: 0 14px 10px; }
      .hw-highlights    { padding: 12px 14px; }
      .hw-article-title { font-size: 14px; }
      .hw-hl-text       { font-size: 13px; }
      .hw-search        { font-size: 16px; /* evita zoom no iOS */ }
    }
  `;

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─── Fetch ───────────────────────────────────────────────────────────────────

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

  // ─── Render ──────────────────────────────────────────────────────────────────

  function render(root, raw) {
    const articles = Object.entries(raw)
      .map(([url, article]) => ({ url, ...article }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (articles.length === 0) {
      root.innerHTML = `<div class="hw-state">📚 ${t.empty}</div>`;
      return;
    }

    const allTags = [...new Set(articles.flatMap(a => a.tags || []))].sort();

    let activeTags = new Set();
    let searchTerm = '';
    let tagsVisible = false;

    function filtered() {
      return articles.filter(a => {
        if (activeTags.size > 0) {
          const articleTags = new Set(a.tags || []);
          for (const tag of activeTags) {
            if (!articleTags.has(tag)) return false;
          }
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
      const highlightsHTML = (a.highlights || []).map(h => {
        const borderColor = COLOR_MAP[h.color] || h.color || cfg.accent;
        return `
          <div class="hw-hl" style="border-left-color:${esc(borderColor)}">
            <p class="hw-hl-text">${esc(h.highlight)}</p>
            ${h.highlight_note ? `<p class="hw-hl-note">${esc(h.highlight_note)}</p>` : ''}
          </div>`;
      }).join('');

      const tagsHTML = (a.tags || []).map(tag =>
        `<span class="hw-article-tag">${esc(tag)}</span>`
      ).join('');

      const count = (a.highlights || []).length;

      return `
        <article class="hw-article" data-idx="${idx}">
          <div class="hw-article-head">
            <div class="hw-article-top">
              <div class="hw-article-main">
                <h3 class="hw-article-title">
                  <a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">
                    ${esc(a.title || a.url)}
                  </a>
                </h3>
                <div class="hw-article-meta">
                  ${a.date ? `<span>${esc(a.date)}</span>` : ''}
                  ${tagsHTML ? `<div class="hw-article-tags">${tagsHTML}</div>` : ''}
                </div>
              </div>
              <span class="hw-article-count">${count} destaque${count !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div class="hw-article-footer">
            <button class="hw-toggle-btn" aria-expanded="false">
              <span class="hw-toggle-label">${t.showHl}</span>
              <span class="hw-chevron">▼</span>
            </button>
          </div>
          <div class="hw-article-body">
            <div class="hw-highlights">${highlightsHTML}</div>
            ${a.page_comment ? `<p class="hw-page-comment">${esc(a.page_comment)}</p>` : ''}
          </div>
        </article>`;
    }

    function refreshList() {
      const list = root.querySelector('.hw-list');
      const items = filtered();
      if (!items.length) {
        list.innerHTML = `<div class="hw-state">🔍 ${t.noMatch}</div>`;
        return;
      }
      list.innerHTML = items.map((a, i) => articleHTML(a, i)).join('');

      list.querySelectorAll('.hw-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const article = btn.closest('.hw-article');
          const isOpen  = article.classList.toggle('hw-open');
          btn.setAttribute('aria-expanded', isOpen);
          btn.querySelector('.hw-toggle-label').textContent = isOpen ? t.hideHl : t.showHl;
        });
      });
    }

    function refreshTagButtons() {
      root.querySelectorAll('.hw-tag').forEach(btn => {
        btn.classList.toggle('hw-tag-active', activeTags.has(btn.dataset.tag));
      });
      const toggle = root.querySelector('.hw-tags-toggle');
      const count  = activeTags.size;
      toggle.textContent = count > 0 ? `${t.tagsActive} (${count}) ✕` : `${t.tags} ↓`;
      toggle.classList.toggle('has-active', count > 0);
    }

    function refreshTagsVisibility() {
      root.querySelector('.hw-tags').classList.toggle('hw-tags-hidden', !tagsVisible);
    }

    const tagButtons = allTags.map(tag =>
      `<button class="hw-tag" data-tag="${esc(tag)}">${esc(tag)}</button>`
    ).join('');

    root.innerHTML = `
      <div class="hw-controls">
        <input class="hw-search" type="search" placeholder="${t.search}" autocomplete="off">
        ${allTags.length ? `
          <div class="hw-tags-row">
            <button class="hw-tags-toggle">${t.tags} ↓</button>
          </div>
          <div class="hw-tags hw-tags-hidden">${tagButtons}</div>
        ` : ''}
      </div>
      <div class="hw-list"></div>
      <div class="hw-footer">
        <a href="https://eugrifo.netlify.app/"
           target="_blank" rel="noopener">✦ ${t.credit}</a>
      </div>`;

    refreshList();

    root.querySelector('.hw-search').addEventListener('input', e => {
      searchTerm = e.target.value.trim();
      if (searchTerm && activeTags.size > 0) {
        activeTags.clear();
        refreshTagButtons();
      }
      refreshList();
    });

    root.querySelector('.hw-tags-toggle')?.addEventListener('click', () => {
      if (activeTags.size > 0) {
        activeTags.clear();
        tagsVisible = false;
        refreshTagButtons();
        refreshTagsVisibility();
        refreshList();
        return;
      }
      tagsVisible = !tagsVisible;
      root.querySelector('.hw-tags-toggle').textContent = tagsVisible
        ? `${t.tags} ↑`
        : `${t.tags} ↓`;
      refreshTagsVisibility();
    });

    root.querySelectorAll('.hw-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        if (activeTags.has(tag)) {
          activeTags.delete(tag);
        } else {
          activeTags.add(tag);
          const searchEl = root.querySelector('.hw-search');
          if (searchEl) { searchEl.value = ''; searchTerm = ''; }
        }
        refreshTagButtons();
        refreshList();
      });
    });
  }

  // ─── Init ────────────────────────────────────────────────────────────────────

  function init() {
    const root = document.getElementById(cfg.target);
    if (!root) {
      console.error(`[Highlights Widget] Container #${cfg.target} não encontrado.`);
      return;
    }

    // CSS base — injeta uma vez
    if (!document.getElementById('hw-styles')) {
      const style = document.createElement('style');
      style.id = 'hw-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    // CSS customizado salvo pela extensão — sobrescreve o base
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      chrome.storage.sync.get(['widgetCustomCss'], result => {
        const customCss = result.widgetCustomCss?.trim();
        if (!customCss) return;
        if (!document.getElementById('hw-custom-styles')) {
          const styleEl = document.createElement('style');
          styleEl.id = 'hw-custom-styles';
          styleEl.textContent = customCss;
          document.head.appendChild(styleEl);
        }
      });
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
