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
      --hw-bg:       ${isDark ? '#0d1117' : '#ffffff'};
      --hw-surface:  ${isDark ? '#161b22' : '#f6f8fa'};
      --hw-border:   ${isDark ? '#30363d' : '#d0d7de'};
      --hw-text:     ${isDark ? '#e6edf3' : '#1f2328'};
      --hw-muted:    ${isDark ? '#7d8590' : '#656d76'};
      --hw-radius:   6px;

      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: var(--hw-text);
      background: var(--hw-bg);
      line-height: 1.5;
    }
    .hw *, .hw *::before, .hw *::after { box-sizing: border-box; }

    /* ── controles ── */
    .hw-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 24px;
    }
    .hw-search {
      width: 100%;
      padding: 5px 12px;
      background: var(--hw-bg);
      border: 1px solid var(--hw-border);
      border-radius: var(--hw-radius);
      font-size: 14px;
      font-family: inherit;
      color: var(--hw-text);
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .hw-search::placeholder { color: var(--hw-muted); }
    .hw-search:focus {
      border-color: #0969da;
      box-shadow: 0 0 0 3px rgba(9,105,218,.12);
    }

    .hw-tags-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hw-tags-toggle {
      flex-shrink: 0;
      padding: 3px 10px;
      border-radius: var(--hw-radius);
      border: 1px solid var(--hw-border);
      background: var(--hw-surface);
      color: var(--hw-muted);
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: all .12s;
      white-space: nowrap;
    }
    .hw-tags-toggle:hover { border-color: var(--hw-muted); color: var(--hw-text); }
    .hw-tags-toggle.has-active {
      background: ${isDark ? '#1f6feb' : '#0969da'};
      border-color: ${isDark ? '#1f6feb' : '#0969da'};
      color: #fff;
    }

    .hw-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }
    .hw-tags.hw-tags-hidden { display: none; }

    
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
              <button class="hw-toggle-btn">${count} destaque${count !== 1 ? 's' : ''} ↓</button>
            </div>
          </div>
          <div class="hw-article-body">
            ${a.page_comment ? `<p class="hw-page-comment">${esc(a.page_comment)}</p>` : ''}
            <div class="hw-highlights">${highlightsHTML}</div>
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
          const isOpen = article.classList.toggle('hw-open');
          const btn = head.querySelector('.hw-toggle-btn');
          if (btn) {
            const count = (btn.textContent.match(/^\d+/) || [''])[0];
            const label = btn.textContent.replace(/[↓↑]$/, '').trim();
            btn.textContent = label + (isOpen ? ' ↑' : ' ↓');
          }
        });
      });
    }

    function refreshTagButtons() {
      root.querySelectorAll('.hw-tag').forEach(btn => {
        btn.classList.toggle('hw-tag-active', activeTags.has(btn.dataset.tag));
      });
      const toggle = root.querySelector('.hw-s-toggle');
      const count  = actives.size;
      toggle.textContent = count > 0 ? `${t.sActive} (${count}) ✕` : `${t.s} ↓`;
      toggle.classList.toggle('has-active', count > 0);
    }

    function refreshsVisibility() {
      root.querySelector('.hw-s').classList.toggle('hw-s-hidden', !sVisible);
    }

    const Buttons = alls.map( =>
      `<button class="hw-" data-="${esc()}">${esc(tag)}</button>`
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
