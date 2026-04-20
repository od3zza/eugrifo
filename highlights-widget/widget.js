/*!
 * Highlights Widget
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
 *     data-token="ghp_seu_token_readonly"   ← opcional, só pra repos privados
 *     data-accent="#ffd700"                 ← cor principal
 *     data-theme="light"                    ← light | dark
 *     data-lang="pt"                        ← pt | en
 *     data-target="meus-highlights">        ← id do container
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
    accent: script?.getAttribute('data-accent') || '#ffd700',
    theme:  script?.getAttribute('data-theme')  || 'light',
    lang:   script?.getAttribute('data-lang')   || 'pt',
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

  const isDark = cfg.theme === 'dark';

  const CSS = `
    .hw {
      --hw-accent:   ${cfg.accent};
      --hw-bg:       ${isDark ? '#141414' : '#ffffff'};
      --hw-surface:  ${isDark ? '#1e1e1e' : '#f8f8f6'};
      --hw-border:   ${isDark ? '#2a2a2a' : '#e8e4df'};
      --hw-text:     ${isDark ? '#e2ddd8' : '#2a2520'};
      --hw-muted:    ${isDark ? '#6b6560' : '#8a8480'};
      --hw-radius:   10px;

      font-family: 'Georgia', 'Times New Roman', serif;
      color: var(--hw-text);
      background: var(--hw-bg);
      line-height: 1.6;
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

    .hw-article-head {
      padding: 14px 18px;
      background: var(--hw-surface);
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      user-select: none;
    }
    .hw-article-head:hover { background: var(--hw-border); }

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
      pointer-events: none; /* clique vai pro card todo */
    }
    .hw-article-head:hover .hw-article-title a { text-decoration: underline; }

    .hw-article-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
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

    /* contador de highlights + chevron */
    .hw-article-aside {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      flex-shrink: 0;
      padding-top: 2px;
    }
    .hw-article-count {
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--hw-muted);
      white-space: nowrap;
    }
    .hw-chevron {
      font-size: 10px;
      color: var(--hw-muted);
      transition: transform .2s;
      line-height: 1;
    }
    .hw-article.hw-open .hw-chevron { transform: rotate(180deg); }

    /* ── corpo colapsável ── */
    .hw-article-body {
      display: none;
      border-top: 1px solid var(--hw-border);
    }
    .hw-article.hw-open .hw-article-body { display: block; }

    /* ── highlights ── */
    .hw-highlights { padding: 14px 18px; display: flex; flex-direction: column; gap: 10px; }

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

    // Estado do filtro — agora é um Set de tags ativas (multi-select)
    let activeTags = new Set();
    let searchTerm = '';
    let tagsVisible = false;

    function filtered() {
      return articles.filter(a => {
        // Multi-tag: artigo precisa ter TODAS as tags ativas
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
        const borderColor = COLOR_MAP[h.color] || cfg.accent;
        return `
          <div class="hw-hl" style="border-left-color:${borderColor}">
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
            <div class="hw-article-aside">
              <span class="hw-article-count">${count} destaque${count !== 1 ? 's' : ''}</span>
              <span class="hw-chevron">▼</span>
            </div>
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

      // Bind toggle em cada cabeçalho
      list.querySelectorAll('.hw-article-head').forEach(head => {
        head.addEventListener('click', e => {
          // Permite clicar no link sem abrir/fechar o card
          if (e.target.tagName === 'A') return;
          const article = head.closest('.hw-article');
          article.classList.toggle('hw-open');
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
        <a href="https://oieuoshi.vercel.app/blog/misc/porque-eu-fiz-uma-extensao-pra-salvar-textos-destacados"
           target="_blank" rel="noopener">✦ ${t.credit}</a>
      </div>`;

    refreshList();

    // Busca — limpa tags ativas ao digitar
    root.querySelector('.hw-search').addEventListener('input', e => {
      searchTerm = e.target.value.trim();
      if (searchTerm && activeTags.size > 0) {
        activeTags.clear();
        refreshTagButtons();
      }
      refreshList();
    });

    // Toggle de visibilidade das tags
    root.querySelector('.hw-tags-toggle')?.addEventListener('click', () => {
      // Se há tags ativas, clicar no toggle as limpa (e fecha)
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

    // Clique nas tags — multi-select, toggle individual
    root.querySelectorAll('.hw-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        if (activeTags.has(tag)) {
          activeTags.delete(tag);
        } else {
          activeTags.add(tag);
          // Limpa a busca ao selecionar uma tag
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

    // Injeta estilos uma única vez
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
