/**
 * BusRío - Application Logic
 * Lógica modular interactiva: filtros, renderizado reactivo, mapa Leaflet,
 * formulario de alertas ciudadanas y alternancia de Modo Claro/Oscuro.
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
        localStorage.setItem('busrio_theme', 'dark');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-amber-400';
        if (themeText) themeText.textContent = 'Modo Claro';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('busrio_theme', 'light');
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-slate-600';
        if (themeText) themeText.textContent = 'Modo Oscuro';
      }
    }

    const savedTheme = localStorage.getItem('busrio_theme');
    // Si no hay preferencia guardada, por defecto se usa Dark Mode (ADR-004)
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
     3. TABS Y FILTROS POR GARITA
     ========================================================================== */
  function initStopFilterTabs() {
    const tabsContainer = document.getElementById('stop-tabs-container');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    // Botón "Todas las Paradas"
    const allBtn = createTabButton('all', 'Todas las Paradas', 'fa-solid fa-bus', true);
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
    btn.className = `stop-tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap min-h-[44px] ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
    }`;
    btn.innerHTML = `<i class="${iconClass}"></i><span>${label}</span>`;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.stop-tab-btn').forEach(b => {
        b.className = 'stop-tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap min-h-[44px] bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';
      });
      btn.className = 'stop-tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap min-h-[44px] bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]';

      state.selectedStop = id;
      triggerCardRenderWithLoading();

      // Si se selecciona una parada específica, centrar en el mapa
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

      // Scroll suave hacia la sección del monitor
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
     5. RENDERIZADO DE TARJETAS Y 4 ESTADOS DE UI (DoD)
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

    // Breve transición asíncrona simulada de 200ms para feedback visual
    setTimeout(() => {
      skeletonContainer.classList.add('hidden');
      renderCards();
    }, 220);
  }

  function initCardGrid() {
    triggerCardRenderWithLoading();
  }

  function renderCards() {
    const gridContainer = document.getElementById('lines-grid');
    const emptyContainer = document.getElementById('lines-empty');
    if (!gridContainer || !emptyContainer) return;

    // Filtrado de líneas
    const filteredLines = BUSRIO_DATA.lines.filter(line => {
      // Filtro por Parada
      const matchesStop = (state.selectedStop === 'all') ||
        (BUSRIO_DATA.stops.find(s => s.id === state.selectedStop)?.lines.includes(line.id));

      // Filtro por Búsqueda
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
    article.className = 'group relative bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between';

    // Estado visual del tráfico
    let statusBadgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    let statusIcon = 'fa-solid fa-circle-check';
    let pulseClass = line.etaMinutes <= 5 ? 'animate-pulse' : '';

    if (line.status === 'warning') {
      statusBadgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      statusIcon = 'fa-solid fa-triangle-exclamation';
    } else if (line.status === 'danger') {
      statusBadgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      statusIcon = 'fa-solid fa-road-barrier';
    }

    article.innerHTML = `
      <div>
        <!-- Cabecera de la Tarjeta -->
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-2.5">
            <span class="inline-flex items-center justify-center px-3 py-1 rounded-xl font-heading font-bold text-base text-white shadow-sm ${line.bgClass}">
              ${line.number}
            </span>
            <div>
              <h3 class="font-heading font-semibold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                ${line.name}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <i class="fa-solid fa-clock text-[10px]"></i> ${line.frequency}
              </p>
            </div>
          </div>

          <!-- Tiempo estimado de llegada (ETA) -->
          <div class="text-right flex flex-col items-end">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${pulseClass} bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50">
              <i class="fa-solid fa-bolt text-[10px]"></i>
              <span>${line.etaMinutes} min</span>
            </span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Tiempo estimado</span>
          </div>
        </div>

        <!-- Garita y Destino -->
        <div class="space-y-2 py-3 border-y border-slate-100 dark:border-slate-700/50 my-3">
          <div class="flex items-start gap-2 text-xs">
            <i class="fa-solid fa-location-dot text-rose-500 mt-0.5"></i>
            <div>
              <span class="text-slate-400 dark:text-slate-400 text-[11px] block">Parada consultada:</span>
              <strong class="text-slate-800 dark:text-slate-200 font-medium">${line.stopName}</strong>
            </div>
          </div>
          <div class="flex items-start gap-2 text-xs">
            <i class="fa-solid fa-arrow-right-long text-blue-500 mt-0.5"></i>
            <div>
              <span class="text-slate-400 dark:text-slate-400 text-[11px] block">Destino final:</span>
              <span class="text-slate-700 dark:text-slate-300">${line.direction}</span>
            </div>
          </div>
        </div>

        <!-- Badges de Estado y Accesibilidad -->
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${statusBadgeColor}">
            <i class="${statusIcon} text-[10px]"></i>
            <span>${line.statusLabel}</span>
          </span>

          ${line.accessible ? `
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title="Unidad con rampa accesible">
              <i class="fa-solid fa-wheelchair text-[11px]"></i>
              <span>Rampa</span>
            </span>
          ` : `
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700" title="Sin rampa">
              <span>Piso Convencional</span>
            </span>
          `}
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="flex items-center gap-2 pt-2">
        <button type="button" class="view-route-btn flex-1 min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-700/60 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2" data-line-id="${line.id}">
          <i class="fa-solid fa-route"></i>
          <span>Ver Recorrido</span>
        </button>

        <button type="button" class="locate-map-btn min-h-[44px] px-3.5 py-2 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold transition-all flex items-center justify-center" title="Localizar en Mapa" data-line-id="${line.id}">
          <i class="fa-solid fa-map-location-dot"></i>
          <span class="sr-only">Localizar en mapa</span>
        </button>
      </div>
    `;

    // Event listeners de la tarjeta
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

    // Centrado en la Ciudad de Río Cuarto
    state.map = L.map('leaflet-map', {
      center: [BUSRIO_DATA.cityCenter.lat, BUSRIO_DATA.cityCenter.lng],
      zoom: BUSRIO_DATA.cityCenter.zoom,
      zoomControl: true,
      scrollWheelZoom: false // Evita atrapar el scroll de la página en móvil
    });

    // Azulejos de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | BusRío'
    }).addTo(state.map);

    // Render de paradas como marcadores personalizados
    BUSRIO_DATA.stops.forEach(stop => {
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white ring-2 ring-blue-500/50 cursor-pointer transition-transform hover:scale-110">
            <i class="fa-solid fa-bus text-xs"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(stop.coords, { icon: customIcon }).addTo(state.map);

      // Popup informativo con estilo limpio
      const popupContent = `
        <div class="p-2 font-sans">
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">${stop.type}</span>
          <h4 class="font-heading font-bold text-slate-900 text-sm mt-0.5">${stop.name}</h4>
          <p class="text-xs text-slate-500 mt-1">${stop.address}</p>
          <div class="mt-2 pt-2 border-t border-slate-200">
            <span class="text-[11px] font-semibold text-slate-700">Líneas disponibles:</span>
            <div class="flex flex-wrap gap-1 mt-1">
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
    });

    // Trazado de recorridos de las líneas en capas polilíneas
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

    // Botón de recentrado en Río Cuarto
    const resetViewBtn = document.getElementById('map-reset-btn');
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => {
        state.map.flyTo([BUSRIO_DATA.cityCenter.lat, BUSRIO_DATA.cityCenter.lng], BUSRIO_DATA.cityCenter.zoom, { duration: 1 });
      });
    }

    // Invalidar dimensiones ante redimensionamiento de ventana (Gotcha 5)
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
     7. MODAL DE DETALLES DE RECORRIDO
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

    // Cierre accesible con tecla Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  function openLineModal(line) {
    const modal = document.getElementById('route-modal');
    if (!modal) return;

    // Llenado de contenido dinámico
    document.getElementById('modal-line-number').textContent = line.number;
    document.getElementById('modal-line-number').className = `px-3 py-1 rounded-xl text-white font-heading font-bold text-base ${line.bgClass}`;
    document.getElementById('modal-line-title').textContent = line.name;
    document.getElementById('modal-line-direction').textContent = line.direction;
    document.getElementById('modal-line-desc').textContent = line.description;
    document.getElementById('modal-line-freq').textContent = line.frequency;
    document.getElementById('modal-line-status').textContent = line.statusLabel;

    // Timeline de paradas
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
            isFirst ? 'bg-emerald-500 text-white' : isLast ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }">
            ${idx + 1}
          </div>
          <span class="text-sm font-medium ${isFirst || isLast ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}">
            ${stopName} ${isFirst ? '<span class="text-xs text-emerald-600 dark:text-emerald-400 font-normal">(Cabecera)</span>' : ''} ${isLast ? '<span class="text-xs text-rose-600 dark:text-rose-400 font-normal">(Destino)</span>' : ''}
          </span>
        `;
        stopsListContainer.appendChild(stopItem);
      });
    }

    // Botón para ver en mapa desde el modal
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
     8. ALERTA CIUDADANA Y FORMULARIO (DoD: ERROR & SUCCESS STATES)
     ========================================================================== */
  function initAlertsFeed() {
    const feedContainer = document.getElementById('alerts-feed-container');
    if (!feedContainer) return;

    feedContainer.innerHTML = '';
    BUSRIO_DATA.alerts.forEach(alert => {
      feedContainer.appendChild(createAlertCard(alert));
    });

    // Botones de reporte en 1-clic
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
    const badgeColor = alert.type === 'danger' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                       alert.type === 'warning' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                       'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    const iconClass = alert.type === 'danger' ? 'fa-solid fa-triangle-exclamation' :
                      alert.type === 'warning' ? 'fa-solid fa-users' : 'fa-solid fa-circle-check';

    item.className = 'p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all hover:border-blue-400';
    item.innerHTML = `
      <div class="flex items-start justify-between gap-3 mb-2">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}">
            <i class="${iconClass} text-[10px]"></i>
            <span>${alert.line}</span>
          </span>
          <h4 class="font-heading font-bold text-slate-800 dark:text-slate-100 text-sm">${alert.title}</h4>
        </div>
        <span class="text-[11px] text-slate-400 whitespace-nowrap">${alert.time}</span>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">${alert.description}</p>
      <div class="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
        <span><i class="fa-solid fa-location-dot text-blue-500 mr-1"></i>${alert.stop}</span>
        <span><i class="fa-solid fa-user-shield text-emerald-500 mr-1"></i>${alert.author}</span>
      </div>
    `;
    return item;
  }

  function initAlertForm() {
    const form = document.getElementById('report-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      // Estado 3: Prevención de recarga (Gotcha 3 de errores-conocidos.md)
      e.preventDefault();

      const lineSelect = document.getElementById('report-line');
      const stopSelect = document.getElementById('report-stop');
      const typeSelect = document.getElementById('report-type');
      const commentInput = document.getElementById('report-comment');
      const nameInput = document.getElementById('report-name');

      // Limpieza previa de errores
      clearFormErrors();

      // Validación estricta
      let hasError = false;

      if (!lineSelect.value) {
        showFieldError(lineSelect, 'Por favor selecciona la línea de colectivo.');
        hasError = true;
      }

      if (!stopSelect.value) {
        showFieldError(stopSelect, 'Por favor selecciona la parada o nodo de incidencia.');
        hasError = true;
      }

      if (!typeSelect.value) {
        showFieldError(typeSelect, 'Por favor indica el tipo de incidencia.');
        hasError = true;
      }

      // Estado de ERROR
      if (hasError) {
        showToast('Por favor completa todos los campos requeridos marcados en rojo.', 'error');
        return;
      }

      // Estado de ÉXITO
      const selectedLineObj = BUSRIO_DATA.lines.find(l => l.id === lineSelect.value);
      const selectedStopObj = BUSRIO_DATA.stops.find(s => s.id === stopSelect.value);

      const newAlert = {
        id: `alt-${Date.now()}`,
        type: typeSelect.value.includes('Desvío') || typeSelect.value.includes('Corte') ? 'danger' : 'warning',
        title: typeSelect.value,
        line: selectedLineObj ? selectedLineObj.number : 'Línea Urbana',
        stop: selectedStopObj ? selectedStopObj.name : stopSelect.value,
        author: nameInput.value.trim() ? `${nameInput.value.trim()} (Pasajero)` : 'Pasajero Anónimo',
        time: 'Recién ahora',
        description: commentInput.value.trim() || `Reporte de ${typeSelect.value} en garita de Río Cuarto emitido desde la PWA.`
      };

      // Guardar en mock store e insertar al inicio del feed
      BUSRIO_DATA.alerts.unshift(newAlert);
      const feedContainer = document.getElementById('alerts-feed-container');
      if (feedContainer) {
        feedContainer.prepend(createAlertCard(newAlert));
      }

      // Limpiar formulario y dar feedback
      form.reset();
      showToast('¡Alerta comunitaria publicada con éxito! Gracias por colaborar con los usuarios de Río Cuarto.', 'success');
    });
  }

  function showFieldError(field, message) {
    field.classList.add('border-rose-500', 'focus:ring-rose-500');
    field.classList.remove('border-slate-300', 'dark:border-slate-600');
    const parent = field.parentElement;
    const errorMsg = document.createElement('p');
    errorMsg.className = 'field-error-text text-rose-500 text-xs mt-1 font-medium';
    errorMsg.textContent = message;
    parent.appendChild(errorMsg);
  }

  function clearFormErrors() {
    document.querySelectorAll('.field-error-text').forEach(el => el.remove());
    document.querySelectorAll('#report-form select, #report-form input').forEach(field => {
      field.classList.remove('border-rose-500', 'focus:ring-rose-500');
      field.classList.add('border-slate-300', 'dark:border-slate-600');
    });
  }

  /* ==========================================================================
     9. TOAST DE NOTIFICACIÓN FLOTANTE INTERACTIVO
     ========================================================================== */
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-5 right-5 z-[2000] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-600/30' :
                    type === 'error' ? 'bg-rose-600 text-white shadow-rose-600/30' :
                    'bg-slate-900 text-white dark:bg-blue-600 shadow-blue-600/30';
    const icon = type === 'success' ? 'fa-solid fa-circle-check' :
                 type === 'error' ? 'fa-solid fa-circle-xmark' :
                 'fa-solid fa-circle-info';

    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg font-sans text-sm font-medium transition-all duration-300 translate-y-4 opacity-0 ${bgClass}`;
    toast.innerHTML = `
      <i class="${icon} text-base"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    // Auto-destrucción a los 3.5 segundos
    setTimeout(() => {
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /* ==========================================================================
     10. SIMULACIÓN DE CUENTA REGRESIVA DE LLEGADA (ETA TICKER)
     ========================================================================== */
  function initLiveCountdown() {
    // Cada 40 segundos, decrementa levemente o refresca los minutos de arribo para sensación de tiempo real
    setInterval(() => {
      BUSRIO_DATA.lines.forEach(line => {
        if (line.etaMinutes > 1) {
          line.etaMinutes -= 1;
        } else {
          // Se resetea simulando la siguiente unidad
          line.etaMinutes = Math.floor(Math.random() * 8) + 6;
        }
      });
      // Si el usuario no está filtrando activamente, actualizar tarjetas silenciosamente
      if (!state.searchQuery && state.selectedStop === 'all') {
        renderCards();
      }
    }, 40000);
  }
});
