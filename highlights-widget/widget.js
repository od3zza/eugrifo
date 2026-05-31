/*!
 * eugrifo — Highlights Widget  v4.1
 * Exibe seu feed de destaques em qualquer site.
 */

(function () {
  'use strict';

  // ─── Configuração ────────────────────────────────────────────────────────────

  const script =
    document.currentScript ||
    document.querySelector('script[data-owner]');

  const cfg = {
    owner:  script?.getAttribute('data-owner')  || '',
    repo:   script?.getAttribute('data-repo')   || '',
    file:   script?.getAttribute('data-file')   || 'eugrifo-highlights.json',
    token:  script?.getAttribute('data-token')  || '',
    target: script?.getAttribute('data-target') || 'eugrifo-widget',
    lang:   script?.getAttribute('data-lang')   || 'pt',
  };

  // ─── i18n ────────────────────────────────────────────────────────────────────

  const copy = {
    pt: {
      loading:     'Carregando destaques…',
      empty:       'Nenhum destaque encontrado.',
      noMatch:     'Nenhum resultado para esta busca.',
      search:      'Buscar nos destaques…',
      showTags:    'filtrar por tag',
      hideTags:    'ocultar tags',
      clearTags:   'limpar filtros',
      highlights:  (n) => `${n} destaque${n !== 1 ? 's' : ''}`,
      showMore:    'ver destaques ↓',
      hideMore:    'ocultar ↑',
      note:        'nota',
      error:       'Não foi possível carregar os destaques.',
      credit:      'feito com eugrifo',
    },
    en: {
      loading:     'Loading highlights…',
      empty:       'No highlights yet.',
      noMatch:     'No results for this search.',
      search:      'Search highlights…',
      showTags:    'filter by tag',
      hideTags:    'hide tags',
      clearTags:   'clear filters',
      highlights:  (n) => `${n} highlight${n !== 1 ? 's' : ''}`,
      showMore:    'show highlights ↓',
      hideMore:    'hide ↑',
      note:        'note',
      error:       'Could not load highlights.',
      credit:      'made with eugrifo',
    },
  };
  const t = copy[cfg.lang] || copy.pt;

  // ─── Resolução de cor ────────────────────────────────────────────────────────

  const COLOR_NAMES = {
    yellow: '#ffd700',
    green:  '#90ee90',
    blue:   '#add8e6',
    pink:   '#ffb6c1',
    red:    '#f56565',
  };

  function resolveColor(color) {
    if (!color) return '#ffd700';
    if (color.startsWith('#')) return color;
    return COLOR_NAMES[color.toLowerCase()] || '#ffd700';
  }

  // ─── CSS ─────────────────────────────────────────────────────────────────────

  const CSS = `
    .hw {
      /* ── API de Variáveis (Herança natural do site) ── */
      --hw-font: inherit;
      --hw-text-main: currentColor;
      --hw-text-muted: color-mix(in srgb, currentColor 60%, transparent);
      --hw-border: color-mix(in srgb, currentColor 20%, transparent);
      --hw-border-focus: color-mix(in srgb, currentColor 60%, transparent);
      
      --hw-bg-card: transparent;
      --hw-bg-body: color-mix(in srgb, currentColor 3%, transparent);
      --hw-bg-note: color-mix(in srgb, currentColor 6%, transparent);
      
      --hw-radius: 6px;
      --hw-radius-sm: 4px;

      font-family: var(--hw-font);
      color: var(--hw-text-main);
      line-height: 1.6;
      max-width: 720px;
    }

    /* Reset isolado para o widget */
    .hw *, .hw *::before, .hw *::after { 
      box-sizing: border-box; 
      margin: 0; 
    }

    /* ── controles ── */
    .hw-controls { margin-bottom: 1.5rem; }

    .hw-search {
      width: 100%;
      padding: 0.7rem 0.9rem;
      border: 1px solid var(--hw-border);
      border-radius: var(--hw-radius);
      font-size: inherit;
      font-family: inherit;
      background: transparent;
      color: inherit;
      outline: none;
      transition: border-color 0.15s;
      margin-bottom: 0.75rem;
    }
    .hw-search::placeholder { color: var(--hw-text-muted); }
    .hw-search:focus { border-color: var(--hw-border-focus); }

    .hw-tags-bar { display: none; }   /* removido — tags agora ficam só nos cards */
    .hw-tags-wrap { display: none; }  /* removido */

    .hw-tag { display: none; }        /* removido — substituído por hw-card-tag clicável */

    /* ── lista ── */
    .hw-list { display: flex; flex-direction: column; gap: 1.5rem; }

    /* ── card ── */
    .hw-card {
      width: 100%;
      background: var(--hw-bg-card);
      border: 1px solid var(--hw-border);
      border-radius: var(--hw-radius);
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .hw-card:hover { border-color: var(--hw-border-focus); }

    .hw-card-head {
      padding: 1.1rem 1.2rem;
      cursor: pointer;
      user-select: none;
    }

    .hw-card-top {
      display: inline-flex;
      gap: 0.8rem;
      margin-bottom: 0.6rem;
    }

    .hw-favicon {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      margin-top: 3px;
      border-radius: 3px;
      object-fit: contain;
      display: block;
    }

    .hw-card-title {
      font-family: inherit;
      font-weight: 700;
      font-size: 1rem;
      color: inherit;
      text-decoration: none;
      display: block;
      line-height: 1.4;
    }
    .hw-card-title:hover { text-decoration: underline; }

    .hw-card-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 1rem;
      font-family: inherit;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--hw-text-muted);
    }

    .hw-card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }
    .hw-card-tag {
      font-family: inherit;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: inherit;
      border: 1px solid var(--hw-border);
      padding: 0.1rem 0.45rem;
      border-radius: var(--hw-radius-sm);
      cursor: pointer;
      background: none;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .hw-card-tag:hover {
      background: var(--hw-text-main);
      color: var(--hw-bg-card, #fff);
      border-color: var(--hw-text-main);
    }
    .hw-card-tag.active {
      background: var(--hw-text-main);
      color: var(--hw-bg-card, #fff);
      border-color: var(--hw-text-main);
      font-weight: 700;
    }

    .hw-card-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.75rem;
      padding-top: 0.6rem;
      border-top: 1px solid var(--hw-border);
      color: var(--hw-text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .hw-card.open .hw-card-foot { color: var(--hw-text-main); }

    .hw-expand-icon {
      font-size: 0.65rem;
      transition: transform 0.2s;
      line-height: 1;
    }
    .hw-card.open .hw-expand-icon { transform: rotate(180deg); }

    /* ── corpo ── */
    .hw-card-body {
      display: none;
      border-top: 1px solid var(--hw-border);
      padding: 1.2rem;
      background: var(--hw-bg-body);
    }
    .hw-card.open .hw-card-body { display: block; }

    .hw-page-comment {
      font-family: inherit;
      font-size: 1rem;
      font-style: italic;
      line-height: 1.7;
      color: var(--hw-text-muted);
      border-left: 3px solid var(--hw-border);
      padding: 0.5rem 0 0.5rem 1rem;
      margin-bottom: 1.5rem;
    }

    /* ── destaques ── */
    .hw-hl-list {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .hw-hl {
      padding: 0.8rem 1rem;
      border-radius: var(--hw-radius-sm);
      border-left: 3px solid var(--hw-hl-color);
      /* Usa color-mix para criar o fundo a partir da cor do destaque */
      background: color-mix(in srgb, var(--hw-hl-color) 15%, transparent);
    }

    .hw-hl-text {
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.7;
      color: var(--hw-text-main);
    }

    .hw-hl-note {
      font-family: inherit;
      font-size: 0.9rem;
      font-style: italic;
      line-height: 1.7;
      color: var(--hw-text-main);
      margin-top: 0.8rem;
      padding: 0.6rem 0.8rem;
      background: var(--hw-bg-note);
      border-left: 2px solid var(--hw-border);
      border-radius: 0 var(--hw-radius-sm) var(--hw-radius-sm) 0;
    }

    /* ── botão fechar ── */
    .hw-hide-btn {
      display: block;
      margin-top: 1.5rem;
      font-family: inherit;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: transparent;
      border: 1px solid var(--hw-border);
      border-radius: var(--hw-radius-sm);
      padding: 0.3rem 0.75rem;
      cursor: pointer;
      color: var(--hw-text-muted);
      transition: color 0.15s, border-color 0.15s;
    }
    .hw-hide-btn:hover { 
      color: var(--hw-text-main); 
      border-color: var(--hw-border-focus); 
    }

    /* ── estados & rodapé ── */
    .hw-state {
      padding: 3rem 1rem;
      text-align: center;
      font-style: italic;
      font-family: inherit;
      font-size: 1rem;
      color: var(--hw-text-muted);
    }

    .hw-footer {
      margin-top: 1.5rem;
      text-align: right;
      font-size: 0.72rem;
      color: var(--hw-text-muted);
    }
    .hw-footer a { color: inherit; text-decoration: none; }
    .hw-footer a:hover { color: var(--hw-text-main); text-decoration: underline; }

    /* ── responsivo ── */
    @media (max-width: 600px) {
      .hw-card-head, .hw-card-body { padding: 0.9rem; }
      .hw-hl { padding: 0.7rem 0.8rem; }
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

  function getFaviconUrl(url) {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch { return ''; }
  }

  function getDomain(url) {
    try { return new URL(url).hostname; } catch { return url; }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(
        cfg.lang === 'en' ? 'en-US' : 'pt-BR',
        { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' }
      );
    } catch { return dateStr; }
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

    let searchTerm  = '';

    function filtered() {
      return articles.filter(a => {
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          // Filtra por tag exata (clique na tag) ou busca textual livre
          const tagMatch = (a.tags || []).some(tag => tag.toLowerCase() === q);
          if (tagMatch) return true;
          const inTitle = (a.title || '').toLowerCase().includes(q);
          const inHl    = (a.highlights || []).some(h =>
            (h.highlight || '').toLowerCase().includes(q) ||
            (h.highlight_note || '').toLowerCase().includes(q)
          );
          return inTitle || inHl;
        }
        return true;
      });
    }

    function articleHTML(a, idx) {
      const favicon  = getFaviconUrl(a.url);
      const domain   = getDomain(a.url);
      const count    = (a.highlights || []).length;
      const dateStr  = formatDate(a.date);

      const tagsHTML = (a.tags || []).map(tag =>
        `<button class="hw-card-tag" data-tag="${esc(tag)}" type="button">${esc(tag)}</button>`
      ).join('');

      const hlHTML = (a.highlights || []).map(h => {
        const hex = resolveColor(h.color);
        return `
          <div class="hw-hl" style="--hw-hl-color: ${hex}">
            <p class="hw-hl-text">${esc(h.highlight)}</p>
            ${h.highlight_note
              ? `<blockquote class="hw-hl-note">${esc(h.highlight_note)}</blockquote>`
              : ''}
          </div>`;
      }).join('');

      const metaParts = [
        domain ? `<span>${esc(domain)}</span>` : '',
        dateStr ? `<span>${esc(dateStr)}</span>` : '',
        tagsHTML ? `<div class="hw-card-tags">${tagsHTML}</div>` : '',
      ].filter(Boolean).join('');

      return `
        <article class="hw-card" data-idx="${idx}">
          <div class="hw-card-head">
            <div class="hw-card-top">
              <a class="hw-card-title" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer"
                 onclick="event.stopPropagation()">
                ${esc(a.title || a.url)}
              </a>
            </div>
            ${metaParts ? `<div class="hw-card-meta">${metaParts}</div>` : ''}
            <div class="hw-card-foot">
              <span>${count} nota${count !== 1 ? 's' : ''}</span>
              <span class="hw-expand-icon">▼</span>
            </div>
          </div>
          <div class="hw-card-body">
            ${a.page_comment
              ? `<div class="hw-page-comment">${esc(a.page_comment)}</div>`
              : ''}
            <div class="hw-hl-list">${hlHTML}</div>
            <button class="hw-hide-btn" data-idx="${idx}">fechar ↑</button>
          </div>
        </article>`;
    }

    function refreshList() {
      const listEl = root.querySelector('.hw-list');
      const items  = filtered();

      if (!items.length) {
        listEl.innerHTML = `<div class="hw-state">🔍 ${t.noMatch}</div>`;
        return;
      }

      listEl.innerHTML = items.map((a, i) => articleHTML(a, i)).join('');

      // Toggle do card — clique no cabeçalho (exceto no link e nas tags)
      listEl.querySelectorAll('.hw-card-head').forEach(head => {
        head.addEventListener('click', e => {
          if (e.target.tagName === 'A') return;
          if (e.target.classList.contains('hw-card-tag')) return;
          toggleCard(head.closest('.hw-card'));
        });
      });

      // Clique nas tags do card — escreve no campo de busca e filtra
      listEl.querySelectorAll('.hw-card-tag').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const tag     = btn.dataset.tag;
          const searchEl = root.querySelector('.hw-search');
          const isSame  = searchTerm === tag;

          if (isSame) {
            // Segunda vez: limpa o filtro
            searchTerm = '';
            if (searchEl) searchEl.value = '';
          } else {
            searchTerm = tag;
            if (searchEl) searchEl.value = tag;
          }

          // Atualiza estado visual de todas as tags visíveis
          refreshCardTagStates();
          refreshList();
        });
      });

      listEl.querySelectorAll('.hw-hide-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          closeCard(btn.closest('.hw-card'));
        });
      });
    }

    // Marca como active a tag que corresponde ao searchTerm atual
    function refreshCardTagStates() {
      root.querySelectorAll('.hw-card-tag').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tag === searchTerm);
      });
    }

    function toggleCard(card) {
      const isOpen = card.classList.contains('open');
      isOpen ? closeCard(card) : openCard(card);
    }

    function openCard(card) { card.classList.add('open'); }
    function closeCard(card) { card.classList.remove('open'); }

    root.innerHTML = `
      <div class="hw-controls">
        <input class="hw-search" type="search" placeholder="${t.search}" autocomplete="off">
      </div>
      <div class="hw-list"></div>
      <div class="hw-footer">
        <a href="https://github.com/od3zza/eugrifo" target="_blank" rel="noopener">✦ ${t.credit}</a>
      </div>`;

    refreshList();

    root.querySelector('.hw-search').addEventListener('input', e => {
      searchTerm = e.target.value.trim();
      refreshList();
      refreshCardTagStates();
    });
  }

  // ─── Init ────────────────────────────────────────────────────────────────────

  function init() {
    const root = document.getElementById(cfg.target);
    if (!root) {
      console.error(`[eugrifo widget] Container #${cfg.target} não encontrado.`);
      return;
    }

    if (!document.getElementById('eugrifo-widget-styles')) {
      const style = document.createElement('style');
      style.id = 'eugrifo-widget-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    root.classList.add('hw');
    root.innerHTML = `<div class="hw-state">🌿 ${t.loading}</div>`;

    if (!cfg.owner || !cfg.repo) {
      root.innerHTML = `<div class="hw-state">⚠️ Configure data-owner e data-repo no &lt;script&gt;.</div>`;
      return;
    }

    fetchData()
      .then(data => render(root, data))
      .catch(err => {
        console.error('[eugrifo widget]', err);
        root.innerHTML = `<div class="hw-state">❌ ${err.message}</div>`;
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
