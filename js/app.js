/**
 * BusRío - Sistema de Tránsito Urbano en Tiempo Real (Río Cuarto)
 * Lógica modular interactiva bajo sistema de diseño utilitario y brutalista:
 * - Centro de Control unificado con mapa Leaflet y panel de ramales.
 * - Cero saltos de layout (CLS = 0) con persistencia de dimensiones.
 * - Soporte bimodal (Modo Oscuro por defecto / Modo Claro) con variables CSS.
 * - Notificaciones y controles optimizados para celulares y escritorios.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado central de la aplicación
  const state = {
    selectedStop: 'all',
    searchQuery: '',
    map: null,
    routeLayers: {},
    stopMarkers: {},
    activeLineId: null
  };

  // Inicialización de componentes
  sanitizeContentEditable();
  initSmoothAnchorNavigation();
  initTheme();
  initMobileMenu();
  initMobileViewSwitcher();
  initStopFilterTabs();
  initSearch();
  initHeroPlanner();
  initCardGrid();
  initAlertsFeed();
  initAlertForm();
  initModal();
  initLeafletMap();
  initLiveCountdown();

  /* ==========================================================================
     UTILIDADES DE NAVEGACIÓN Y ERGONOMÍA (OFFSET NAVBAR STICKY & SANITIZACIÓN)
     ========================================================================== */
  function smoothScrollTo(target, offsetExtra = 24) {
    const element = typeof target === 'string' ? document.getElementById(target) : target;
    if (!element) return;

    const navbar = document.getElementById('navbar');
    const navHeight = navbar ? navbar.offsetHeight : 64;
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const targetPosition = Math.max(0, elementTop - navHeight - offsetExtra);

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  function sanitizeContentEditable() {
    document.querySelectorAll('[contenteditable]').forEach(el => {
      if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
        el.removeAttribute('contenteditable');
      }
    });
  }

  function initSmoothAnchorNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const targetId = href.slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          smoothScrollTo(targetElement);
          if (history.pushState) {
            history.pushState(null, '', `#${targetId}`);
          }
        }
      });
    });
  }

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
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-amber-400 text-xs';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('busrio_theme', 'light');
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-slate-700 text-xs';
      }
    }

    const savedTheme = localStorage.getItem('busrio_theme');
    // Por defecto inicia en Modo Oscuro utilitario
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    applyTheme(isDark);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentlyDark = document.documentElement.classList.contains('dark');
        applyTheme(!currentlyDark);
        showToast(
          !currentlyDark ? 'Modo Oscuro activado' : 'Modo Claro activado',
          'info'
        );
      });
    }
  }

  /* ==========================================================================
     2. MENÚ MÓVIL
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
     3. ALTERNADOR DE VISTA EN CELULARES (LISTA <-> MAPA)
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

      btnList.className = 'flex-1 py-2 rounded text-xs font-bold font-mono transition-all bg-[var(--accent-transit)] text-slate-950 flex items-center justify-center gap-1.5';
      btnMap.className = 'flex-1 py-2 rounded text-xs font-bold font-mono transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1.5';
    } else {
      listCol.classList.add('hidden');
      listCol.classList.remove('block');
      mapCol.classList.remove('hidden');
      mapCol.classList.add('block');

      btnMap.className = 'flex-1 py-2 rounded text-xs font-bold font-mono transition-all bg-[var(--accent-transit)] text-slate-950 flex items-center justify-center gap-1.5';
      btnList.className = 'flex-1 py-2 rounded text-xs font-bold font-mono transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1.5';

      if (state.map) {
        state.map.invalidateSize();
        setTimeout(() => state.map.invalidateSize(), 80);
      }
    }
  }

  /* ==========================================================================
     4. FILTROS POR GARITA (PÍLDORAS UTILITARIAS)
     ========================================================================== */
  function initStopFilterTabs() {
    const tabsContainer = document.getElementById('stop-tabs-container');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    // Botón "Todas las Garitas"
    const allBtn = createTabButton('all', 'Todas las Garitas', 'fa-solid fa-layer-group', true);
    tabsContainer.appendChild(allBtn);

    // Botones por cada garita
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
    btn.className = `stop-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs transition-all whitespace-nowrap min-h-[34px] ${
      isActive
        ? 'bg-[var(--accent-transit)] text-slate-950 font-bold border border-[var(--accent-transit)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] font-medium'
    }`;
    btn.innerHTML = `<i class="${iconClass} text-[11px]"></i><span>${label}</span>`;

    btn.addEventListener('click', () => {
      selectStopTab(id);
    });

    return btn;
  }

  function selectStopTab(id) {
    document.querySelectorAll('.stop-tab-btn').forEach(b => {
      b.className = 'stop-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs transition-all whitespace-nowrap min-h-[34px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] font-medium';
    });
    const targetBtn = document.querySelector(`.stop-tab-btn[data-stop-id="${id}"]`);
    if (targetBtn) {
      targetBtn.className = 'stop-tab-btn flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs transition-all whitespace-nowrap min-h-[34px] bg-[var(--accent-transit)] text-slate-950 font-bold border border-[var(--accent-transit)]';
    }

    state.selectedStop = id;
    triggerCardRenderWithLoading();

    // Centrado en el mapa al seleccionar garita
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
     5. PLANIFICADOR RÁPIDO DEL HERO Y BÚSQUEDA
     ========================================================================== */
  function initHeroPlanner() {
    const heroSearchBtn = document.getElementById('hero-search-btn');
    const heroLineSelect = document.getElementById('hero-line-select');
    const heroStopSelect = document.getElementById('hero-stop-select');

    if (!heroSearchBtn) return;

    heroSearchBtn.addEventListener('click', () => {
      const lineVal = heroLineSelect ? heroLineSelect.value : '';
      const stopVal = heroStopSelect ? heroStopSelect.value : 'all';

      // Aplicar filtro de garita
      selectStopTab(stopVal || 'all');

      // Si seleccionó una línea específica
      if (lineVal) {
        const lineObj = BUSRIO_DATA.lines.find(l => l.id === lineVal);
        if (lineObj) {
          state.searchQuery = lineObj.number.toLowerCase();
          const monitorSearchInput = document.getElementById('monitor-search-input');
          if (monitorSearchInput) monitorSearchInput.value = lineObj.number;
          
          triggerCardRenderWithLoading();
          setTimeout(() => {
            focusLineOnMap(lineObj, false);
          }, 300);
        }
      } else {
        state.searchQuery = '';
        const monitorSearchInput = document.getElementById('monitor-search-input');
        if (monitorSearchInput) monitorSearchInput.value = '';
        triggerCardRenderWithLoading();
      }

      // Desplazar suavemente hacia el Centro de Control respetando el navbar sticky
      smoothScrollTo('monitor');
      showToast('Filtro de tránsito aplicado al Centro de Control', 'info');
    });
  }

  function initSearch() {
    const monitorSearchInput = document.getElementById('monitor-search-input');

    if (monitorSearchInput) {
      monitorSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        triggerCardRenderWithLoading();
      });
    }
  }

  /* ==========================================================================
     6. RENDERIZADO DE TARJETAS (ESTABILIDAD TOTAL DE TAMAÑO - CLS = 0)
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

    // Transición ágil de 100ms
    setTimeout(() => {
      skeletonContainer.classList.add('hidden');
      renderCards();
    }, 100);
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

    // Estado 2: 📭 EMPTY (Centrado dentro del scroll de altura fija)
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

    article.className = `line-card transit-card p-3 sm:p-3.5 transition-all cursor-pointer ${
      isActive
        ? 'border-[var(--accent-transit)] ring-1 ring-[var(--accent-transit)] bg-[var(--accent-transit)]/5'
        : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
    }`;
    article.setAttribute('data-line-id', line.id);

    // Estados utilitarios
    let statusBadgeColor = 'border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)]';
    let statusText = 'Normal';
    let pulseClass = line.etaMinutes <= 5 ? 'animate-pulse' : '';

    if (line.status === 'warning') {
      statusBadgeColor = 'border border-amber-500/40 bg-amber-500/10 text-amber-400';
      statusText = 'Demora';
    } else if (line.status === 'danger') {
      statusBadgeColor = 'border border-[var(--alert-soft-border)] bg-[var(--alert-soft-bg)] text-[var(--alert-soft)]';
      statusText = 'Desvío';
    }

    article.innerHTML = `
      <!-- Fila 1: Línea Badge + Nombre + ETA Monospace -->
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="inline-flex items-center justify-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] shrink-0">
            ${line.number.toUpperCase()}
          </span>
          <div class="min-w-0">
            <h4 class="font-heading font-bold text-xs sm:text-sm text-[var(--text-primary)] leading-tight truncate">
              ${line.name}
            </h4>
            <span class="text-[10px] font-mono text-[var(--text-muted)]">Cada ${line.frequency.replace('Cada ', '')}</span>
          </div>
        </div>

        <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] font-bold ${pulseClass} bg-[var(--bg-main)] text-[var(--accent-transit)] border border-[var(--border-color)] shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent-transit)]"></span>
          <span>${line.etaMinutes} MIN</span>
        </div>
      </div>

      <!-- Fila 2: Garita próxima -->
      <div class="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] mb-2.5 bg-[var(--bg-main)] px-2.5 py-1.5 rounded border border-[var(--border-color)]">
        <i class="fa-solid fa-location-dot text-[var(--accent-transit)] text-[10px] shrink-0"></i>
        <span class="truncate font-sans">Garita: <strong class="text-[var(--text-primary)] font-medium">${line.stopName}</strong></span>
      </div>

      <!-- Fila 3: Estado y Botones de Acción -->
      <div class="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-color)] font-mono text-[11px]">
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${statusBadgeColor}">
            ${statusText}
          </span>
          ${line.accessible ? `
            <span class="text-[var(--accent-transit)] text-xs" title="Unidad con rampa accesible">
              <i class="fa-solid fa-wheelchair"></i>
            </span>
          ` : ''}
        </div>

        <div class="flex items-center gap-1.5">
          <button type="button" class="locate-line-btn px-2.5 py-1 rounded bg-[var(--accent-transit)] text-slate-950 font-bold transition-all hover:bg-[var(--accent-transit-hover)] flex items-center gap-1" data-line-id="${line.id}">
            <i class="fa-solid fa-map text-[10px]"></i>
            <span>Trazar</span>
          </button>
          <button type="button" class="view-route-btn px-2 py-1 rounded bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] transition-all hover:border-[var(--border-hover)] flex items-center gap-1" data-line-id="${line.id}">
            <i class="fa-solid fa-list-ol text-[10px]"></i>
            <span>Paradas</span>
          </button>
        </div>
      </div>
    `;

    // Clic en toda la tarjeta selecciona la línea en el mapa
    article.addEventListener('click', (e) => {
      if (e.target.closest('.view-route-btn')) {
        openLineModal(line);
        return;
      }
      focusLineOnMap(line, true);
    });

    return article;
  }

  /* ==========================================================================
     7. MAPA LEAFLET RÍGIDO Y SINCRONIZACIÓN (SEGÚN GUÍA OFICIAL)
     ========================================================================== */
  function initLeafletMap() {
    const mapContainer = document.getElementById('map') || document.getElementById('leaflet-map');
    if (!mapContainer) return;

    // Estado ❌ ERROR: Feedback accesible si falla la carga del CDN de Leaflet
    if (typeof L === 'undefined') {
      mapContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-6 text-center bg-[var(--bg-card)] rounded-[10px] text-[var(--text-secondary)]">
          <i class="fa-solid fa-triangle-exclamation text-amber-500 text-3xl mb-3"></i>
          <h4 class="font-bold text-sm text-[var(--text-primary)] mb-1">Error al inicializar Leaflet.js</h4>
          <p class="text-xs max-w-sm mb-4">No se pudo cargar la librería cartográfica desde el CDN. Verifica tu conexión a internet o los bloqueadores de scripts.</p>
          <button onclick="window.location.reload()" class="px-4 py-2 btn-transit text-xs font-mono font-bold flex items-center gap-2">
            <i class="fa-solid fa-rotate-right"></i>
            <span>Reintentar Conexión</span>
          </button>
        </div>
      `;
      return;
    }

    // Inicialización de Leaflet sobre Río Cuarto
    state.map = L.map(mapContainer.id, {
      center: [BUSRIO_DATA.cityCenter.lat, BUSRIO_DATA.cityCenter.lng],
      zoom: BUSRIO_DATA.cityCenter.zoom,
      zoomControl: true,
      scrollWheelZoom: false
    });

    // Capa de tiles OpenStreetMap canónica
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | BusRío'
    }).addTo(state.map);

    // Herramienta de Captura / Inspección de Coordenadas por Clic (Punto 6 de la Guía)
    state.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log(`Coordenadas: lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)}`);
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`
          <div class="p-1 font-mono text-xs text-[var(--text-primary)]">
            <span class="font-bold text-[var(--accent-transit)] block uppercase text-[10px] mb-1">📍 Punto en Río Cuarto</span>
            <div class="space-y-0.5 text-[11px]">
              <div><strong class="text-[var(--text-secondary)]">Lat:</strong> ${lat.toFixed(4)}</div>
              <div><strong class="text-[var(--text-secondary)]">Lng:</strong> ${lng.toFixed(4)}</div>
            </div>
          </div>
        `)
        .openOn(state.map);
    });

    // Renderizado dinámico de paradas clave (Array + forEach + Template Literals según Guía)
    BUSRIO_DATA.stops.forEach(stop => {
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center w-6 h-6 rounded-md bg-[var(--accent-transit)] text-slate-950 shadow border border-black/30 cursor-pointer transition-transform hover:scale-110 font-bold">
            <i class="fa-solid fa-bus text-[10px]"></i>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(stop.coords, { icon: customIcon }).addTo(state.map);

      const popupContent = `
        <div class="p-1 font-sans text-xs">
          <span class="inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent-transit)] mb-0.5">${stop.type}</span>
          <h4 class="font-heading font-bold text-[var(--text-primary)] text-xs">${stop.name}</h4>
          <p class="text-[11px] text-[var(--text-secondary)] mt-0.5 font-sans">${stop.address}</p>
          <div class="mt-2 pt-1.5 border-t border-[var(--border-color)]">
            <span class="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase">Ramales en Garita:</span>
            <div class="flex flex-wrap gap-1">
              ${stop.lines.map(lineId => {
                const l = BUSRIO_DATA.lines.find(item => item.id === lineId);
                return l ? `<span class="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[var(--border-color)] text-[var(--text-primary)]">${l.number}</span>` : '';
              }).join('')}
            </div>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      state.stopMarkers[stop.id] = marker;

      marker.on('click', () => {
        selectStopTab(stop.id);
      });
    });

    // Renderizado de polilíneas de ramales
    BUSRIO_DATA.lines.forEach(line => {
      if (line.routeCoords && line.routeCoords.length > 0) {
        const polyline = L.polyline(line.routeCoords, {
          color: line.color,
          weight: 4,
          opacity: 0.8,
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
        state.map.flyTo([BUSRIO_DATA.cityCenter.lat, BUSRIO_DATA.cityCenter.lng], BUSRIO_DATA.cityCenter.zoom, { duration: 0.8 });
        showToast('Mapa recentrado en Río Cuarto', 'info');
      });
    }

    // Botón Limpiar Ruta
    const clearRouteBtn = document.getElementById('clear-route-focus-btn');
    if (clearRouteBtn) {
      clearRouteBtn.addEventListener('click', () => {
        clearLineFocus();
      });
    }

    // Sincronización continua de tamaño con ResizeObserver y eventos de ventana
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        if (state.map) {
          state.map.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainer);
    }

    window.addEventListener('resize', () => {
      if (state.map) state.map.invalidateSize();
    });

    window.addEventListener('load', () => {
      if (state.map) state.map.invalidateSize();
    });

    setTimeout(() => {
      if (state.map) state.map.invalidateSize();
    }, 250);
  }

  function focusLineOnMap(line, autoSwitchMobile = true) {
    if (!state.map) return;

    state.activeLineId = line.id;

    // Resaltar tarjeta seleccionada
    document.querySelectorAll('.line-card').forEach(card => {
      const cardId = card.getAttribute('data-line-id');
      if (cardId === line.id) {
        card.className = 'line-card transit-card p-3 sm:p-3.5 transition-all cursor-pointer border-[var(--accent-transit)] ring-1 ring-[var(--accent-transit)] bg-[var(--accent-transit)]/5';
      } else {
        card.className = 'line-card transit-card p-3 sm:p-3.5 transition-all cursor-pointer border-[var(--border-color)] hover:border-[var(--border-hover)]';
      }
    });

    // Resaltar la polilínea activa
    Object.keys(state.routeLayers).forEach(id => {
      const layer = state.routeLayers[id];
      if (id === line.id) {
        layer.setStyle({ weight: 6, opacity: 1.0 });
        layer.bringToFront();
      } else {
        layer.setStyle({ weight: 2.5, opacity: 0.2 });
      }
    });

    // Encuadrar el mapa a la traza con actualización de dimensiones
    if (state.routeLayers[line.id]) {
      state.map.invalidateSize();
      state.map.fitBounds(state.routeLayers[line.id].getBounds(), { padding: [40, 40] });
    }

    // Actualizar banner flotante en el mapa
    const banner = document.getElementById('active-route-banner');
    const badge = document.getElementById('active-route-badge');
    const text = document.getElementById('active-route-text');

    if (banner && badge && text) {
      badge.textContent = line.number;
      text.textContent = line.name;
      banner.classList.remove('hidden');
    }

    // En celular, si aplica, cambiar al mapa
    if (autoSwitchMobile && window.innerWidth < 1024) {
      switchMobileView('map');
    }

    showToast(`Trazando recorrido: ${line.number}`, 'info');
  }

  function clearLineFocus() {
    state.activeLineId = null;

    document.querySelectorAll('.line-card').forEach(card => {
      card.className = 'line-card transit-card p-3 sm:p-3.5 transition-all cursor-pointer border-[var(--border-color)] hover:border-[var(--border-hover)]';
    });

    BUSRIO_DATA.lines.forEach(line => {
      if (state.routeLayers[line.id]) {
        state.routeLayers[line.id].setStyle({
          weight: 4,
          opacity: 0.8,
          color: line.color
        });
      }
    });

    const banner = document.getElementById('active-route-banner');
    if (banner) banner.classList.add('hidden');
  }

  /* ==========================================================================
     8. MODAL DE ITINERARIO DE GARITAS
     ========================================================================== */
  function initModal() {
    const modal = document.getElementById('route-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const backdrop = document.getElementById('modal-backdrop');

    function closeModal() {
      if (!modal) return;
      modal.classList.add('hidden');
      modal.setAttribute('hidden', '');
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
        stopItem.className = 'relative flex items-center gap-3 pb-3 last:pb-0 font-mono text-xs';
        stopItem.innerHTML = `
          <div class="relative z-10 flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold shrink-0 ${
            isFirst ? 'bg-[var(--accent-transit)] text-slate-950' : isLast ? 'bg-[var(--border-color)] text-[var(--text-primary)]' : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)]'
          }">
            ${idx + 1}
          </div>
          <span class="${isFirst || isLast ? 'font-bold text-[var(--text-primary)] font-sans' : 'text-[var(--text-secondary)] font-sans'}">
            ${stopName} ${isFirst ? '<span class="text-[10px] font-mono text-[var(--accent-transit)] uppercase font-bold">(Cabecera)</span>' : ''} ${isLast ? '<span class="text-[10px] font-mono text-[var(--text-muted)] uppercase">(Destino)</span>' : ''}
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
        smoothScrollTo('monitor');
        setTimeout(() => {
          focusLineOnMap(line, true);
        }, 150);
      };
    }

    modal.removeAttribute('hidden');
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  /* ==========================================================================
     9. ALERTAS CIUDADANAS
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
          const reportTarget = document.getElementById('report-form-card') || document.getElementById('report-form');
          smoothScrollTo(reportTarget);
          showToast(`Incidencia seleccionada: ${incidentText}`, 'info');
        }
      });
    });
  }

  function createAlertCard(alert) {
    const item = document.createElement('div');
    const isCritical = alert.type === 'danger' || alert.title.includes('Desvío') || alert.title.includes('Corte');
    
    const cardBorderClass = isCritical 
      ? 'border border-[var(--alert-soft-border)] bg-[var(--alert-soft-bg)]' 
      : 'border border-[var(--border-color)] bg-[var(--bg-main)]';

    const tagClass = isCritical
      ? 'bg-[var(--alert-soft)] text-white'
      : 'bg-[var(--border-color)] text-[var(--text-primary)]';

    item.className = `p-3 rounded-lg ${cardBorderClass} transition-all text-xs font-sans`;
    item.innerHTML = `
      <div class="flex items-start justify-between gap-2 mb-1">
        <div class="flex items-center gap-2 min-w-0">
          <span class="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${tagClass}">
            ${alert.line}
          </span>
          <h4 class="font-heading font-bold text-xs truncate text-[var(--text-primary)]">${alert.title}</h4>
        </div>
        <span class="font-mono text-[10px] text-[var(--text-muted)] shrink-0">${alert.time}</span>
      </div>
      <p class="text-[11px] text-[var(--text-secondary)] mb-2 leading-relaxed font-sans">${alert.description}</p>
      <div class="flex items-center justify-between font-mono text-[10px] text-[var(--text-muted)] pt-1.5 border-t border-[var(--border-color)]">
        <span class="flex items-center gap-1"><i class="fa-solid fa-location-dot text-[var(--accent-transit)]"></i>${alert.stop}</span>
        <span class="flex items-center gap-1">${alert.author}</span>
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
        showFieldError(lineSelect, 'Selecciona la línea.');
        hasError = true;
      }

      if (!stopSelect.value) {
        showFieldError(stopSelect, 'Selecciona la garita.');
        hasError = true;
      }

      if (!typeSelect.value) {
        showFieldError(typeSelect, 'Indica el motivo.');
        hasError = true;
      }

      if (hasError) {
        showToast('Completa los campos requeridos', 'error');
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
        description: commentInput.value.trim() || `Reporte emitido desde ${selectedStopObj ? selectedStopObj.name : 'garita'}.`
      };

      BUSRIO_DATA.alerts.unshift(newAlert);
      const feedContainer = document.getElementById('alerts-feed-container');
      if (feedContainer) {
        feedContainer.prepend(createAlertCard(newAlert));
      }

      form.reset();
      showToast('Alerta ciudadana registrada con éxito', 'success');
    });
  }

  function showFieldError(field, message) {
    field.classList.add('border-red-500');
    field.classList.remove('border-[var(--border-color)]');
    const parent = field.parentElement;
    const errorMsg = document.createElement('p');
    errorMsg.className = 'field-error-text text-red-500 font-mono text-[10px] mt-1 font-semibold';
    errorMsg.textContent = message;
    parent.appendChild(errorMsg);
  }

  function clearFormErrors() {
    document.querySelectorAll('.field-error-text').forEach(el => el.remove());
    document.querySelectorAll('#report-form select, #report-form input').forEach(field => {
      field.classList.remove('border-red-500');
      field.classList.add('border-[var(--border-color)]');
    });
  }

  /* ==========================================================================
     10. TOASTS RESPONSIVOS Y UTILITARIOS
     ========================================================================= */
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-auto sm:right-6 z-[2000] flex flex-col gap-2 pointer-events-none items-center sm:items-end';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const badgeColor = type === 'success' ? 'bg-emerald-500 text-slate-950' :
                       type === 'error' ? 'bg-red-500 text-white' :
                       'bg-[var(--accent-transit)] text-slate-950';

    toast.className = 'pointer-events-auto w-full sm:w-auto max-w-sm flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs shadow-lg transition-all duration-200 translate-y-2 opacity-0';
    toast.innerHTML = `
      <div class="flex items-center gap-2 min-w-0">
        <span class="w-4 h-4 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${badgeColor}">
          ${type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}
        </span>
        <span class="leading-snug truncate font-sans text-xs">${message}</span>
      </div>
      <button type="button" class="toast-close-btn text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs shrink-0 p-0.5" aria-label="Cerrar notificación">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 200);
      };
    }

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 200);
      }
    }, 3000);
  }

  /* ==========================================================================
     11. SIMULACIÓN DE CUENTA REGRESIVA DE LLEGADA
     ========================================================================== */
  function initLiveCountdown() {
    setInterval(() => {
      BUSRIO_DATA.lines.forEach(line => {
        if (line.etaMinutes > 1) {
          line.etaMinutes -= 1;
        } else {
          line.etaMinutes = Math.floor(Math.random() * 8) + 5;
        }
      });
      if (!state.searchQuery && state.selectedStop === 'all') {
        renderCards();
      }
    }, 40000);
  }
});
