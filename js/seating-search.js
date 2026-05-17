/* =========================================================
   seating-search.js — Fuzzy guest search (Fuse.js) and
                       SVG floor plan interaction.
   Initialised after auth.js fires 'seating:unlocked'.
   ========================================================= */

(function () {
  'use strict';

  let guestData = [];
  let fuse      = null;
  let activeTable = null;    // currently highlighted table number

  /* ---- DOM refs ---- */
  const searchInput   = document.getElementById('guest-search');
  const resultsPanel  = document.getElementById('search-results');
  const tableInfoPanel = document.getElementById('table-info-panel');
  const searchHint    = document.getElementById('search-hint');

  /* ---- Load guest data ---- */
  async function loadData() {
    try {
      const resp = await fetch('data/seating.json');
      if (!resp.ok) throw new Error('Failed to load seating data');
      guestData = await resp.json();
      initFuse();
    } catch (err) {
      console.error('Seating data error:', err);
      if (resultsPanel) {
        resultsPanel.innerHTML = '<p class="no-results">Unable to load seating data. Please refresh the page.</p>';
      }
    }
  }

  /* ---- Fuse.js setup ---- */
  function initFuse() {
    if (typeof Fuse === 'undefined') {
      console.error('Fuse.js not loaded');
      return;
    }
    fuse = new Fuse(guestData, {
      keys: [
        { name: 'name',  weight: 0.8 },
        { name: 'alias', weight: 0.4 }
      ],
      threshold:      0.38,
      includeScore:   true,
      ignoreLocation: true,
      minMatchCharLength: 2
    });
  }

  /* ---- Search handler ---- */
  function handleSearch() {
    const query = (searchInput?.value || '').trim();

    if (query.length < 2) {
      clearResults();
      if (searchHint) searchHint.style.display = 'block';
      return;
    }

    if (searchHint) searchHint.style.display = 'none';

    const results = fuse ? fuse.search(query) : [];
    displayResults(results);

    if (results.length > 0) {
      highlightTable(results[0].item.table);
    } else {
      clearHighlight();
    }
  }

  /* ---- Display search results ---- */
  function displayResults(results) {
    if (!resultsPanel) return;
    resultsPanel.innerHTML = '';

    if (results.length === 0) {
      resultsPanel.innerHTML = '<p class="no-results">No guest found. Check the spelling and try again.</p>';
      hideTableInfo();
      return;
    }

    // Show up to 6 results
    results.slice(0, 6).forEach(({ item }) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="result-card__name">${escHtml(item.name)}${item.alias ? ` <span class="guest-alias">(${escHtml(item.alias)})</span>` : ''}</div>
        <div class="result-card__table">${escHtml(item.tableLabel)}</div>
        <div class="result-card__side">${sideLabel(item.side)}</div>
      `;

      const activate = () => {
        resultsPanel.querySelectorAll('.result-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        highlightTable(item.table);
      };

      card.addEventListener('click', activate);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') activate(); });
      resultsPanel.appendChild(card);
    });
  }

  /* ---- SVG table highlight ---- */
  function highlightTable(tableNum) {
    clearHighlight();

    const tableEl = document.getElementById(`table-${tableNum}`);
    if (tableEl) {
      tableEl.classList.add('highlighted');
      activeTable = tableNum;
      showTableInfo(tableNum);

      // Scroll SVG into view on mobile
      const floorPlan = document.querySelector('.floor-plan-container');
      if (floorPlan && window.innerWidth < 900) {
        floorPlan.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function clearHighlight() {
    if (activeTable !== null) {
      const prev = document.getElementById(`table-${activeTable}`);
      if (prev) prev.classList.remove('highlighted');
      activeTable = null;
    }
  }

  /* ---- Table info panel ---- */
  function showTableInfo(tableNum) {
    if (!tableInfoPanel) return;

    const guests = guestData.filter(g => g.table === tableNum);
    if (!guests.length) {
      hideTableInfo();
      return;
    }

    const side = guests[0].side;
    tableInfoPanel.classList.remove('hidden');
    tableInfoPanel.innerHTML = `
      <h3 class="table-info__title">${escHtml(guests[0].tableLabel)}</h3>
      <p class="table-info__side">${sideLabel(side)}</p>
      <ul class="table-guest-list" aria-label="Guests at ${escHtml(guests[0].tableLabel)}">
        ${guests.map(g => `<li>${escHtml(g.name)}${g.alias ? ` <span class="guest-alias">(${escHtml(g.alias)})</span>` : ''}</li>`).join('')}
      </ul>
    `;
  }

  function hideTableInfo() {
    if (tableInfoPanel) tableInfoPanel.classList.add('hidden');
  }

  /* ---- SVG table click + keyboard handlers ---- */
  function setupSvgClickHandlers() {
    document.querySelectorAll('.svg-table').forEach(el => {
      const activate = () => {
        const tableNum = parseInt(el.dataset.table, 10);
        // Clear search input so results don't conflict with manual selection
        if (searchInput) searchInput.value = '';
        if (resultsPanel) resultsPanel.innerHTML = '';
        if (searchHint) searchHint.style.display = 'none';
        highlightTable(tableNum);
      };

      el.addEventListener('click', activate);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  /* ---- Helpers ---- */
  function clearResults() {
    if (resultsPanel) resultsPanel.innerHTML = '';
    clearHighlight();
    hideTableInfo();
  }

  function sideLabel(side) {
    if (side === 'groom') return "Groom's Side";
    if (side === 'bride') return "Bride's Side";
    return '';
  }

  function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
  }

  /* ---- Init ---- */
  function init() {
    loadData();
    setupSvgClickHandlers();

    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          clearResults();
          if (searchHint) searchHint.style.display = 'block';
        }
      });
    }
  }

  // Initialise only after the password gate is passed.
  // auth.js dispatches 'seating:unlocked' both on first correct entry
  // and when a valid session is already stored in sessionStorage.
  document.addEventListener('seating:unlocked', init);
})();
