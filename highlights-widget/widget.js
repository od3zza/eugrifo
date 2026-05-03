/**
 * highlights-widget/widget.js
 * Widget de destaques — estilo Notas (Uoshi)
 * Título clicável, botão de expandir abaixo do card
 */

(function () {
  /* ─── Configuração ─────────────────────────────────────────── */
  const JSON_URL =
    "https://raw.githubusercontent.com/od3zza/oieuoshi/refs/heads/main/lib/highlights.json";

  /* ─── CSS injetado ──────────────────────────────────────────── */
  const STYLE = `
    @import url("https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;900&display=swap");

    .hw-widget {
      --hw-fg:         #111111;
      --hw-bg:         #ffffff;
      --hw-text-light: #777777;
      --hw-border:     #dddddd;
      --hw-accent:     #f83735;
      --hw-yellow:     #fddf8e;
      --hw-green:      #5CE65C;
      --hw-blue:       #82a9f5;
      --hw-pink:       #ffc0cb;
      --hw-font-s:     12px;
      --hw-font-m:     16px;
      --hw-radius:     6px;
      font-family: "Rubik", sans-serif;
      color: var(--hw-fg);
    }

    /* ── Busca ──────────────────────────────────────────────────── */
    .hw-search {
      width: 100%;
      padding: 0.7rem 0.9rem;
      border: 3px solid var(--hw-fg);
      border-radius: var(--hw-radius);
      font-size: var(--hw-font-m);
      font-family: "Rubik", sans-serif;
      background: var(--hw-bg);
      color: var(--hw-fg);
      box-sizing: border-box;
      transition: border-color 0.15s;
      margin-bottom: 1rem;
      display: block;
    }
    .hw-search::placeholder { color: var(--hw-text-light); }
    .hw-search:focus { outline: none; border-color: var(--hw-text-light); }

    /* ── Tags toggle ────────────────────────────────────────────── */
    .hw-tags-toggle {
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-s);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: transparent;
      border: 1px solid var(--hw-border);
      border-radius: 4px;
      padding: 0.3rem 0.75rem;
      cursor: pointer;
      color: var(--hw-text-light);
      transition: border-color 0.15s, color 0.15s;
      margin-bottom: 0.75rem;
    }
    .hw-tags-toggle:hover { border-color: var(--hw-fg); color: var(--hw-fg); }

    .hw-tags-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 1.5rem;
    }

    .hw-tag {
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-s);
      font-weight: normal;
      color: var(--hw-text-light);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      border: 1px solid var(--hw-border);
      padding: 0.15rem 0.55rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
      user-select: none;
    }
    .hw-tag:hover, .hw-tag.hw-active {
      background: var(--hw-fg);
      color: var(--hw-bg);
      border-color: var(--hw-fg);
    }

    /* ── Stats ──────────────────────────────────────────────────── */
    .hw-stats {
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-s);
      color: var(--hw-text-light);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2rem;
    }
    .hw-stats strong {
      color: var(--hw-fg);
      font-family: "Rubik", sans-serif;
      font-weight: 700;
    }

    /* ── Card ───────────────────────────────────────────────────── */
    .hw-card {
      border: 3px solid var(--hw-border);
      border-radius: var(--hw-radius);
      overflow: hidden;
      margin-bottom: 1.5rem;
      transition: border-color 0.2s;
    }
    .hw-card:hover { border-color: #aaa; }

    /* ── Topo: favicon + meta ───────────────────────────────────── */
    .hw-card-top {
      display: flex;
      align-items: flex-start;
      gap: 0.9rem;
      padding: 1.1rem 1.2rem 0.6rem;
    }

    .hw-favicon { flex-shrink: 0; width: 28px; height: 28px; margin-top: 3px; }
    .hw-favicon img {
      width: 28px; height: 28px;
      border-radius: 4px; margin: 0; display: block;
    }

    .hw-meta { flex: 1; min-width: 0; }

    .hw-title {
      font-family: "Rubik", sans-serif;
      font-weight: 700;
      font-size: var(--hw-font-m);
      color: var(--hw-fg);
      text-decoration: none;
      display: block;
      margin-bottom: 0.2rem;
      line-height: 1.4;
    }
    .hw-title:hover { text-decoration: underline; color: var(--hw-fg); }

    .hw-hostname {
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-s);
      color: var(--hw-text-light);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .hw-date {
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-s);
      color: var(--hw-text-light);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-top: 0.1rem;
    }

    .hw-card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-top: 0.5rem;
    }

    /* ── Linha do botão — ABAIXO do topo ───────────────────────── */
    .hw-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.2rem 1rem;
    }

    .hw-toggle-btn {
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-s);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: transparent;
      border: 1px solid var(--hw-border);
      border-radius: 4px;
      padding: 0.3rem 0.75rem;
      cursor: pointer;
      color: var(--hw-text-light);
      transition: border-color 0.15s, color 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .hw-toggle-btn:hover { border-color: var(--hw-fg); color: var(--hw-fg); }

    .hw-arrow {
      display: inline-block;
      transition: transform 0.2s;
      font-size: 0.6rem;
      line-height: 1;
    }
    .hw-card.hw-open .hw-arrow { transform: rotate(180deg); }

    .hw-badge {
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-s);
      color: var(--hw-text-light);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* ── Corpo ──────────────────────────────────────────────────── */
    .hw-card-body {
      display: none;
      border-top: 1px solid var(--hw-border);
      padding: 1.2rem;
      background: #fafafa;
    }
    .hw-card.hw-open .hw-card-body { display: block; }

    /* ── Comentário de página ───────────────────────────────────── */
    .hw-page-comment {
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-m);
      font-style: italic;
      line-height: 1.65;
      color: #555;
      border-left: 3px solid var(--hw-border);
      padding: 0.5rem 0 0.5rem 1rem;
      margin-bottom: 1.5rem;
      margin-top: 0;
    }

    /* ── Destaques ──────────────────────────────────────────────── */
    .hw-highlight {
      margin-bottom: 1.2rem;
      padding: 0.8rem 1rem;
      border-radius: 4px;
      border-left: 3px solid transparent;
    }
    .hw-highlight:last-of-type { margin-bottom: 0; }

    .hw-highlight.hw-yellow { background: rgba(253,223,142,0.25); border-left-color: var(--hw-yellow); }
    .hw-highlight.hw-green  { background: rgba(92,230,92,0.15);  border-left-color: var(--hw-green); }
    .hw-highlight.hw-blue   { background: rgba(130,169,245,0.2); border-left-color: var(--hw-blue); }
    .hw-highlight.hw-pink   { background: rgba(255,192,203,0.25); border-left-color: var(--hw-pink); }

    .hw-highlight-text {
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-m);
      line-height: 1.65;
      color: var(--hw-fg);
      margin: 0;
    }

    .hw-highlight-note {
      font-family: "Rubik", sans-serif;
      font-size: var(--hw-font-s);
      color: var(--hw-text-light);
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px dashed var(--hw-border);
    }

    /* ── Botão fechar (dentro do body) ─────────────────────────── */
    .hw-close-btn {
      display: inline-block;
      margin-top: 1.2rem;
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-s);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: transparent;
      border: 1px solid var(--hw-border);
      border-radius: 4px;
      padding: 0.3rem 0.75rem;
      cursor: pointer;
      color: var(--hw-text-light);
      transition: border-color 0.15s, color 0.15s;
      width: auto;
    }
    .hw-close-btn:hover { border-color: var(--hw-fg); color: var(--hw-fg); }

    /* ── Ver mais ───────────────────────────────────────────────── */
    .hw-load-more {
      display: block;
      width: 60%;
      margin: 0 auto 2rem;
      padding: 0.6em 2em;
      border: 3px solid var(--hw-fg);
      border-radius: var(--hw-radius);
      background: transparent;
      font-family: "Rubik", sans-serif;
      font-weight: 700;
      font-size: var(--hw-font-m);
      color: var(--hw-fg);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      text-align: center;
    }
    .hw-load-more:hover { background: var(--hw-fg); color: var(--hw-bg); }

    /* ── Estado vazio / loading ─────────────────────────────────── */
    .hw-loading, .hw-empty {
      font-family: "Merriweather", serif;
      font-size: var(--hw-font-m);
      font-style: italic;
      color: var(--hw-text-light);
      padding: 1rem 0;
    }
  `;

  /* ─── Injetar <style> ────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById("hw-styles")) return;
    const el = document.createElement("style");
    el.id = "hw-styles";
    el.textContent = STYLE;
    document.head.appendChild(el);
  }

  /* ─── Estado ─────────────────────────────────────────────── */
  let allItems     = [];
  let filtered     = [];
  let allTags      = new Set();
  let activeTags   = new Set();
  let visibleCount = 10;

  /* ─── Utilitários ────────────────────────────────────────── */
  function getHostname(url) {
    try { return new URL(url).hostname; } catch { return url; }
  }
  function formatDate(d) {
    return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  /* ─── Tags cloud ─────────────────────────────────────────── */
  function buildTagsCloud(root) {
    const cloud = root.querySelector(".hw-tags-cloud");
    cloud.innerHTML = [...allTags].sort().map(t =>
      `<span class="hw-tag${activeTags.has(t) ? " hw-active" : ""}" data-tag="${t}">${t}</span>`
    ).join("");

    cloud.querySelectorAll(".hw-tag").forEach(el => {
      el.addEventListener("click", () => {
        const t = el.dataset.tag;
        activeTags.has(t) ? activeTags.delete(t) : activeTags.add(t);
        buildTagsCloud(root);
        applyFilters(root);
        updateToggleBtn(root);
      });
    });
  }

  function updateToggleBtn(root) {
    const btn   = root.querySelector(".hw-tags-toggle");
    const cloud = root.querySelector(".hw-tags-cloud");
    const open  = cloud.style.display !== "none";
    const count = activeTags.size > 0 ? ` (${activeTags.size})` : "";
    btn.textContent = (open ? "Tags ▴" : "Tags ▾") + count;
  }

  /* ─── Stats ──────────────────────────────────────────────── */
  function updateStats(root) {
    const arts  = filtered.length;
    const highs = filtered.reduce((s, i) => s + (i.highlights?.length || 0), 0);
    root.querySelector(".hw-stats").innerHTML =
      `<strong>${arts}</strong> artigos &nbsp;·&nbsp;
       <strong>${highs}</strong> destaques &nbsp;·&nbsp;
       <strong>${allTags.size}</strong> tags`;
  }

  /* ─── Toggle card ────────────────────────────────────────── */
  function toggleCard(card) {
    card.classList.toggle("hw-open");
    const isOpen = card.classList.contains("hw-open");
    const btn    = card.querySelector(".hw-toggle-btn");
    const count  = parseInt(btn.dataset.count, 10);
    btn.querySelector(".hw-label").textContent =
      isOpen ? "ocultar destaques" : `ver destaques (${count})`;
  }

  /* ─── Render cards ───────────────────────────────────────── */
  function renderCards(root) {
    const listEl  = root.querySelector(".hw-list");
    const emptyEl = root.querySelector(".hw-empty");

    if (!filtered.length) {
      listEl.innerHTML = "";
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    const page = filtered.slice(0, visibleCount);

    listEl.innerHTML = page.map((item) => {
      const host  = getHostname(item.url);
      const date  = formatDate(item.date);
      const fav   = `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
      const count = item.highlights?.length || 0;

      const tagsHtml = (item.tags || []).length
        ? `<div class="hw-card-tags">${
            item.tags.map(t =>
              `<span class="hw-tag${activeTags.has(t) ? " hw-active" : ""}" data-tag="${t}">${t}</span>`
            ).join("")
          }</div>`
        : "";

      const pageComment = item.page_comment
        ? `<div class="hw-page-comment">${item.page_comment}</div>`
        : "";

      const highlightsHtml = (item.highlights || []).map(h => {
        const color = (h.color || "yellow").toLowerCase();
        const note  = h.highlight_note
          ? `<div class="hw-highlight-note">${h.highlight_note}</div>`
          : "";
        return `<div class="hw-highlight hw-${color}">
          <p class="hw-highlight-text">${h.highlight}</p>
          ${note}
        </div>`;
      }).join("");

      return `
        <article class="hw-card">
          <div class="hw-card-top">
            <div class="hw-favicon">
              <img src="${fav}" alt="" loading="lazy" onerror="this.style.display='none'">
            </div>
            <div class="hw-meta">
              <a class="hw-title" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
              <div class="hw-hostname">${host}</div>
              <div class="hw-date">${date}</div>
              ${tagsHtml}
            </div>
          </div>

          <div class="hw-toggle-row">
            <button class="hw-toggle-btn" data-count="${count}">
              <span class="hw-label">ver destaques (${count})</span>
              <span class="hw-arrow">▼</span>
            </button>
            <span class="hw-badge">${count} nota${count !== 1 ? "s" : ""}</span>
          </div>

          <div class="hw-card-body">
            ${pageComment}
            ${highlightsHtml}
            <button class="hw-close-btn">fechar ↑</button>
          </div>
        </article>
      `;
    }).join("");

    /* Eventos */
    listEl.querySelectorAll(".hw-card").forEach(card => {
      card.querySelector(".hw-toggle-btn").addEventListener("click", () => toggleCard(card));
      card.querySelector(".hw-close-btn").addEventListener("click", () => {
        card.classList.remove("hw-open");
        const btn = card.querySelector(".hw-toggle-btn");
        btn.querySelector(".hw-label").textContent =
          `ver destaques (${btn.dataset.count})`;
      });
      card.querySelectorAll(".hw-tag").forEach(tag => {
        tag.addEventListener("click", e => {
          e.stopPropagation();
          const t = tag.dataset.tag;
          activeTags.has(t) ? activeTags.delete(t) : activeTags.add(t);
          buildTagsCloud(root);
          applyFilters(root);
          updateToggleBtn(root);
        });
      });
    });

    /* "Ver mais" */
    const oldMore = listEl.querySelector(".hw-load-more");
    if (oldMore) oldMore.remove();

    if (visibleCount < filtered.length) {
      const rest = filtered.length - visibleCount;
      const btn  = document.createElement("button");
      btn.className   = "hw-load-more";
      btn.textContent = `ver mais (${rest} restante${rest !== 1 ? "s" : ""})`;
      btn.addEventListener("click", () => { visibleCount += 10; renderCards(root); });
      listEl.appendChild(btn);
    }
  }

  /* ─── Filtros ────────────────────────────────────────────── */
  function applyFilters(root) {
    const term = root.querySelector(".hw-search").value.toLowerCase().trim();
    filtered = allItems.filter(item => {
      const matchTag = activeTags.size === 0 ||
        [...activeTags].every(t => (item.tags || []).includes(t));
      if (!matchTag) return false;
      if (!term) return true;
      return (
        item.title?.toLowerCase().includes(term) ||
        item.url?.toLowerCase().includes(term) ||
        item.page_comment?.toLowerCase().includes(term) ||
        (item.tags || []).some(t => t.toLowerCase().includes(term)) ||
        (item.highlights || []).some(h =>
          h.highlight?.toLowerCase().includes(term) ||
          h.highlight_note?.toLowerCase().includes(term)
        )
      );
    });
    visibleCount = 10;
    updateStats(root);
    renderCards(root);
  }

  /* ─── Init ───────────────────────────────────────────────── */
  async function init(root) {
    injectStyles();
    root.classList.add("hw-widget");

    root.innerHTML = `
      <input class="hw-search" type="text" placeholder="Buscar por texto, título ou tag…" />
      <button class="hw-tags-toggle">Tags ▾</button>
      <div class="hw-tags-cloud" style="display:none;"></div>
      <div class="hw-stats hw-loading">Carregando destaques…</div>
      <div class="hw-list"></div>
      <p class="hw-empty" style="display:none;">Nenhum destaque encontrado com os filtros aplicados.</p>
    `;

    /* Tags toggle */
    const tagsToggle = root.querySelector(".hw-tags-toggle");
    const tagsCloud  = root.querySelector(".hw-tags-cloud");
    tagsToggle.addEventListener("click", () => {
      const open = tagsCloud.style.display === "none";
      tagsCloud.style.display = open ? "flex" : "none";
      updateToggleBtn(root);
    });

    /* Busca */
    root.querySelector(".hw-search").addEventListener("input", () => {
      activeTags.clear();
      buildTagsCloud(root);
      applyFilters(root);
    });

    /* Fetch JSON */
    try {
      const res = await fetch(`${JSON_URL}?v=${Date.now()}`);
      if (!res.ok) throw new Error(res.statusText);
      const obj = await res.json();

      allItems = Object.entries(obj)
        .map(([url, data]) => ({ url, ...data }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      filtered = [...allItems];
      allItems.forEach(item => (item.tags || []).forEach(t => allTags.add(t)));

      updateStats(root);
      buildTagsCloud(root);
      renderCards(root);
    } catch (e) {
      root.querySelector(".hw-stats").innerHTML =
        `❌ Erro ao carregar destaques: ${e.message}`;
    }
  }

  /* ─── Auto-init via [data-highlights-widget] ─────────────── */
  function autoInit() {
    document.querySelectorAll("[data-highlights-widget]").forEach(el => init(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }

  /* API pública */
  window.HighlightsWidget = { init };
})();
