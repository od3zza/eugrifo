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
  // Aceita tanto nomes legados ("yellow", "blue"…) quanto hex direto ("#ffd700")

  const COLOR_NAMES = {
    yellow: '#ffd700',
    green:  '#90ee90',
    blue:   '#add8e6',
    pink:   '#ffb6c1',
    red:    '#f56565',
  };

  // Mapeia cor para uma versão com 15% de opacidade para o fundo do card
  function resolveColor(color) {
    if (!color) return '#ffd700';
    if (color.startsWith('#')) return color;
    return COLOR_NAMES[color.toLowerCase()] || '#ffd700';
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ─── CSS ─────────────────────────────────────────────────────────────────────

  const CSS = `
    .hw {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      max-width: 720px;
    }
    .hw *, .hw *::before, .hw *::after { box-sizing: border-box; }

    /* ── controles ── */
    .hw-controls {
      margin-bottom: 2rem;
    }

    .hw-search {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
      color: inherit;
      background: #fff;
      outline: none;
      transition: border-color .2s;
      margin-bottom: 0.75rem;
    }
    .hw-search::placeholder { color: #aaa; }
    .hw-search:focus { border-color: #999; }

    .hw-tags-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .hw-tags-toggle {
      padding: 0.25rem 0.7rem;
      border-radius: 20px;
      border: 1px solid #ccc;
      background: transparent;
      color: #666;
      font-size: 0.8rem;
      font-family: inherit;
      cursor: pointer;
      transition: all .15s;
      white-space: nowrap;
    }
    .hw-tags-toggle:hover { border-color: #999; color: #333; }
    .hw-tags-toggle.has-active {
      background: #000;
      border-color: #000;
      color: #fff;
    }

    .hw-tags-wrap {
      width: 100%;
      margin-top: 0.5rem;
      display: none;
    }
    .hw-tags-wrap.visible { display: flex; flex-wrap: wrap; gap: 0.4rem; }

    .hw-tag {
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      border: 1px solid #ddd;
      background: #f5f5f5;
      color: #333;
      font-size: 0.8rem;
      font-family: inherit;
      cursor: pointer;
      transition: all .15s;
    }
    .hw-tag:hover { border-color: #bbb; background: #e8e8e8; }
    .hw-tag.active {
      background: #000;
      border-color: #000;
      color: #fff;
    }

    /* ── lista ── */
    .hw-list { display: flex; flex-direction: column; gap: 0; }

    /* ── card de artigo ── */
    .hw-card {
      border: 1px solid #ddd;
      border-radius: 10px;
      margin-bottom: 1.2rem;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,.04);
      transition: box-shadow .2s;
    }
    .hw-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }

    .hw-card-head {
      display: flex;
      align-items: flex-start;
      gap: 0.9rem;
      padding: 1rem 1.1rem;
      cursor: pointer;
      user-select: none;
      position: relative;
    }

    .hw-favicon {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      flex-shrink: 0;
      margin-top: 2px;
      object-fit: contain;
    }

    .hw-card-info { flex: 1; min-width: 0; }

    .hw-card-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: #111;
      text-decoration: none;
      display: block;
      margin-bottom: 0.25rem;
      pointer-events: none;
    }
    .hw-card-head:hover .hw-card-title { text-decoration: underline; }

    .hw-card-domain {
      font-size: 0.8rem;
      color: #888;
    }

    .hw-card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-top: 0.4rem;
    }
    .hw-card-tag {
      font-size: 0.72rem;
      background: #f0f0f0;
      color: #555;
      padding: 0.1rem 0.5rem;
      border-radius: 10px;
      font-weight: 600;
      text-transform: lowercase;
    }

    .hw-card-date {
      font-size: 0.75rem;
      color: #aaa;
      margin-top: 0.35rem;
    }

    .hw-card-aside {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      flex-shrink: 0;
      padding-top: 2px;
    }
    .hw-card-count {
      font-size: 0.75rem;
      color: #aaa;
      white-space: nowrap;
    }
    .hw-card-toggle-btn {
      font-size: 0.75rem;
      color: #777;
      background: #f2f2f2;
      border: 1px solid #ddd;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .hw-card-toggle-btn:hover { background: #e6e6e6; }
    .hw-card.open .hw-card-toggle-btn { background: #e8e8e8; }

    /* ── corpo colapsável ── */
    .hw-card-body {
      display: none;
      border-top: 1px solid #eee;
      background: #fafafa;
      padding: 1rem 1.1rem;
    }
    .hw-card.open .hw-card-body { display: block; }

    /* ── page comment ── */
    .hw-page-comment {
      font-style: italic;
      color: #555;
      margin: 0 0 1rem;
      padding: 0.5rem 0 0.5rem 1rem;
      border-left: 3px solid #eee;
      font-size: 0.9rem;
    }

    /* ── destaques ── */
    .hw-hl-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .hw-hl {
      padding: 0.55rem 0.8rem;
      border-radius: 0 6px 6px 0;
      border-left: 3px solid #ffd700;
      /* bg definido inline por JS */
    }
    .hw-hl-text {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.65;
      color: #222;
    }
    .hw-hl-note {
      margin: 0.45rem 0 0;
      font-size: 0.8rem;
      color: #666;
      font-style: italic;
    }
    .hw-hl-note::before { content: '💭 '; }

    /* ── botão fechar ── */
    .hw-hide-btn {
      display: block;
      margin-top: 1rem;
      font-size: 0.8rem;
      background: #f2f2f2;
      border: 1px solid #ccc;
      padding: 0.3rem 0.7rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .hw-hide-btn:hover { background: #e6e6e6; }

    /* ── estados ── */
    .hw-state {
      padding: 3rem 1rem;
      text-align: center;
      color: #888;
      font-size: 0.95rem;
    }

    /* ── rodapé ── */
    .hw-footer {
      margin-top: 1.5rem;
      text-align: right;
      font-size: 0.72rem;
      color: #ccc;
    }
    .hw-footer a { color: inherit; text-decoration: none; }
    .hw-footer a:hover { text-decoration: underline; }
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

    let activeTags  = new Set();
    let searchTerm  = '';
    let tagsVisible = false;

    // ── Filtragem ───────────────────────────────────────────────────────────────

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

    // ── Gera HTML de um artigo ──────────────────────────────────────────────────

    function articleHTML(a, idx) {
      const favicon   = getFaviconUrl(a.url);
      const domain    = getDomain(a.url);
      const count     = (a.highlights || []).length;
      const dateStr   = formatDate(a.date);

      const tagsHTML = (a.tags || []).map(tag =>
        `<span class="hw-card-tag">${esc(tag)}</span>`
      ).join('');

      const hlHTML = (a.highlights || []).map(h => {
        const color   = resolveColor(h.color);
        const bgColor = hexToRgba(color, 0.10);
        return `
          <div class="hw-hl" style="border-left-color:${color};background:${bgColor}">
            <p class="hw-hl-text">${esc(h.highlight)}</p>
            ${h.highlight_note
              ? `<p class="hw-hl-note">${esc(h.highlight_note)}</p>`
              : ''}
          </div>`;
      }).join('');

      return `
        <article class="hw-card" data-idx="${idx}">
          <div class="hw-card-head">
            ${favicon ? `<img class="hw-favicon" src="${esc(favicon)}" alt="" loading="lazy">` : ''}
            <div class="hw-card-info">
              <a class="hw-card-title" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">
                ${esc(a.title || a.url)}
              </a>
              <div class="hw-card-domain">${esc(domain)}</div>
              ${tagsHTML ? `<div class="hw-card-tags">${tagsHTML}</div>` : ''}
              ${dateStr  ? `<div class="hw-card-date">📅 ${esc(dateStr)}</div>` : ''}
            </div>
            <div class="hw-card-aside">
              <span class="hw-card-count">${t.highlights(count)}</span>
              <button class="hw-card-toggle-btn" data-idx="${idx}">${t.showMore}</button>
            </div>
          </div>
          <div class="hw-card-body">
            ${a.page_comment
              ? `<p class="hw-page-comment">${esc(a.page_comment)}</p>`
              : ''}
            <div class="hw-hl-list">${hlHTML}</div>
            <button class="hw-hide-btn" data-idx="${idx}">${t.hideMore}</button>
          </div>
        </article>`;
    }

    // ── Monta o HTML estático da lista ──────────────────────────────────────────

    function refreshList() {
      const listEl = root.querySelector('.hw-list');
      const items  = filtered();

      if (!items.length) {
        listEl.innerHTML = `<div class="hw-state">🔍 ${t.noMatch}</div>`;
        return;
      }

      listEl.innerHTML = items.map((a, i) => articleHTML(a, i)).join('');

      // Bind toggle — clique no cabeçalho do card (exceto no link)
      listEl.querySelectorAll('.hw-card-head').forEach(head => {
        head.addEventListener('click', e => {
          if (e.target.tagName === 'A') return;
          toggleCard(head.closest('.hw-card'));
        });
      });

      // Bind botão "ver destaques"
      listEl.querySelectorAll('.hw-card-toggle-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          toggleCard(btn.closest('.hw-card'));
        });
      });

      // Bind botão "ocultar"
      listEl.querySelectorAll('.hw-hide-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          closeCard(btn.closest('.hw-card'));
        });
      });
    }

    function toggleCard(card) {
      const isOpen = card.classList.contains('open');
      isOpen ? closeCard(card) : openCard(card);
    }

    function openCard(card) {
      card.classList.add('open');
      const btn = card.querySelector('.hw-card-toggle-btn');
      if (btn) btn.textContent = t.hideMore;
    }

    function closeCard(card) {
      card.classList.remove('open');
      const btn = card.querySelector('.hw-card-toggle-btn');
      if (btn) btn.textContent = t.showMore;
    }

    // ── Atualiza estado visual das tags ─────────────────────────────────────────

    function refreshTagButtons() {
      root.querySelectorAll('.hw-tag').forEach(btn => {
        btn.classList.toggle('active', activeTags.has(btn.dataset.tag));
      });

      const toggleBtn = root.querySelector('.hw-tags-toggle');
      if (!toggleBtn) return;

      const count = activeTags.size;
      if (count > 0) {
        toggleBtn.textContent = `${t.clearTags} (${count}) ✕`;
        toggleBtn.classList.add('has-active');
      } else {
        toggleBtn.textContent = tagsVisible ? t.hideTags : t.showTags;
        toggleBtn.classList.remove('has-active');
      }
    }

    function refreshTagsVisibility() {
      const wrap = root.querySelector('.hw-tags-wrap');
      if (wrap) wrap.classList.toggle('visible', tagsVisible);
    }

    // ── Monta a UI completa ─────────────────────────────────────────────────────

    const tagButtons = allTags.map(tag =>
      `<button class="hw-tag" data-tag="${esc(tag)}">${esc(tag)}</button>`
    ).join('');

    root.innerHTML = `
      <div class="hw-controls">
        <input class="hw-search" type="search" placeholder="${t.search}" autocomplete="off">
        ${allTags.length ? `
          <div class="hw-tags-bar">
            <button class="hw-tags-toggle">${t.showTags}</button>
          </div>
          <div class="hw-tags-wrap">${tagButtons}</div>
        ` : ''}
      </div>
      <div class="hw-list"></div>
      <div class="hw-footer">
        <a href="https://github.com/od3zza/eugrifo" target="_blank" rel="noopener">✦ ${t.credit}</a>
      </div>`;

    refreshList();

    // ── Busca ───────────────────────────────────────────────────────────────────

    root.querySelector('.hw-search').addEventListener('input', e => {
      searchTerm = e.target.value.trim();
      // Desativa tags ao digitar na busca
      if (searchTerm && activeTags.size > 0) {
        activeTags.clear();
        refreshTagButtons();
      }
      refreshList();
    });

    // ── Toggle visibilidade das tags ────────────────────────────────────────────

    root.querySelector('.hw-tags-toggle')?.addEventListener('click', () => {
      // Se há tags ativas, limpa tudo
      if (activeTags.size > 0) {
        activeTags.clear();
        tagsVisible = false;
        refreshTagButtons();
        refreshTagsVisibility();
        refreshList();
        return;
      }
      tagsVisible = !tagsVisible;
      refreshTagButtons();
      refreshTagsVisibility();
    });

    // ── Clique nas tags — multi-select ──────────────────────────────────────────

    root.querySelectorAll('.hw-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        if (activeTags.has(tag)) {
          activeTags.delete(tag);
        } else {
          activeTags.add(tag);
          // Limpa busca ao selecionar tag
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
      console.error(`[eugrifo widget] Container #${cfg.target} não encontrado.`);
      return;
    }

    // Injeta estilos uma única vez por página
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
