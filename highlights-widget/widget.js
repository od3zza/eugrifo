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
      font-family: inherit;
      line-height: 1.6;
      max-width: 720px;
    }
    .hw *, .hw *::before, .hw *::after { box-sizing: border-box; }

    /* ── controles ── */
    .hw-controls { margin-bottom: 1.5rem; }

    .hw-search {
      width: 100%;
      padding: 0.7rem 0.9rem;
      border: 3px solid currentColor;
      border-radius: 6px;
      font-size: inherit;
      font-family: inherit;
      background: transparent;
      color: inherit;
      outline: none;
      transition: border-color 0.15s;
      margin-bottom: 0.75rem;
      opacity: 0.85;
    }
    .hw-search::placeholder { opacity: 0.35; }
    .hw-search:focus { opacity: 1; border-color: currentColor; }

    .hw-tags-toggle {
      font-family: inherit;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: transparent;
      border: 1px solid currentColor;
      border-radius: 4px;
      padding: 0.3rem 0.75rem;
      cursor: pointer;
      color: inherit;
      opacity: 0.45;
      transition: opacity 0.15s, background 0.15s;
      white-space: nowrap;
    }
    .hw-tags-toggle:hover { opacity: 1; }
    .hw-tags-toggle.has-active {
      opacity: 1;
      font-weight: 700;
      background: currentColor;
      color: #fff;
    }

    .hw-tags-wrap {
      width: 100%;
      margin-top: 0.5rem;
      display: none;
    }
    .hw-tags-wrap.visible { display: flex; flex-wrap: wrap; gap: 0.4rem; }

    .hw-tag {
      font-family: inherit;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: inherit;
      border: 1px solid currentColor;
      padding: 0.15rem 0.55rem;
      border-radius: 4px;
      cursor: pointer;
      background: none;
      opacity: 0.4;
      transition: all 0.15s;
    }
    .hw-tag:hover { opacity: 1; background: currentColor; color: #fff; }
    .hw-tag.active { opacity: 1; background: currentColor; color: #fff; }

    /* ── lista ── */
    .hw-list { display: flex; flex-direction: column; }

    /* ── card ── */
    .hw-card {
      border: 3px solid currentColor;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      overflow: hidden;
      opacity: 0.85;
      transition: opacity 0.2s;
    }
    .hw-card:hover { opacity: 1; }

    /* ── cabeçalho — layout em coluna, sem aside lateral ── */
    .hw-card-head {
      padding: 1.1rem 1.2rem;
      cursor: pointer;
      user-select: none;
    }

    .hw-card-top {
      display: flex;
      align-items: flex-start;
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
      opacity: 0.8;
    }

    /* título — link real, abre em nova aba */
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

    /* meta — domínio, data, tags — linha única abaixo do título */
    .hw-card-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 1rem;
      font-family: inherit;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      opacity: 0.5;
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
      border: 1px solid currentColor;
      padding: 0.1rem 0.45rem;
      border-radius: 4px;
      opacity: 1;
    }

    /* rodapé do cabeçalho — contagem + chevron na mesma linha */
    .hw-card-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.75rem;
      padding-top: 0.6rem;
      border-top: 1px solid currentColor;
      opacity: 0.4;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .hw-card.open .hw-card-foot { opacity: 1; }

    .hw-expand-icon {
      font-size: 0.65rem;
      transition: transform 0.2s;
      line-height: 1;
    }
    .hw-card.open .hw-expand-icon { transform: rotate(180deg); }

    /* ── corpo ── */
    .hw-card-body {
      display: none;
      border-top: 1px solid currentColor;
      padding: 1.2rem;
      background: rgba(0,0,0,0.025);
    }
    .hw-card.open .hw-card-body { display: block; }

    /* ── page comment ── */
    .hw-page-comment {
      font-family: inherit;
      font-size: 1rem;
      font-style: italic;
      line-height: 1.7;
      color: inherit;
      opacity: 0.55;
      border-left: 3px solid currentColor;
      padding: 0.5rem 0 0.5rem 1rem;
      margin-bottom: 1.5rem;
    }

    /* ── destaques ── */
    .hw-hl-list {
      display: flex;
      flex-direction: column;
    }

    .hw-hl {
      margin-bottom: 1.2rem;
      padding: 0.8rem 1rem;
      border-radius: 4px;
      border-left: 3px solid transparent;
    }
    .hw-hl:last-child { margin-bottom: 0; }

    /* cores nomeadas legadas */
    .hw-hl.yellow { background: rgba(253,223,142,0.25); border-left-color: #e6b800; }
    .hw-hl.green  { background: rgba(92,230,92,0.15);  border-left-color: #4caf50; }
    .hw-hl.blue   { background: rgba(130,169,245,0.2); border-left-color: #5c8ee0; }
    .hw-hl.pink   { background: rgba(255,192,203,0.25); border-left-color: #e07090; }

    .hw-hl-text {
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.7;
      color: inherit;
      margin: 0;
    }

    .hw-hl-note {
      font-family: inherit;
      font-size: 0.9rem;
      font-style: italic;
      line-height: 1.7;
      color: inherit;
      opacity: 0.6;
      margin-top: 0.6rem;
      padding: 0.5rem 0.75rem;
      background: rgba(255,255,255,0.55);
      border-left: 2px solid currentColor;
      border-radius: 0 3px 3px 0;
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
      border: 1px solid currentColor;
      border-radius: 4px;
      padding: 0.3rem 0.75rem;
      cursor: pointer;
      color: inherit;
      opacity: 0.45;
      transition: opacity 0.15s;
    }
    .hw-hide-btn:hover { opacity: 1; }

    /* ── estados ── */
    .hw-state {
      padding: 3rem 1rem;
      text-align: center;
      font-style: italic;
      font-family: inherit;
      font-size: 1rem;
      opacity: 0.45;
    }

    /* ── rodapé ── */
    .hw-footer {
      margin-top: 1.5rem;
      text-align: right;
      font-size: 0.72rem;
      opacity: 0.25;
    }
    .hw-footer a { color: inherit; text-decoration: none; }
    .hw-footer a:hover { opacity: 1; text-decoration: underline; }

    /* ── responsivo ── */
    @media (max-width: 600px) {
      .hw-card-head { padding: 0.9rem; }
      .hw-card-body { padding: 0.9rem; }
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
      const favicon  = getFaviconUrl(a.url);
      const domain   = getDomain(a.url);
      const count    = (a.highlights || []).length;
      const dateStr  = formatDate(a.date);

      const tagsHTML = (a.tags || []).map(tag =>
        `<span class="hw-card-tag">${esc(tag)}</span>`
      ).join('');

      const hlHTML = (a.highlights || []).map(h => {
        const rawColor = (h.color || 'yellow').toLowerCase();
        const isNamed  = ['yellow','green','blue','pink','red'].includes(rawColor);
        const colorAttr = isNamed
          ? `class="hw-hl ${rawColor}"`
          : (() => {
              const hex = resolveColor(rawColor);
              const bg  = hexToRgba(hex, 0.20);
              return `class="hw-hl" style="border-left-color:${hex};background:${bg}"`;
            })();
        return `
          <div ${colorAttr}>
            <div class="hw-hl-text">${esc(h.highlight)}</div>
            ${h.highlight_note
              ? `<div class="hw-hl-note">${esc(h.highlight_note)}</div>`
              : ''}
          </div>`;
      }).join('');

      // Meta: domínio · data · tags (tudo na mesma linha, opacidade baixa)
      const metaParts = [
        domain ? `<span>${esc(domain)}</span>` : '',
        dateStr ? `<span>${esc(dateStr)}</span>` : '',
        tagsHTML ? `<div class="hw-card-tags">${tagsHTML}</div>` : '',
      ].filter(Boolean).join('');

      return `
        <article class="hw-card" data-idx="${idx}">
          <div class="hw-card-head">
            <div class="hw-card-top">
              ${favicon ? `<img class="hw-favicon" src="${esc(favicon)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}
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

      // Bind botão "fechar"
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
    }

    function closeCard(card) {
      card.classList.remove('open');
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
