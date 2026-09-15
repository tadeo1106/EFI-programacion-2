/**
 * BusRío v2 - Application Logic
 * Centro de Control de Colectivos en Tiempo Real (Río Cuarto)
 * - Monitor y Mapa interactivo Leaflet unificados en una sola vista de comando.
 * - Cero saltos de layout (CLS = 0) al filtrar garitas o buscar líneas.
 * - Selector de vista móvil (Lista <-> Mapa) sin scroll infinito.
 * - Toasts 100% responsivos adaptados a pantallas estrechas de celular.
 * - Sistema bimodal con Variables CSS persistente en LocalStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado local de la aplicación
  const state = {
    selectedStop: 'all',
    searchQuery: '',
    map: null,
    routeLayers: {},
    stopMarkers: {},
    activeLineId: null
  };

  // Inicialización de subsistemas
  initTheme();
  initMobileMenu();
  initMobileViewSwitcher();
  initStopFilterTabs();
  initSearch();
  initHeroQuickNodes();
  initCardGrid();
  initAlertsFeed();
  initAlertForm();
  initModal();
  initLeafletMap();
  initLiveCountdown();

  /* ==========================================================================
     1. GESTIÓN DE TEMA (MODO OSCURO PREDETERMINADO / MODO CLARO)
     ========================================================================== */
  function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    function applyTheme(isDark) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('busrio_theme', 'dark');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-amber-300 text-sm';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('busrio_theme', 'light');
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-blue-600 text-sm';
      }
    }

    const savedTheme = localStorage.getItem('busrio_theme');
    // Por defecto inicia en Modo Oscuro de alta gama
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    applyTheme(isDark);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentlyDark = document.documentElement.classList.contains('dark');
        applyTheme(!currentlyDark);
        showToast(
          !currentlyDark ? 'Modo Oscuro activado 🌙' : 'Modo Claro activado ☀️',
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
     3. ALTERNADOR DE VISTA MÓVIL (LISTA <-> MAPA)
     ========================================================================== */
  function initMobileViewSwitcher() {
    const btnList = document.getElementById('mobile-view-list');
    const btnMap = document.getElementById('mobile-view-map');
    const listCol = document.getElementById('monitor-list-col');
    const mapCol = document.getElementById('monitor-map-col');

    if (!btnList || !btnMap || !listCol || !mapCol) return;

    btnList.addEventListener('click', () => {
      switchMobileView('list');
    });

    btnMap.addEventListener('click', () => {
      switchMobileView('map');
    });
  }

  function switchMobileView(view) {
    const btnList = document.getElementById('mobile-view-list');
    const btnMap = document.getElementById('mobile-view-map');
    const listCol = document.getElementById('monitor-list-col');
    const mapCol = document.getElementById('monitor-map-col');

    if (!btnList || !btnMap || !listCol || !mapCol) return;

    if (view === 'list') {
      listCol.classList.remove('hidden');
      listCol.classList.add('block');
      mapCol.classList.add('hidden');
      mapCol.classList.remove('block');

      btnList.className = 'flex-1 py-2 rounded-lg text-xs font-bold transition-all bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5';
      btnMap.className = 'flex-1 py-2 rounded-lg text-xs font-bold transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1.5';
    } else {
      listCol.classList.add('hidden');
      listCol.classList.remove('block');
      mapCol.classList.remove('hidden');
      mapCol.classList.add('block');

      btnMap.className = 'flex-1 py-2 rounded-lg text-xs font-bold transition-all bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5';
      btnList.className = 'flex-1 py-2 rounded-lg text-xs font-bold transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1.5';

      if (state.map) {
        setTimeout(() => state.map.invalidateSize(), 50);
      }
    }
  }

  /* ==========================================================================
     4. TABS Y FILTROS POR GARITA (PÍLDORAS DESLIZABLES)
     ========================================================================== */
  function initStopFilterTabs() {
    const tabsContainer = document.getElementById('stop-tabs-container');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    // Botón "Todas las Paradas"
    const allBtn = createTabButton('all', 'Todas las Garitas', 'fa-solid fa-layer-group', true);
    tabsContainer.appendChild(allBtn);

    // Botones por cada parada crítica de Río Cuarto
    BUSRIO_DATA.stops.forEach(stop => {
      const icon = stop.id === 'hospital-padua' ? 'fa-solid fa-hospital' :
                   stop.id === 'unrc-campus' ? 'fa-solid fa-graduation-cap' :
                   stop.id === 'plaza-roca' ? 'fa-solid fa-tree' :
                   stop.id === 'centro-trasbordo' ? 'fa-solid fa-arrows-split-up-and-left' :
                   stop.id === 'banda-norte' ? 'fa-solid fa-compass' : 'fa-solid fa-location-dot';
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
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-blue-500/30'
    }`;
    btn.innerHTML = `<i class="${iconClass} text-[11px]"></i><span>${label}</span>`;

    btn.addEventListener('click', () => {
      selectStopTab(id);
    });

    return btn;
  }

  function selectStopTab(id) {
    document.querySelectorAll('.stop-tab-btn').forEach(b => {
      b.className = 'stop-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all duration-200 whitespace-nowrap min-h-[36px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-blue-500/30';
    });
    const targetBtn = document.querySelector(`.stop-tab-btn[data-stop-id="${id}"]`);
    if (targetBtn) {
      targetBtn.className = 'stop-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all duration-200 whitespace-nowrap min-h-[36px] bg-blue-600 text-white shadow-md shadow-blue-500/25';
    }

    state.selectedStop = id;
    triggerCardRenderWithLoading();

    // Centrado suave en el mapa al seleccionar parada
    if (id !== 'all' && state.map) {
      const targetStop = BUSRIO_DATA.stops.find(s => s.id === id);
      if (targetStop) {
        state.map.flyTo(targetStop.coords, 15, { duration: 1 });
        if (state.stopMarkers[id]) {
          state.stopMarkers[id].openPopup();
        }
      }
    } else if (id === 'all' && state.map) {
      state.map.flyTo([BUSRIO_DATA.cityCenter.lat, BUSRIO_DATA.cityCenter.lng], BUSRIO_DATA.cityCenter.zoom, { duration: 1 });
    }
  }

  /* ==========================================================================
     5. BÚSQUEDA RÁPIDA (HERO Y MONITOR)
     ========================================================================= */
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

  function initHeroQuickNodes() {
    document.querySelectorAll('.quick-node-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stopId = btn.getAttribute('data-stop');
        if (stopId) {
          selectStopTab(stopId);
          document.getElementById('monitor')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ==========================================================================
     6. RENDERIZADO DE TARJETAS (ESTABILIDAD TOTAL DE TAMAÑO - CLS = 0)
     ========================================================================= */
  function triggerCardRenderWithLoading() {
    const gridContainer = document.getElementById('lines-grid');
    const skeletonContainer = document.getElementById('lines-skeleton');
    const emptyContainer = document.getElementById('lines-empty');

    if (!gridContainer || !skeletonContainer || !emptyContainer) return;

    // Estado 1: ⏳ LOADING (Mantiene dimensiones del contenedor padre sin saltos)
    gridContainer.classList.add('hidden');
    emptyContainer.classList.add('hidden');
    skeletonContainer.classList.remove('hidden');

    // Transición visual ágil y predecible de 120ms
    setTimeout(() => {
      skeletonContainer.classList.add('hidden');
      renderCards();
    }, 120);
  }

  function initCardGrid() {
    triggerCardRenderWithLoading();
  }

  function renderCards() {
    const gridContainer = document.getElementById('lines-grid');
    const emptyContainer = document.getElementById('lines-empty');
    const counterBadge = document.getElementById('lines-counter-badge');
    const mobileCounter = document.getElementById('mobile-line-count');
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

    const totalCount = filteredLines.length;
    if (counterBadge) counterBadge.textContent = `${totalCount} ${totalCount === 1 ? 'Línea' : 'Líneas'}`;
    if (mobileCounter) mobileCounter.textContent = totalCount;

    // Estado 2: 📭 EMPTY (Centrado dentro del scroll sin achicar el contenedor)
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
          selectStopTab('all');
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
    const isActive = state.activeLineId === line.id;

    article.className = `line-card group relative p-3.5 sm:p-4 rounded-xl glass-card transition-all duration-200 cursor-pointer border ${
      isActive
        ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-500/5'
        : 'border-[var(--card-border)] hover:border-blue-500/40'
    }`;
    article.setAttribute('data-line-id', line.id);

    // Estados visuales badges
    let statusBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    let statusDotColor = 'bg-emerald-500';
    let statusText = 'Normal';
    let pulseClass = line.etaMinutes <= 5 ? 'animate-pulse' : '';

    if (line.status === 'warning') {
      statusBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      statusDotColor = 'bg-amber-500';
      statusText = 'Demora';
    } else if (line.status === 'danger') {
      statusBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      statusDotColor = 'bg-rose-500';
      statusText = 'Desvío';
    }

    article.innerHTML = `
      <!-- Fila 1: Badge Línea + Nombre + ETA -->
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-heading font-bold text-xs text-white shadow-sm shrink-0 ${line.bgClass}">
            ${line.number}
          </span>
          <div class="min-w-0">
            <h4 class="font-heading font-bold text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-blue-500 transition-colors leading-tight truncate">
              ${line.name}
            </h4>
            <span class="text-[10px] text-[var(--text-muted)] font-medium">Cada ${line.frequency.replace('Cada ', '')}</span>
          </div>
        </div>

        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${pulseClass} bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] shrink-0">
          <span class="w-1.5 h-1.5 rounded-full ${statusDotColor}"></span>
          <span>${line.etaMinutes} min</span>
        </div>
      </div>

      <!-- Fila 2: Garita próxima y destino -->
      <div class="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] mb-2.5 bg-[var(--bg-primary)]/80 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)]">
        <i class="fa-solid fa-location-dot text-blue-500 text-[10px] shrink-0"></i>
        <span class="truncate">Garita: <strong class="text-[var(--text-primary)]">${line.stopName}</strong></span>
      </div>

      <!-- Fila 3: Chips de Estado y Acciones -->
      <div class="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-color)]">
        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadgeColor}">
            <span class="w-1 h-1 rounded-full ${statusDotColor}"></span>
            <span>${statusText}</span>
          </span>

          ${line.accessible ? `
            <span class="p-1 text-blue-500 text-xs" title="Unidad con rampa accesible">
              <i class="fa-solid fa-wheelchair"></i>
            </span>
          ` : ''}
        </div>

        <div class="flex items-center gap-1.5">
          <button type="button" class="locate-line-btn px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-all flex items-center gap-1 shadow-sm" data-line-id="${line.id}" title="Trazar recorrido en el mapa">
            <i class="fa-solid fa-map text-[10px]"></i>
            <span>Trazar</span>
          </button>
          <button type="button" class="view-route-btn px-2.5 py-1 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-[11px] font-semibold border border-[var(--border-color)] transition-all flex items-center gap-1" data-line-id="${line.id}" title="Ver itinerario completo de paradas">
            <i class="fa-solid fa-list-ol text-[10px]"></i>
            <span>Paradas</span>
          </button>
        </div>
      </div>
    `;

    // Clic en toda la tarjeta selecciona y enfoca la línea en el mapa
    article.addEventListener('click', (e) => {
      // Si hizo clic en "Paradas", abrimos el modal
      if (e.target.closest('.view-route-btn')) {
        openLineModal(line);
        return;
      }
      // En cualquier otro caso, trazamos en el mapa
      focusLineOnMap(line, true);
    });

    return article;
  }

  /* ==========================================================================
     7. MAPA INTERACTIVO LEAFLET Y SINCRONIZACIÓN
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

    // Renderizado de paradas clave
    BUSRIO_DATA.stops.forEach(stop => {
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white ring-2 ring-blue-500/40 cursor-pointer transition-transform hover:scale-110">
            <i class="fa-solid fa-bus text-[11px]"></i>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker(stop.coords, { icon: customIcon }).addTo(state.map);

      const popupContent = `
        <div class="p-1 font-sans text-xs">
          <span class="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full mb-1">${stop.type}</span>
          <h4 class="font-heading font-bold text-[var(--text-primary)] text-xs mt-1">${stop.name}</h4>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">${stop.address}</p>
          <div class="mt-2 pt-2 border-t border-[var(--border-color)]">
            <span class="text-[10px] font-semibold text-[var(--text-primary)] block mb-1">Líneas en esta garita:</span>
            <div class="flex flex-wrap gap-1">
              ${stop.lines.map(lineId => {
                const l = BUSRIO_DATA.lines.find(item => item.id === lineId);
                return l ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold text-white ${l.bgClass}">${l.number}</span>` : '';
              }).join('')}
            </div>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      state.stopMarkers[stop.id] = marker;

      // Al hacer clic en el marcador, sincroniza con las líneas que pasan por allí
      marker.on('click', () => {
        selectStopTab(stop.id);
      });
    });

    // Renderizado de polilíneas de las líneas
    BUSRIO_DATA.lines.forEach(line => {
      if (line.routeCoords && line.routeCoords.length > 0) {
        const polyline = L.polyline(line.routeCoords, {
          color: line.color,
          weight: 4,
          opacity: 0.75,
          dashArray: line.status === 'danger' ? '6, 6' : null
        }).addTo(state.map);

        polyline.bindTooltip(`<strong>${line.number}</strong>: ${line.name}`, { sticky: true });
        
        polyline.on('click', () => {
          focusLineOnMap(line, false);
        });

        state.routeLayers[line.id] = polyline;
      }
    });

    // Botón de Recentrado
    const resetViewBtn = document.getElementById('map-reset-btn');
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => {
        clearLineFocus();
        state.map.flyTo([BUSRIO_DATA.cityCenter.lat, BUSRIO_DATA.cityCenter.lng], BUSRIO_DATA.cityCenter.zoom, { duration: 1 });
        showToast('Mapa recentrado en Río Cuarto', 'info');
      });
    }

    // Botón de Limpiar Enfoque de Ruta
    const clearRouteBtn = document.getElementById('clear-route-focus-btn');
    if (clearRouteBtn) {
      clearRouteBtn.addEventListener('click', () => {
        clearLineFocus();
      });
    }

    window.addEventListener('resize', () => {
      if (state.map) state.map.invalidateSize();
    });
  }

  function focusLineOnMap(line, autoSwitchMobile = true) {
    if (!state.map) return;

    state.activeLineId = line.id;

    // Resaltar visualmente la tarjeta activa en la lista
    document.querySelectorAll('.line-card').forEach(card => {
      const cardId = card.getAttribute('data-line-id');
      if (cardId === line.id) {
        card.className = 'line-card group relative p-3.5 sm:p-4 rounded-xl glass-card transition-all duration-200 cursor-pointer border border-blue-500 ring-1 ring-blue-500 bg-blue-500/5';
      } else {
        card.className = 'line-card group relative p-3.5 sm:p-4 rounded-xl glass-card transition-all duration-200 cursor-pointer border border-[var(--card-border)] hover:border-blue-500/40';
      }
    });

    // Resaltar la polilínea activa y atenuar las demás
    Object.keys(state.routeLayers).forEach(id => {
      const layer = state.routeLayers[id];
      if (id === line.id) {
        layer.setStyle({ weight: 6, opacity: 1.0 });
        layer.bringToFront();
      } else {
        layer.setStyle({ weight: 3, opacity: 0.25 });
      }
    });

    // Ajustar zoom y encuadre a la línea
    if (state.routeLayers[line.id]) {
      state.map.fitBounds(state.routeLayers[line.id].getBounds(), { padding: [35, 35] });
    }

    // Actualizar banner flotante en el mapa
    const banner = document.getElementById('active-route-banner');
    const badge = document.getElementById('active-route-badge');
    const text = document.getElementById('active-route-text');

    if (banner && badge && text) {
      badge.textContent = line.number;
      badge.className = `px-2 py-0.5 rounded text-[10px] font-bold text-white shrink-0 ${line.bgClass}`;
      text.textContent = line.name;
      banner.classList.remove('hidden');
    }

    // En celular, si es necesario, cambiar automáticamente a la pestaña de mapa
    if (autoSwitchMobile && window.innerWidth < 1024) {
      switchMobileView('map');
    }

    showToast(`Mostrando recorrido de ${line.number}`, 'info');
  }

  function clearLineFocus() {
    state.activeLineId = null;

    // Restaurar estilos de tarjetas
    document.querySelectorAll('.line-card').forEach(card => {
      card.className = 'line-card group relative p-3.5 sm:p-4 rounded-xl glass-card transition-all duration-200 cursor-pointer border border-[var(--card-border)] hover:border-blue-500/40';
    });

    // Restaurar estilos de todas las polilíneas
    BUSRIO_DATA.lines.forEach(line => {
      if (state.routeLayers[line.id]) {
        state.routeLayers[line.id].setStyle({
          weight: 4,
          opacity: 0.75,
          color: line.color
        });
      }
    });

    // Ocultar banner flotante
    const banner = document.getElementById('active-route-banner');
    if (banner) banner.classList.add('hidden');
  }

  /* ==========================================================================
     8. MODAL DE DETALLES DE RECORRIDO (ITINERARIO DE PARADAS)
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
        stopItem.className = 'relative flex items-center gap-3.5 pb-3.5 last:pb-0';
        stopItem.innerHTML = `
          <div class="relative z-10 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 ${
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
        focusLineOnMap(line, true);
      };
    }

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  /* ==========================================================================
     9. ALERTAS CIUDADANAS Y FORMULARIO
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
          showToast(`Incidencia seleccionada: ${incidentText}`, 'info');
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
      <div class="flex items-start justify-between gap-2 mb-1.5">
        <div class="flex items-center gap-2 min-w-0">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor} shrink-0">
            <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
            <span>${alert.line}</span>
          </span>
          <h4 class="font-heading font-bold text-[var(--text-primary)] text-xs truncate">${alert.title}</h4>
        </div>
        <span class="text-[10px] text-[var(--text-muted)] font-medium whitespace-nowrap shrink-0">${alert.time}</span>
      </div>
      <p class="text-[11px] text-[var(--text-secondary)] mb-2 leading-relaxed">${alert.description}</p>
      <div class="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1.5 border-t border-[var(--border-color)]">
        <span class="flex items-center gap-1"><i class="fa-solid fa-location-dot text-blue-500"></i>${alert.stop}</span>
        <span class="flex items-center gap-1"><i class="fa-solid fa-circle-check text-emerald-500"></i>${alert.author}</span>
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
        showFieldError(typeSelect, 'Indica el motivo del reporte.');
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
        description: commentInput.value.trim() || `Reporte emitido desde la parada ${selectedStopObj ? selectedStopObj.name : ''}.`
      };

      // Estado 4: ✅ SUCCESS - Agregar al store y al feed
      BUSRIO_DATA.alerts.unshift(newAlert);
      const feedContainer = document.getElementById('alerts-feed-container');
      if (feedContainer) {
        feedContainer.prepend(createAlertCard(newAlert));
      }

      form.reset();
      showToast('¡Alerta comunitaria publicada con éxito!', 'success');
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
     10. TOAST NOTIFICACIONES (RESPONSIVE CELULAR & ESCRITORIO)
     ========================================================================== */
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-auto sm:right-6 z-[2000] flex flex-col gap-2 pointer-events-none items-center sm:items-end';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-950/30' :
                    type === 'error' ? 'bg-rose-600 text-white shadow-rose-950/30' :
                    'bg-blue-600 text-white shadow-blue-950/30';
    const icon = type === 'success' ? 'fa-solid fa-circle-check' :
                 type === 'error' ? 'fa-solid fa-circle-exclamation' :
                 'fa-solid fa-circle-info';

    toast.className = `pointer-events-auto w-full sm:w-auto max-w-sm flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-2xl font-sans text-xs font-semibold tracking-wide transition-all duration-300 translate-y-3 opacity-0 border border-white/10 backdrop-blur-md ${bgClass}`;
    toast.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0">
        <i class="${icon} text-sm shrink-0"></i>
        <span class="leading-snug break-words truncate">${message}</span>
      </div>
      <button type="button" class="toast-close-btn opacity-75 hover:opacity-100 text-xs shrink-0 p-1" aria-label="Cerrar notificación">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        toast.classList.add('translate-y-3', 'opacity-0');
        setTimeout(() => toast.remove(), 250);
      };
    }

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
    });

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('translate-y-3', 'opacity-0');
        setTimeout(() => toast.remove(), 250);
      }
    }, 3200);
  }

  /* ==========================================================================
     11. SIMULACIÓN DE CUENTA REGRESIVA DE LLEGADA (ETA TICKER)
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
