/**
 * BusRío v2 - Application Logic
 * Lógica modular interactiva con arquitectura de Variables CSS, estética de alta gama:
 * Filtros de garitas, renderizado reactivo con 4 estados UI comprobados,
 * mapa Leaflet con estilizado personalizado, formulario de alertas ciudadanas y switch de tema.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado local de la aplicación
  const state = {
    selectedStop: 'all',
    searchQuery: '',
    map: null,
    routeLayers: {},
    stopMarkers: {},
    activeModalLine: null
  };

  // Inicialización de componentes
  initTheme();
  initMobileMenu();
  initStopFilterTabs();
  initSearch();
  initCardGrid();
  initAlertsFeed();
  initAlertForm();
  initModal();
  initLeafletMap();
  initLiveCountdown();

  /* ==========================================================================
     1. GESTIÓN DE TEMA (MODO OSCURO / MODO CLARO)
     ========================================================================== */
  function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    function applyTheme(isDark) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('busrio_theme', 'dark');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-amber-300 text-sm';
        if (themeText) themeText.textContent = 'Claro';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('busrio_theme', 'light');
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-blue-600 text-sm';
        if (themeText) themeText.textContent = 'Oscuro';
      }
    }

    const savedTheme = localStorage.getItem('busrio_theme');
    // Por defecto inicia en Modo Oscuro (Predeterminado de alta gama)
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    applyTheme(isDark);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentlyDark = document.documentElement.classList.contains('dark');
        applyTheme(!currentlyDark);
        showToast(
          !currentlyDark ? 'Modo Oscuro Activado 🌙' : 'Modo Claro Activado ☀️',
          'info'
        );
      });
    }
  }

  /* ==========================================================================
     2. MENÚ HAMBURGUESA RESPONSIVE
     ========================================================================== */
  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      } else {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ==========================================================================
     3. TABS Y FILTROS POR GARITA (CÁPSULAS HIGH-END)
     ========================================================================== */
  function initStopFilterTabs() {
    const tabsContainer = document.getElementById('stop-tabs-container');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    // Botón "Todas las Paradas"
    const allBtn = createTabButton('all', 'Todas las Paradas', 'fa-solid fa-layer-group', true);
    tabsContainer.appendChild(allBtn);

    // Botones por cada parada crítica de Río Cuarto
    BUSRIO_DATA.stops.forEach(stop => {
      const icon = stop.id === 'hospital-padua' ? 'fa-solid fa-hospital' :
                   stop.id === 'unrc-campus' ? 'fa-solid fa-graduation-cap' :
                   stop.id === 'plaza-roca' ? 'fa-solid fa-tree' : 'fa-solid fa-location-dot';
      const btn = createTabButton(stop.id, stop.name, icon, false);
      tabsContainer.appendChild(btn);
    });
  }

  function createTabButton(id, label, iconClass, isActive) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-stop-id', id);
    btn.className = `stop-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all duration-200 whitespace-nowrap min-h-[36px] ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] border border-transparent hover:border-[var(--border-color)]'
    }`;
    btn.innerHTML = `<i class="${iconClass} text-[11px]"></i><span>${label}</span>`;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.stop-tab-btn').forEach(b => {
        b.className = 'stop-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all duration-200 whitespace-nowrap min-h-[36px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] border border-transparent hover:border-[var(--border-color)]';
      });
      btn.className = 'stop-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all duration-200 whitespace-nowrap min-h-[36px] bg-blue-600 text-white shadow-md shadow-blue-500/25';

      state.selectedStop = id;
      triggerCardRenderWithLoading();

      // Centrado suave en el mapa al seleccionar parada
      if (id !== 'all' && state.map) {
        const targetStop = BUSRIO_DATA.stops.find(s => s.id === id);
        if (targetStop) {
          state.map.flyTo(targetStop.coords, 15, { duration: 1.2 });
          if (state.stopMarkers[id]) {
            state.stopMarkers[id].openPopup();
          }
        }
      } else if (id === 'all' && state.map) {
        state.map.flyTo([BUSRIO_DATA.cityCenter.lat, BUSRIO_DATA.cityCenter.lng], BUSRIO_DATA.cityCenter.zoom, { duration: 1.2 });
      }
    });

    return btn;
  }

  /* ==========================================================================
     4. BÚSQUEDA RÁPIDA (HERO Y MONITOR)
     ========================================================================== */
  function initSearch() {
    const heroSearchInput = document.getElementById('hero-search-input');
    const heroSearchBtn = document.getElementById('hero-search-btn');
    const monitorSearchInput = document.getElementById('monitor-search-input');

    function executeSearch(query) {
      state.searchQuery = query.toLowerCase().trim();
      if (monitorSearchInput) monitorSearchInput.value = query;
      triggerCardRenderWithLoading();

      const monitorSection = document.getElementById('monitor');
      if (monitorSection) {
        monitorSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    if (heroSearchBtn && heroSearchInput) {
      heroSearchBtn.addEventListener('click', () => {
        executeSearch(heroSearchInput.value);
      });
      heroSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch(heroSearchInput.value);
      });
    }

    if (monitorSearchInput) {
      monitorSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        triggerCardRenderWithLoading();
      });
    }
  }

  /* ==========================================================================
     5. RENDERIZADO DE TARJETAS (4 ESTADOS UI COMPROBADOS)
     ========================================================================== */
  function triggerCardRenderWithLoading() {
    const gridContainer = document.getElementById('lines-grid');
    const skeletonContainer = document.getElementById('lines-skeleton');
    const emptyContainer = document.getElementById('lines-empty');

    if (!gridContainer || !skeletonContainer || !emptyContainer) return;

    // Estado 1: ⏳ LOADING
    gridContainer.classList.add('hidden');
    emptyContainer.classList.add('hidden');
    skeletonContainer.classList.remove('hidden');

    // Transición visual ágil de 160ms
    setTimeout(() => {
      skeletonContainer.classList.add('hidden');
      renderCards();
    }, 160);
  }

  function initCardGrid() {
    triggerCardRenderWithLoading();
  }

  function renderCards() {
    const gridContainer = document.getElementById('lines-grid');
    const emptyContainer = document.getElementById('lines-empty');
    if (!gridContainer || !emptyContainer) return;

    const filteredLines = BUSRIO_DATA.lines.filter(line => {
      const matchesStop = (state.selectedStop === 'all') ||
        (BUSRIO_DATA.stops.find(s => s.id === state.selectedStop)?.lines.includes(line.id));

      const matchesQuery = !state.searchQuery ||
        line.number.toLowerCase().includes(state.searchQuery) ||
        line.name.toLowerCase().includes(state.searchQuery) ||
        line.direction.toLowerCase().includes(state.searchQuery) ||
        line.stopName.toLowerCase().includes(state.searchQuery);

      return matchesStop && matchesQuery;
    });

    // Estado 2: 📭 EMPTY
    if (filteredLines.length === 0) {
      gridContainer.classList.add('hidden');
      emptyContainer.classList.remove('hidden');

      const resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) {
        resetBtn.onclick = () => {
          state.selectedStop = 'all';
          state.searchQuery = '';
          const searchInput = document.getElementById('monitor-search-input');
          if (searchInput) searchInput.value = '';
          initStopFilterTabs();
          triggerCardRenderWithLoading();
        };
      }
      return;
    }

    // Estado 3: ✅ SUCCESS
    emptyContainer.classList.add('hidden');
    gridContainer.classList.remove('hidden');
    gridContainer.innerHTML = '';

    filteredLines.forEach(line => {
      const card = createLineCard(line);
      gridContainer.appendChild(card);
    });
  }

  function createLineCard(line) {
    const article = document.createElement('article');
    article.className = 'group relative glass-card rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between hover:border-blue-500/40';

    // Estados visuales tipo badge de alta gama
    let statusBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    let statusDotColor = 'bg-emerald-500';
    let pulseClass = line.etaMinutes <= 5 ? 'animate-pulse' : '';

    if (line.status === 'warning') {
      statusBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      statusDotColor = 'bg-amber-500';
    } else if (line.status === 'danger') {
      statusBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      statusDotColor = 'bg-rose-500';
    }

    article.innerHTML = `
      <div>
        <!-- Fila Superior: Badge de Línea + ETA Pill -->
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center px-3 py-1 rounded-lg font-heading font-bold text-xs text-white shadow-sm ${line.bgClass}">
              ${line.number}
            </span>
            <div>
              <h3 class="font-heading font-bold text-[var(--text-primary)] text-sm sm:text-base leading-tight group-hover:text-blue-500 transition-colors">
                ${line.name}
              </h3>
              <span class="text-[11px] text-[var(--text-muted)] font-medium">Frecuencia: ${line.frequency}</span>
            </div>
          </div>

          <!-- Chip de Arribo (ETA) -->
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${pulseClass} bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] shrink-0">
            <span class="w-2 h-2 rounded-full ${statusDotColor}"></span>
            <span>${line.etaMinutes} min</span>
          </div>
        </div>

        <!-- Trayecto y Garita -->
        <div class="space-y-2 py-3 border-y border-[var(--border-color)] my-3 text-xs">
          <div class="flex items-start gap-2.5">
            <div class="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
              <i class="fa-solid fa-location-dot text-[10px]"></i>
            </div>
            <div>
              <span class="text-[10px] text-[var(--text-muted)] block font-medium">Parada:</span>
              <strong class="text-[var(--text-primary)] font-semibold">${line.stopName}</strong>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <div class="w-5 h-5 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </div>
            <div>
              <span class="text-[10px] text-[var(--text-muted)] block font-medium">Destino:</span>
              <span class="text-[var(--text-secondary)] font-medium">${line.direction}</span>
            </div>
          </div>
        </div>

        <!-- Chips de Estado y Accesibilidad -->
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusBadgeColor}">
            <span class="w-1.5 h-1.5 rounded-full ${statusDotColor}"></span>
            <span>${line.statusLabel}</span>
          </span>

          ${line.accessible ? `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)]" title="Unidad con rampa automática">
              <i class="fa-solid fa-wheelchair text-[11px] text-blue-500"></i>
              <span>Rampa accesible</span>
            </span>
          ` : `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] text-[var(--text-muted)] border border-[var(--border-color)]" title="Piso convencional">
              <span>Piso Convencional</span>
            </span>
          `}
        </div>
      </div>

      <!-- Botones de Acción Estilo High-End -->
      <div class="flex items-center gap-2 pt-2">
        <button type="button" class="view-route-btn flex-1 min-h-[38px] px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2" data-line-id="${line.id}">
          <i class="fa-solid fa-route text-xs"></i>
          <span>Ver Recorrido</span>
        </button>

        <button type="button" class="locate-map-btn min-h-[38px] px-3 py-2 bg-[var(--bg-primary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-xs font-semibold transition-all flex items-center justify-center border border-[var(--border-color)]" title="Localizar en Mapa" data-line-id="${line.id}">
          <i class="fa-solid fa-map-location-dot"></i>
          <span class="sr-only">Localizar en mapa</span>
        </button>
      </div>
    `;

    const viewRouteBtn = article.querySelector('.view-route-btn');
    if (viewRouteBtn) {
      viewRouteBtn.addEventListener('click', () => openLineModal(line));
    }

    const locateMapBtn = article.querySelector('.locate-map-btn');
    if (locateMapBtn) {
      locateMapBtn.addEventListener('click', () => {
        focusLineOnMap(line);
      });
    }

    return article;
  }

  /* ==========================================================================
     6. INTEGRACIÓN DE MAPA INTERACTIVO (LEAFLET.JS)
     ========================================================================== */
  function initLeafletMap() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    state.map = L.map('leaflet-map', {
      center: [BUSRIO_DATA.cityCenter.lat, BUSRIO_DATA.cityCenter.lng],
      zoom: BUSRIO_DATA.cityCenter.zoom,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | BusRío'
    }).addTo(state.map);

    BUSRIO_DATA.stops.forEach(stop => {
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white ring-2 ring-blue-500/40 cursor-pointer transition-transform hover:scale-110">
            <i class="fa-solid fa-bus text-xs"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(stop.coords, { icon: customIcon }).addTo(state.map);

      const popupContent = `
        <div class="p-2 font-sans">
          <span class="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full mb-1">${stop.type}</span>
          <h4 class="font-heading font-bold text-[var(--text-primary)] text-sm mt-1">${stop.name}</h4>
          <p class="text-xs text-[var(--text-secondary)] mt-1">${stop.address}</p>
          <div class="mt-2.5 pt-2 border-t border-[var(--border-color)]">
            <span class="text-[11px] font-semibold text-[var(--text-primary)]">Líneas en esta parada:</span>
            <div class="flex flex-wrap gap-1 mt-1.5">
              ${stop.lines.map(lineId => {
                const l = BUSRIO_DATA.lines.find(item => item.id === lineId);
                return l ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${l.bgClass}">${l.number}</span>` : '';
              }).join('')}
            </div>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      state.stopMarkers[stop.id] = marker;
    });

    BUSRIO_DATA.lines.forEach(line => {
      if (line.routeCoords && line.routeCoords.length > 0) {
        const polyline = L.polyline(line.routeCoords, {
          color: line.color,
          weight: 4,
          opacity: 0.85,
          dashArray: line.status === 'danger' ? '8, 8' : null
        }).addTo(state.map);

        polyline.bindTooltip(`<strong>${line.number}</strong>: ${line.name}`, { sticky: true });
        state.routeLayers[line.id] = polyline;
      }
    });

    const resetViewBtn = document.getElementById('map-reset-btn');
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => {
        state.map.flyTo([BUSRIO_DATA.cityCenter.lat, BUSRIO_DATA.cityCenter.lng], BUSRIO_DATA.cityCenter.zoom, { duration: 1 });
      });
    }

    window.addEventListener('resize', () => {
      if (state.map) state.map.invalidateSize();
    });
  }

  function focusLineOnMap(line) {
    const mapSection = document.getElementById('mapa');
    if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth' });

    if (state.map && state.routeLayers[line.id]) {
      setTimeout(() => {
        state.map.fitBounds(state.routeLayers[line.id].getBounds(), { padding: [40, 40] });
        showToast(`Mostrando recorrido de ${line.number} en el mapa`, 'info');
      }, 400);
    }
  }

  /* ==========================================================================
     7. MODAL DE DETALLES DE RECORRIDO (GLASS DRAWER)
     ========================================================================== */
  function initModal() {
    const modal = document.getElementById('route-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const backdrop = document.getElementById('modal-backdrop');

    function closeModal() {
      if (!modal) return;
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  function openLineModal(line) {
    const modal = document.getElementById('route-modal');
    if (!modal) return;

    const modalLineNumber = document.getElementById('modal-line-number');
    if (modalLineNumber) {
      modalLineNumber.textContent = line.number;
      modalLineNumber.className = `px-3 py-1 rounded-lg text-white font-heading font-bold text-xs ${line.bgClass}`;
    }

    document.getElementById('modal-line-title').textContent = line.name;
    document.getElementById('modal-line-direction').textContent = line.direction;
    document.getElementById('modal-line-desc').textContent = line.description;
    document.getElementById('modal-line-freq').textContent = line.frequency;
    document.getElementById('modal-line-status').textContent = line.statusLabel;

    const stopsListContainer = document.getElementById('modal-stops-timeline');
    if (stopsListContainer) {
      stopsListContainer.innerHTML = '';
      line.stopsList.forEach((stopName, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === line.stopsList.length - 1;
        const stopItem = document.createElement('li');
        stopItem.className = 'relative flex items-center gap-4 pb-4 last:pb-0';
        stopItem.innerHTML = `
          <div class="relative z-10 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
            isFirst ? 'bg-blue-600 text-white shadow-sm' : isLast ? 'bg-rose-500 text-white shadow-sm' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]'
          }">
            ${idx + 1}
          </div>
          <span class="text-xs ${isFirst || isLast ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] font-medium'}">
            ${stopName} ${isFirst ? '<span class="text-[10px] text-blue-500 font-normal">(Cabecera)</span>' : ''} ${isLast ? '<span class="text-[10px] text-rose-500 font-normal">(Destino)</span>' : ''}
          </span>
        `;
        stopsListContainer.appendChild(stopItem);
      });
    }

    const modalMapBtn = document.getElementById('modal-map-action-btn');
    if (modalMapBtn) {
      modalMapBtn.onclick = () => {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        focusLineOnMap(line);
      };
    }

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  /* ==========================================================================
     8. ALERTA CIUDADANA Y FORMULARIO
     ========================================================================== */
  function initAlertsFeed() {
    const feedContainer = document.getElementById('alerts-feed-container');
    if (!feedContainer) return;

    feedContainer.innerHTML = '';
    BUSRIO_DATA.alerts.forEach(alert => {
      feedContainer.appendChild(createAlertCard(alert));
    });

    document.querySelectorAll('.quick-report-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const incidentText = btn.getAttribute('data-incident');
        const incidentSelect = document.getElementById('report-type');
        if (incidentSelect && incidentText) {
          incidentSelect.value = incidentText;
          document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' });
          showToast(`Incidencia "${incidentText}" seleccionada. Completa la parada y confirma el envío.`, 'info');
        }
      });
    });
  }

  function createAlertCard(alert) {
    const item = document.createElement('div');
    const badgeColor = alert.type === 'danger' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                       alert.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    const dotColor = alert.type === 'danger' ? 'bg-rose-500' :
                     alert.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';

    item.className = 'p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] transition-all hover:border-blue-500/40 text-xs';
    item.innerHTML = `
      <div class="flex items-start justify-between gap-3 mb-2">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}">
            <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
            <span>${alert.line}</span>
          </span>
          <h4 class="font-heading font-bold text-[var(--text-primary)] text-xs">${alert.title}</h4>
        </div>
        <span class="text-[10px] text-[var(--text-muted)] font-medium whitespace-nowrap">${alert.time}</span>
      </div>
      <p class="text-[11px] text-[var(--text-secondary)] mb-2 leading-relaxed">${alert.description}</p>
      <div class="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)]">
        <span class="flex items-center gap-1.5"><i class="fa-solid fa-location-dot text-blue-500"></i>${alert.stop}</span>
        <span class="flex items-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-500"></i>${alert.author}</span>
      </div>
    `;
    return item;
  }

  function initAlertForm() {
    const form = document.getElementById('report-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const lineSelect = document.getElementById('report-line');
      const stopSelect = document.getElementById('report-stop');
      const typeSelect = document.getElementById('report-type');
      const commentInput = document.getElementById('report-comment');
      const nameInput = document.getElementById('report-name');

      clearFormErrors();

      let hasError = false;

      if (!lineSelect.value) {
        showFieldError(lineSelect, 'Selecciona la línea de colectivo.');
        hasError = true;
      }

      if (!stopSelect.value) {
        showFieldError(stopSelect, 'Selecciona la garita o nodo.');
        hasError = true;
      }

      if (!typeSelect.value) {
        showFieldError(typeSelect, 'Indica el tipo de incidencia.');
        hasError = true;
      }

      if (hasError) {
        showToast('Completa los campos requeridos marcados en rojo.', 'error');
        return;
      }

      const selectedLineObj = BUSRIO_DATA.lines.find(l => l.id === lineSelect.value);
      const selectedStopObj = BUSRIO_DATA.stops.find(s => s.id === stopSelect.value);

      const newAlert = {
        id: `alt-${Date.now()}`,
        type: typeSelect.value.includes('Desvío') || typeSelect.value.includes('Corte') ? 'danger' : 'warning',
        title: typeSelect.value,
        line: selectedLineObj ? selectedLineObj.number : 'Línea Urbana',
        stop: selectedStopObj ? selectedStopObj.name : stopSelect.value,
        author: nameInput.value.trim() ? `${nameInput.value.trim()} (Pasajero)` : 'Pasajero Verificado',
        time: 'Recién ahora',
        description: commentInput.value.trim() || `Reporte de ${typeSelect.value} en garita de Río Cuarto emitido desde la PWA.`
      };

      // Estado 4: ✅ SUCCESS - Agregar al store y al feed
      BUSRIO_DATA.alerts.unshift(newAlert);
      const feedContainer = document.getElementById('alerts-feed-container');
      if (feedContainer) {
        feedContainer.prepend(createAlertCard(newAlert));
      }

      form.reset();
      showToast('¡Alerta comunitaria publicada con éxito! Gracias por colaborar con los usuarios de Río Cuarto.', 'success');
    });
  }

  function showFieldError(field, message) {
    field.classList.add('border-rose-500', 'focus:ring-rose-500');
    field.classList.remove('border-[var(--border-color)]');
    const parent = field.parentElement;
    const errorMsg = document.createElement('p');
    errorMsg.className = 'field-error-text text-rose-500 text-[11px] mt-1 font-medium';
    errorMsg.textContent = message;
    parent.appendChild(errorMsg);
  }

  function clearFormErrors() {
    document.querySelectorAll('.field-error-text').forEach(el => el.remove());
    document.querySelectorAll('#report-form select, #report-form input').forEach(field => {
      field.classList.remove('border-rose-500', 'focus:ring-rose-500');
      field.classList.add('border-[var(--border-color)]');
    });
  }

  /* ==========================================================================
     9. TOAST DE NOTIFICACIÓN FLOTANTE (ESTILO HIGH-END PILL)
     ========================================================================== */
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-6 right-6 z-[2000] flex flex-col gap-2.5 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-950/30' :
                    type === 'error' ? 'bg-rose-600 text-white shadow-rose-950/30' :
                    'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-950/30';
    const icon = type === 'success' ? 'fa-solid fa-circle-check' :
                 type === 'error' ? 'fa-solid fa-circle-xmark' :
                 'fa-solid fa-circle-info';

    toast.className = `pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl font-sans text-xs font-bold tracking-wide transition-all duration-300 translate-y-4 opacity-0 border border-white/10 backdrop-blur-md ${bgClass}`;
    toast.innerHTML = `
      <i class="${icon} text-sm"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /* ==========================================================================
     10. SIMULACIÓN DE CUENTA REGRESIVA DE LLEGADA (ETA TICKER)
     ========================================================================== */
  function initLiveCountdown() {
    setInterval(() => {
      BUSRIO_DATA.lines.forEach(line => {
        if (line.etaMinutes > 1) {
          line.etaMinutes -= 1;
        } else {
          line.etaMinutes = Math.floor(Math.random() * 8) + 6;
        }
      });
      if (!state.searchQuery && state.selectedStop === 'all') {
        renderCards();
      }
    }, 40000);
  }
});
