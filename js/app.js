/**
 * BusRío - Sistema de Tránsito Urbano en Tiempo Real (Río Cuarto)
 * Lógica modular interactiva bajo sistema de diseño utilitario y brutalista:
 * - Centro de Control unificado con mapa Leaflet y panel de ramales.
 * - Cero saltos de layout (CLS = 0) con persistencia de dimensiones.
 * - Soporte bimodal (Modo Oscuro por defecto / Modo Claro) con variables CSS.
 * - Notificaciones y controles optimizados para celulares y escritorios.
 */

/* ==========================================================================
   ⚠️ ROL ADMINISTRADOR SIMULADO (SOLO FRONTEND - SIN SEGURIDAD REAL)
   Las credenciales están en texto plano en el código del cliente y la sesión
   se guarda en localStorage. Cualquiera puede leerlas o falsificar la sesión
   desde las DevTools. Es una simulación académica (E.F.I.): en producción el
   login y los cambios de estado deben validarse en un backend.
   ========================================================================== */
const ADMIN_CREDENTIALS = Object.freeze({
  username: 'admin',
  password: 'busrio2026'
});
const ADMIN_SESSION_KEY = 'busrio_admin';
const ADMIN_STATE_KEY = 'busrio_admin_state';

/* ==========================================================================
   💎 PLAN PREMIUM SIMULADO (SOLO FRONTEND - SIN COBRO NI BACKEND)
   Estado del plan, límite de favoritos y recorridos guardados en localStorage.
   ========================================================================== */
const PREMIUM_STATE_KEY = 'busrio_premium';
const PREMIUM_ROUTES_KEY = 'busrio_premium_routes';
const FREE_FAVORITES_LIMIT = 3;

// Única fuente de verdad del plan: la usan initPremium, favoritos y Mis recorridos
function isPremium() {
  return localStorage.getItem(PREMIUM_STATE_KEY) === 'true';
}

document.addEventListener('DOMContentLoaded', () => {
  // Estado central de la aplicación
  const state = {
    selectedStop: 'all',
    searchQuery: '',
    map: null,
    routeLayers: {},
    stopMarkers: {},
    busMarkers: {},
    activeLineId: null,
    currentMobileView: 'map',
    favorites: JSON.parse(localStorage.getItem('busrio_favs') || '[]'),
    isLowData: localStorage.getItem('busrio_low_data') === 'true',
    isKioskMode: false,
    busTelemetryInterval: null,
    kioskClockInterval: null
  };

  // Inicialización de componentes
  initPWA();
  sanitizeContentEditable();
  initSmoothAnchorNavigation();
  initTheme();
  initMobileMenu();
  initLeafletMap();
  initMobileViewSwitcher();
  initLowDataMode();
  initKioskMode();
  initStopFilterTabs();
  initSearch();
  initCardGrid();
  initModal();
  initAdmin();
  initLiveCountdown();

function initPremium() {
  const badge = document.getElementById('premium-badge');
  const badgeMobile = document.getElementById('premium-badge-mobile');
  
  const modal = document.getElementById('premium-modal');
  const modalBackdrop = document.getElementById('premium-modal-backdrop');
  const activateBtn = document.getElementById('premium-activate-btn');
  const deactivateBtn = document.getElementById('premium-deactivate-btn');
  const closeBtn = document.getElementById('premium-close-btn');
  let premiumLastFocus = null;

  // Lectura del plan delegada a la función global isPremium() (sin duplicar lógica)
  const loadPremiumState = isPremium;
  function setPremiumState(active) {
    localStorage.setItem(PREMIUM_STATE_KEY, active ? 'true' : 'false');
    // Aviso al resto de la UI (favoritos, Mis recorridos) para refrescar sin recargar
    document.dispatchEvent(new CustomEvent('busrio:plan-change', { detail: { premium: active } }));
  }
  function updateBadge() {
    const isPremium = loadPremiumState();
    const baseClass = 'ml-2 px-2 py-1 rounded text-xs flex items-center';
    const premiumClass = 'bg-green-600 text-white';
    const freeClass = 'bg-gray-600 text-white';
    if (badge) {
      // Preserve existing layout classes; only toggle premium/free colors
      badge.classList.remove('bg-green-600', 'bg-gray-600');
      badge.classList.add(isPremium ? 'bg-green-600' : 'bg-gray-600');
      badge.innerHTML = (isPremium ? 'Premium ' : 'Gratis ') + '<i class="fa-solid fa-crown ml-1"></i>';
    }
    if (badgeMobile) {
      // Preserve existing layout classes; only toggle premium/free colors
      badgeMobile.classList.remove('bg-green-600', 'bg-gray-600');
      badgeMobile.classList.add(isPremium ? 'bg-green-600' : 'bg-gray-600');
      badgeMobile.innerHTML = (isPremium ? 'Premium ' : 'Gratis ') + '<i class="fa-solid fa-crown ml-1"></i>';
    }
  }

  function openDialog(el, focusEl) {
    premiumLastFocus = focusEl;
    el.classList.remove('hidden');
    el.removeAttribute('hidden');
    document.body.classList.add('overflow-hidden');
    setTimeout(() => { if (focusEl) focusEl.focus(); }, 30);
  }
  function closeDialog(el) {
    el.classList.add('hidden');
    el.setAttribute('hidden', '');
    document.body.classList.remove('overflow-hidden');
    if (premiumLastFocus) premiumLastFocus.focus();
  }

  // Open modal from badges
  if (badge) badge.addEventListener('click', () => { openDialog(modal, badge); });
  if (badgeMobile) badgeMobile.addEventListener('click', () => { openDialog(modal, badgeMobile); });

  // Activate / deactivate
  if (activateBtn) activateBtn.addEventListener('click', () => {
    setPremiumState(true);
    updateBadge();
    closeDialog(modal);
    if (deactivateBtn) deactivateBtn.classList.remove('hidden');
    activateBtn.classList.add('hidden');
    if (typeof showToast === 'function') showToast('Plan Premium activado', 'success');
  });
  if (deactivateBtn) deactivateBtn.addEventListener('click', () => {
    setPremiumState(false);
    updateBadge();
    closeDialog(modal);
    activateBtn.classList.remove('hidden');
    deactivateBtn.classList.add('hidden');
    if (typeof showToast === 'function') showToast('Plan Gratis restaurado', 'info');
  });

  // Close mechanisms
  if (closeBtn) closeBtn.addEventListener('click', () => closeDialog(modal));
  if (modalBackdrop) modalBackdrop.addEventListener('click', () => closeDialog(modal));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeDialog(modal); });

  // Apertura del modal de plan desde otras partes de la UI (límite de favoritos, Mis recorridos)
  document.addEventListener('busrio:open-premium', (e) => {
    if (!modal) return;
    const trigger = (e.detail && e.detail.trigger) || document.activeElement;
    openDialog(modal, trigger);
  });

  // Initialise UI
  updateBadge();
  if (loadPremiumState()) {
    if (deactivateBtn) deactivateBtn.classList.remove('hidden');
    if (activateBtn) activateBtn.classList.add('hidden');
  } else {
    if (activateBtn) activateBtn.classList.remove('hidden');
    if (deactivateBtn) deactivateBtn.classList.add('hidden');
  }
}
initPremium();
initPremiumRoutes();

  /* ==========================================================================
     💎 MIS RECORRIDOS (PREMIUM SIMULADO)
     Plan gratis: sección bloqueada (candado) que abre #premium-modal.
     Premium: alta en modal, lista con borrar y trazado en el mapa.
     Las rutas se conservan en localStorage aunque se vuelva al plan gratis.
     ========================================================================== */
  function initPremiumRoutes() {
    const newBtn = document.getElementById('premium-new-route-btn');
    const lockedBtn = document.getElementById('premium-routes-locked');
    const list = document.getElementById('premium-routes-list');
    const modal = document.getElementById('premium-route-modal');
    const backdrop = document.getElementById('premium-route-backdrop');
    const closeBtn = document.getElementById('premium-route-close-btn');
    const cancelBtn = document.getElementById('premium-route-cancel-btn');
    const form = document.getElementById('premium-route-form');
    const nameInput = document.getElementById('premium-route-name');
    const lineSelect = document.getElementById('premium-route-line');
    const originSelect = document.getElementById('premium-route-origin');
    const destSelect = document.getElementById('premium-route-destination');
    const errorEl = document.getElementById('premium-route-error');
    let routeLastFocus = null;

    function loadRoutes() {
      try {
        const parsed = JSON.parse(localStorage.getItem(PREMIUM_ROUTES_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        return [];
      }
    }

    function saveRoutes(routes) {
      localStorage.setItem(PREMIUM_ROUTES_KEY, JSON.stringify(routes));
    }

    function makeOption(value, label) {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      return opt;
    }

    function fillLineSelect() {
      if (!lineSelect) return;
      lineSelect.innerHTML = '';
      lineSelect.appendChild(makeOption('', 'Elegí una línea'));
      BUSRIO_DATA.lines.forEach(line => {
        lineSelect.appendChild(makeOption(line.id, `${line.number} — ${line.name}`));
      });
    }

    function fillStopSelects(lineId) {
      const line = BUSRIO_DATA.lines.find(l => l.id === lineId);
      const stops = line && Array.isArray(line.stopsList) ? line.stopsList : [];
      [originSelect, destSelect].forEach(sel => {
        if (!sel) return;
        sel.innerHTML = '';
        sel.appendChild(makeOption('', line ? 'Elegí una parada' : 'Primero elegí una línea'));
        stops.forEach(stop => sel.appendChild(makeOption(stop, stop)));
        sel.disabled = !line;
      });
    }

    function clearError() {
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
      }
      [nameInput, lineSelect, originSelect, destSelect].forEach(el => {
        if (el) el.removeAttribute('aria-invalid');
      });
    }

    function showError(message, field) {
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
      }
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.focus();
      }
    }

    function isModalOpen() {
      return !!modal && !modal.classList.contains('hidden');
    }

    function openRouteModal() {
      if (!modal) return;
      if (!isPremium()) {
        document.dispatchEvent(new CustomEvent('busrio:open-premium', { detail: { trigger: lockedBtn } }));
        return;
      }
      routeLastFocus = document.activeElement;
      if (form) form.reset();
      fillLineSelect();
      fillStopSelects('');
      clearError();
      modal.classList.remove('hidden');
      modal.removeAttribute('hidden');
      document.body.classList.add('overflow-hidden');
      setTimeout(() => { if (nameInput) nameInput.focus(); }, 30);
    }

    function closeRouteModal() {
      if (!isModalOpen()) return;
      modal.classList.add('hidden');
      modal.setAttribute('hidden', '');
      document.body.classList.remove('overflow-hidden');
      if (routeLastFocus && typeof routeLastFocus.focus === 'function') routeLastFocus.focus();
    }

    function renderRoutes() {
      if (!list) return;
      list.innerHTML = '';
      const routes = loadRoutes();

      if (routes.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'text-[11px] font-mono text-[var(--text-muted)] px-1 py-1';
        empty.textContent = 'Todavía no guardaste recorridos.';
        list.appendChild(empty);
        return;
      }

      routes.forEach(route => {
        const line = BUSRIO_DATA.lines.find(l => l.id === route.lineId);
        const li = document.createElement('li');
        li.className = 'flex items-stretch gap-1.5';

        const traceBtn = document.createElement('button');
        traceBtn.type = 'button';
        traceBtn.className = 'flex-1 min-w-0 min-h-[44px] text-left px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] hover:border-[var(--accent-transit)] transition-all';
        traceBtn.setAttribute('aria-label', `Trazar recorrido ${route.name} en el mapa`);
        const title = document.createElement('span');
        title.className = 'block text-xs font-bold text-[var(--text-primary)] truncate';
        title.textContent = route.name;
        const detail = document.createElement('span');
        detail.className = 'block text-[10px] font-mono text-[var(--text-muted)] truncate';
        detail.textContent = `${line ? line.number : 'Línea no disponible'} · ${route.origin} → ${route.destination}`;
        traceBtn.append(title, detail);
        traceBtn.addEventListener('click', () => {
          if (line) {
            focusLineOnMap(line, true); // Reutiliza el mismo trazado que el botón "Trazar"
          } else {
            showToast('La línea de este recorrido ya no está disponible', 'error');
          }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500 transition-all';
        deleteBtn.setAttribute('aria-label', `Borrar recorrido ${route.name}`);
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can text-xs"></i>';
        deleteBtn.addEventListener('click', () => {
          saveRoutes(loadRoutes().filter(r => r.id !== route.id));
          renderRoutes();
          showToast(`Recorrido "${route.name}" borrado`, 'info');
        });

        li.append(traceBtn, deleteBtn);
        list.appendChild(li);
      });
    }

    // Sincroniza la sección con el plan actual (sin recargar)
    function updateRoutesUI() {
      const premium = isPremium();
      if (newBtn) {
        newBtn.classList.toggle('hidden', !premium);
        newBtn.classList.toggle('flex', premium);
      }
      if (lockedBtn) lockedBtn.classList.toggle('hidden', premium);
      if (list) {
        // En plan gratis las rutas se conservan en localStorage, pero quedan ocultas
        list.classList.toggle('hidden', !premium);
        if (premium) renderRoutes(); else list.innerHTML = '';
      }
      if (!premium) closeRouteModal();
    }

    /* ---------- Listeners (protegidos ante elementos faltantes) ---------- */
    if (newBtn) newBtn.addEventListener('click', openRouteModal);
    if (lockedBtn) {
      lockedBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('busrio:open-premium', { detail: { trigger: lockedBtn } }));
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeRouteModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeRouteModal);
    if (backdrop) backdrop.addEventListener('click', closeRouteModal);
    if (lineSelect) {
      lineSelect.addEventListener('change', () => {
        fillStopSelects(lineSelect.value);
        clearError();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError();
        if (!isPremium()) {
          closeRouteModal();
          document.dispatchEvent(new CustomEvent('busrio:open-premium', { detail: { trigger: lockedBtn } }));
          return;
        }

        const name = nameInput ? nameInput.value.trim() : '';
        const lineId = lineSelect ? lineSelect.value : '';
        const origin = originSelect ? originSelect.value : '';
        const destination = destSelect ? destSelect.value : '';

        if (!name) return showError('Ingresá un nombre para el recorrido.', nameInput);
        if (!lineId) return showError('Elegí una línea.', lineSelect);
        if (!origin) return showError('Elegí la parada de origen.', originSelect);
        if (!destination) return showError('Elegí la parada de destino.', destSelect);
        if (origin === destination) return showError('El origen y el destino tienen que ser paradas distintas.', destSelect);

        const routes = loadRoutes();
        routes.push({
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          name,
          lineId,
          origin,
          destination,
          createdAt: new Date().toISOString()
        });
        saveRoutes(routes);
        closeRouteModal();
        renderRoutes();
        showToast(`Recorrido "${name}" guardado`, 'success');
      });
    }

    // Escape cierra y Tab queda atrapado dentro del modal mientras está abierto
    window.addEventListener('keydown', (e) => {
      if (!isModalOpen()) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRouteModal();
      } else if (e.key === 'Tab') {
        const focusables = Array.from(modal.querySelectorAll('button, input, select')).filter(el => !el.disabled);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Cambio de plan desde el modal (misma pestaña) o desde otra pestaña
    document.addEventListener('busrio:plan-change', () => {
      updateRoutesUI();
      renderCards();
    });
    document.addEventListener('busrio:occupancy-change', () => {
      renderCards();
    });
    window.addEventListener('storage', (e) => {
      if (e.key === PREMIUM_STATE_KEY || e.key === PREMIUM_ROUTES_KEY) {
        updateRoutesUI();
        if (e.key === PREMIUM_STATE_KEY) renderCards();
      }
    });

    updateRoutesUI();
  }
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
     PWA SERVICE WORKER & INSTALACIÓN
     ========================================================================== */
  function initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.warn('SW registration warning:', err);
        });
      });
    }

    let deferredPrompt;
    const installBtn = document.getElementById('pwa-install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) {
        installBtn.classList.remove('hidden');
        installBtn.classList.add('flex');
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            showToast('¡BusRío instalada en tu dispositivo!', 'success');
          }
          deferredPrompt = null;
          installBtn.classList.add('hidden');
          installBtn.classList.remove('flex');
        } else {
          showToast('Para instalar: añade a la pantalla de inicio desde el menú de tu navegador.', 'info');
        }
      });
    }
  }

  /* ==========================================================================
     MODO AHORRO DE DATOS (LOW-DATA)
     ========================================================================== */
  function initLowDataMode() {
    const btn = document.getElementById('low-data-toggle-btn');
    const mobileBtn = document.getElementById('mobile-low-data-btn');

    function applyLowData(active) {
      state.isLowData = active;
      localStorage.setItem('busrio_low_data', active ? 'true' : 'false');

      if (active) {
        document.body.classList.add('low-data-mode');
        if (btn) {
          btn.classList.add('border-emerald-500', 'text-emerald-400', 'bg-emerald-500/10');
          btn.classList.remove('border-[var(--border-color)]', 'text-[var(--text-secondary)]');
        }
        if (mobileBtn) {
          mobileBtn.classList.add('border-emerald-500', 'text-emerald-400', 'bg-emerald-500/10');
        }
      } else {
        document.body.classList.remove('low-data-mode');
        if (btn) {
          btn.classList.remove('border-emerald-500', 'text-emerald-400', 'bg-emerald-500/10');
          btn.classList.add('border-[var(--border-color)]', 'text-[var(--text-secondary)]');
        }
        if (mobileBtn) {
          mobileBtn.classList.remove('border-emerald-500', 'text-emerald-400', 'bg-emerald-500/10');
        }
      }
    }

    applyLowData(state.isLowData);

    const toggle = () => {
      const newState = !state.isLowData;
      applyLowData(newState);
      showToast(
        newState ? 'Modo Low-Data activado (-80% consumo)' : 'Modo Low-Data desactivado',
        newState ? 'success' : 'info'
      );
    };

    if (btn) btn.addEventListener('click', toggle);
    if (mobileBtn) mobileBtn.addEventListener('click', toggle);
  }

  /* ==========================================================================
     MODO PANTALLA TÓTEM / KIOSCO (SALAS DE ESPERA HOSPITAL / UNRC)
     ========================================================================== */
  function initKioskMode() {
    const btn = document.getElementById('kiosk-toggle-btn');
    const mobileBtn = document.getElementById('mobile-kiosk-btn');
    const kioskView = document.getElementById('kiosk-mode-view');
    const clockEl = document.getElementById('kiosk-clock');
    const dateEl = document.getElementById('kiosk-date');

    function updateKioskClock() {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('es-AR', { hour12: false });
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('es-AR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).toUpperCase();
      }
    }

    function renderKioskBoard() {
      const board = document.getElementById('kiosk-lines-board');
      if (!board) return;
      board.innerHTML = '';

      BUSRIO_DATA.lines.forEach(line => {
        const item = document.createElement('div');
        item.className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono transition-all hover:border-slate-700';

        let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
        let statusLabel = 'EN HORARIO';
        if (line.status === 'warning') {
          statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
          statusLabel = 'DEMORADO';
        } else if (line.status === 'danger') {
          statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
          statusLabel = 'DESVÍO';
        }

        item.innerHTML = `
          <div class="flex items-center gap-3 sm:gap-4">
            <span class="w-10 h-10 rounded-lg text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center shrink-0" style="background-color: ${line.color};">
              ${line.number.replace('Línea ', 'L').toUpperCase()}
            </span>
            <div class="min-w-0">
              <h3 class="font-heading font-bold text-sm sm:text-base text-white truncate">${line.name}</h3>
              <p class="text-[11px] sm:text-xs text-slate-400 font-sans truncate">Próxima: <strong class="text-slate-200">${line.stopName}</strong> · Coche: ${line.busUnit || 'En servicio'}</p>
            </div>
          </div>
          <div class="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800/80">
            <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold border ${statusColor}">
              ${statusLabel}
            </span>
            <div class="text-right">
              <span class="text-[10px] sm:text-xs text-slate-400 uppercase block font-sans">Arribo en</span>
              <span class="text-xl sm:text-3xl font-extrabold text-[var(--accent-transit)] tracking-tight">
                ${getDisplayEta(line)} MIN
              </span>
            </div>
          </div>
        `;
        board.appendChild(item);
      });
    }

    function openKiosk() {
      if (!kioskView) return;

      // Cerrar menú móvil si estuviera abierto de fondo
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }

      state.isKioskMode = true;
      kioskView.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      renderKioskBoard();
      updateKioskClock();
      state.kioskClockInterval = setInterval(updateKioskClock, 1000);

      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      showToast('Modo Sala de Espera Activo', 'info');
    }

    function closeKiosk() {
      if (!kioskView) return;
      state.isKioskMode = false;
      kioskView.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      if (state.kioskClockInterval) {
        clearInterval(state.kioskClockInterval);
        state.kioskClockInterval = null;
      }
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }

    if (btn) btn.addEventListener('click', openKiosk);
    if (mobileBtn) mobileBtn.addEventListener('click', openKiosk);

    // Conectar todos los disparadores de cierre (móvil y escritorio)
    document.querySelectorAll('.kiosk-exit-trigger').forEach(trigger => {
      trigger.addEventListener('click', closeKiosk);
    });
    const desktopCloseBtn = document.getElementById('kiosk-close-btn');
    if (desktopCloseBtn) {
      desktopCloseBtn.addEventListener('click', closeKiosk);
    }

    // Sincronización oficial con el evento Fullscreen nativo del navegador (Esc en PC)
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && state.isKioskMode) {
        closeKiosk();
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isKioskMode) {
        closeKiosk();
      }
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
        if (state.tileLayer) state.tileLayer.setUrl('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
        document.documentElement.classList.remove('light');
        localStorage.setItem('busrio_theme', 'dark');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-amber-400 text-xs';
      } else {
        document.documentElement.classList.remove('dark');
        if (state.tileLayer) state.tileLayer.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
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
     3. ALTERNADOR DE VISTA EN CELULARES (LISTA <-> MAPA) Y CONTROL RESPONSIVO
     ========================================================================== */
  function applyResponsiveView() {
    const listCol = document.getElementById('monitor-list-col');
    const mapCol = document.getElementById('monitor-map-col');
    const toggleIcon = document.getElementById('mobile-toggle-icon');
    const toggleText = document.getElementById('mobile-toggle-text');

    if (!listCol || !mapCol) return;

    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      // En escritorio (>= 1024px), ambas columnas coexisten (sidebar + mapa)
      listCol.classList.remove('hidden');
      listCol.classList.add('flex');
      mapCol.classList.remove('hidden');
      mapCol.classList.add('flex');

      if (state.map) {
        state.map.invalidateSize();
      }
    } else {
      // En dispositivos móviles (< 1024px), el visor de mapa siempre permanece activo
      mapCol.classList.remove('hidden');
      mapCol.classList.add('flex');

      const count = BUSRIO_DATA && BUSRIO_DATA.lines ? BUSRIO_DATA.lines.length : 6;

      if (state.currentMobileView === 'list') {
        // Bottom sheet desplegado sobre el mapa
        listCol.classList.remove('hidden');
        listCol.classList.add('flex');

        if (toggleText) toggleText.innerHTML = 'Ver Mapa';
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-map-location-dot text-[var(--accent-transit)]';
      } else {
        // Vista mapa activa por defecto (Bottom sheet replegado)
        state.currentMobileView = 'map';
        listCol.classList.add('hidden');
        listCol.classList.remove('flex');

        if (toggleText) toggleText.innerHTML = `Ver Líneas (<span id="mobile-line-count">${count}</span>)`;
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-list-ul text-[var(--accent-transit)]';

        if (state.map) {
          state.map.invalidateSize();
        }
      }
    }
  }

  function switchMobileView(view) {
    state.currentMobileView = view;
    applyResponsiveView();

    if (state.map) {
      state.map.invalidateSize();
      setTimeout(() => {
        if (state.map) state.map.invalidateSize();
      }, 60);
      setTimeout(() => {
        if (state.map) state.map.invalidateSize();
      }, 150);
    }
  }

  function initMobileViewSwitcher() {
    const toggleBtn = document.getElementById('mobile-view-toggle');
    const closeBtn = document.getElementById('mobile-close-list-btn');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const nextView = state.currentMobileView === 'list' ? 'map' : 'list';
        switchMobileView(nextView);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        switchMobileView('map');
      });
    }

    // Inicializar estado responsivo (arranca en mapa)
    applyResponsiveView();

    // Sincronizar dinámicamente al redimensionar ventana
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        applyResponsiveView();
      }, 50);
    });
  }

  /* ==========================================================================
     4. FILTROS POR GARITA (PÍLDORAS UTILITARIAS)
     ========================================================================== */
  function initStopFilterTabs() {
    const tabsContainer = document.getElementById('stop-tabs-container');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    // Mapeo de nombres concisos para que las pestañas entren completas sin cortarse
    const stopShortNames = {
      'plaza-roca': 'Plaza',
      'hospital-padua': 'Hospital',
      'unrc-campus': 'UNRC',
      'centro-trasbordo': 'Trasbordo',
      'banda-norte': 'Banda Norte',
      'barrio-alberdi': 'Alberdi'
    };

    // Botón "Todas"
    const allBtn = createTabButton('all', 'Todas', 'fa-solid fa-layer-group', true, 'Todas las Garitas');
    tabsContainer.appendChild(allBtn);

    // Botón "Favoritos"
    const favsBtn = createTabButton('favorites', 'Favoritos', 'fa-solid fa-star', false, 'Líneas Favoritas');
    tabsContainer.appendChild(favsBtn);

    // Botones por cada garita
    BUSRIO_DATA.stops.forEach(stop => {
      const icon = stop.id === 'hospital-padua' ? 'fa-solid fa-hospital' :
                   stop.id === 'unrc-campus' ? 'fa-solid fa-graduation-cap' :
                   stop.id === 'plaza-roca' ? 'fa-solid fa-tree' :
                   stop.id === 'centro-trasbordo' ? 'fa-solid fa-arrows-split-up-and-left' :
                   stop.id === 'banda-norte' ? 'fa-solid fa-compass' :
                   stop.id === 'barrio-alberdi' ? 'fa-solid fa-house-chimney' : 'fa-solid fa-location-dot';
      const label = stopShortNames[stop.id] || stop.name;
      const btn = createTabButton(stop.id, label, icon, false, stop.name);
      tabsContainer.appendChild(btn);
    });
  }

  function createTabButton(id, label, iconClass, isActive, fullName = '') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-stop-id', id);
    if (fullName) {
      btn.setAttribute('title', fullName);
      btn.setAttribute('aria-label', fullName);
    } else {
      btn.setAttribute('aria-label', label);
    }
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.className = `stop-tab-btn flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg font-mono text-xs transition-all min-h-[44px] cursor-pointer ${
      isActive
        ? 'bg-[var(--accent-transit)] text-slate-950 font-bold border border-[var(--accent-transit)] shadow-sm'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--border-hover)] font-medium'
    }`;
    btn.innerHTML = `<i class="${iconClass} text-[11px] shrink-0"></i><span>${label}</span>`;

    btn.addEventListener('click', () => {
      selectStopTab(id);
    });

    return btn;
  }

  function selectStopTab(id) {
    document.querySelectorAll('.stop-tab-btn').forEach(b => {
      b.setAttribute('aria-pressed', 'false');
      b.className = 'stop-tab-btn flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg font-mono text-xs transition-all min-h-[44px] cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--border-hover)] font-medium';
    });
    const targetBtn = document.querySelector(`.stop-tab-btn[data-stop-id="${id}"]`);
    if (targetBtn) {
      targetBtn.setAttribute('aria-pressed', 'true');
      targetBtn.className = 'stop-tab-btn flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg font-mono text-xs transition-all min-h-[44px] cursor-pointer bg-[var(--accent-transit)] text-slate-950 font-bold border border-[var(--accent-transit)] shadow-sm';
    }

    state.selectedStop = id;
    triggerCardRenderWithLoading();

    // Centrado en el mapa al seleccionar garita
    if (id === 'favorites') {
      if (state.map) {
        state.map.flyTo([BUSRIO_DATA.cityCenter.lat, BUSRIO_DATA.cityCenter.lng], BUSRIO_DATA.cityCenter.zoom, { duration: 0.8 });
      }
      return;
    }

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
     5. BÚSQUEDA Y FILTRADO DE LÍNEAS
     ========================================================================== */
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
      let matchesStop = false;
      if (state.selectedStop === 'all') {
        matchesStop = true;
      } else if (state.selectedStop === 'favorites') {
        matchesStop = state.favorites.includes(line.id);
      } else {
        matchesStop = BUSRIO_DATA.stops.find(s => s.id === state.selectedStop)?.lines.includes(line.id);
      }

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

      const emptyTitle = emptyContainer.querySelector('h3');
      const emptyDesc = emptyContainer.querySelector('p');
      const resetBtn = document.getElementById('reset-filters-btn');

      if (state.selectedStop === 'favorites') {
        if (emptyTitle) emptyTitle.textContent = 'Sin líneas favoritas aún';
        if (emptyDesc) emptyDesc.textContent = 'Haz clic en la estrella (⭐) de cualquier colectivo para fijarlo aquí y tener acceso inmediato.';
        if (resetBtn) resetBtn.textContent = 'Ver Todas las Líneas';
      } else {
        if (emptyTitle) emptyTitle.textContent = 'Sin ramales para este filtro';
        if (emptyDesc) emptyDesc.textContent = 'No hay colectivos asignados a esta combinación de búsqueda.';
        if (resetBtn) resetBtn.textContent = 'Restablecer';
      }

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

  function toggleFavorite(lineId, triggerEl = null) {
    const idx = state.favorites.indexOf(lineId);
    const line = BUSRIO_DATA.lines.find(l => l.id === lineId);
    const lineName = line ? line.number : lineId;

    if (idx > -1) {
      state.favorites.splice(idx, 1);
      showToast(`${lineName} quitada de favoritos`, 'info');
    } else {
      // Plan gratis: máximo FREE_FAVORITES_LIMIT. Si ya tenía más (bajó de Premium) se conservan,
      // pero no se pueden agregar nuevos hasta quedar por debajo del límite.
      if (!isPremium() && state.favorites.length >= FREE_FAVORITES_LIMIT) {
        showToast(`Plan Gratis: máximo ${FREE_FAVORITES_LIMIT} favoritos`, 'info', {
          label: 'Ver Premium',
          ariaLabel: 'Ver plan Premium para favoritos ilimitados',
          onClick: () => {
            document.dispatchEvent(new CustomEvent('busrio:open-premium', { detail: { trigger: triggerEl } }));
          }
        });
        return;
      }
      state.favorites.push(lineId);
      showToast(`${lineName} guardada en favoritos ⭐`, 'success');
    }
    localStorage.setItem('busrio_favs', JSON.stringify(state.favorites));
    renderCards();
  }

  function createLineCard(line) {
    const article = document.createElement('article');
    const isActive = state.activeLineId === line.id;
    const isFav = state.favorites.includes(line.id);

    article.className = `line-card transit-card p-3 sm:p-3.5 transition-all cursor-pointer ${
      isActive
        ? 'border-[var(--accent-transit)] ring-1 ring-[var(--accent-transit)] bg-[var(--accent-transit)]/5'
        : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
    }`;
    article.setAttribute('data-line-id', line.id);

    // Estados utilitarios
    let statusBadgeColor = 'border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)]';
    let statusText = 'Normal';
    const displayEta = getDisplayEta(line);
    let pulseClass = displayEta <= 5 ? 'animate-pulse' : '';

    if (line.status === 'warning') {
      statusBadgeColor = 'border border-amber-500/40 bg-amber-500/10 text-amber-400';
      statusText = 'Demora';
    } else if (line.status === 'danger') {
      statusBadgeColor = 'border border-[var(--alert-soft-border)] bg-[var(--alert-soft-bg)] text-[var(--alert-soft)]';
      statusText = 'Desvío';
    }

    // Ocupación en vivo (Premium) vs Estado bloqueado con candado (Plan Gratis)
    const hasPremium = isPremium();
    const occupancy = (window.SimulationEngine && typeof window.SimulationEngine.getOccupancy === 'function')
      ? window.SimulationEngine.getOccupancy(line.id)
      : 'Medio';

    let occupancyBadgeHTML = '';
    if (hasPremium) {
      const occClass = occupancy === 'Vacío' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
        : occupancy === 'Lleno' ? 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/30'
        : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
      const occIcon = occupancy === 'Vacío' ? 'fa-solid fa-user'
        : occupancy === 'Lleno' ? 'fa-solid fa-users'
        : 'fa-solid fa-user-group';
      occupancyBadgeHTML = `
        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border ${occClass}" title="Ocupación en vivo: ${occupancy}">
          <i class="${occIcon} text-[9px]"></i>
          <span>${occupancy}</span>
        </span>
      `;
    } else {
      occupancyBadgeHTML = `
        <button type="button" id="premium-occupancy-card-${line.id}" class="premium-occupancy-lock-btn inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer" aria-label="Ocupación en vivo requiere plan Premium. Ver planes" title="Ocupación en vivo: disponible en Premium">
          <i class="fa-solid fa-lock text-[9px]"></i>
          <span>Premium</span>
        </button>
      `;
    }

    article.innerHTML = `
      <!-- Fila 1: Línea Badge + Nombre + Favorito + ETA Monospace -->
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="inline-flex items-center justify-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] shrink-0">
            ${line.number.replace('Línea ', 'L').toUpperCase()}
          </span>
          <div class="min-w-0">
            <h4 class="font-heading font-bold text-xs sm:text-sm text-[var(--text-primary)] leading-tight truncate">
              ${line.name}
            </h4>
            <span class="text-[10px] font-mono text-[var(--text-muted)]">Cada ${line.frequency.replace('Cada ', '')}</span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" class="btn-fav p-1 rounded hover:bg-[var(--bg-main)] ${isFav ? 'is-fav text-amber-400' : 'text-[var(--text-muted)] hover:text-amber-400'}" data-fav-line="${line.id}" title="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
            <i class="${isFav ? 'fa-solid text-amber-400' : 'fa-regular'} fa-star text-xs"></i>
          </button>
          <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] font-bold ${pulseClass} bg-[var(--bg-main)] text-[var(--accent-transit)] border border-[var(--border-color)]">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent-transit)]"></span>
            <span>${displayEta} MIN</span>
          </div>
        </div>
      </div>

      <!-- Fila 2: Garita próxima -->
      <div class="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] mb-2.5 bg-[var(--bg-main)] px-2.5 py-1.5 rounded border border-[var(--border-color)]">
        <i class="fa-solid fa-location-dot text-[var(--accent-transit)] text-[10px] shrink-0"></i>
        <span class="truncate font-sans">Garita: <strong class="text-[var(--text-primary)] font-medium">${line.stopName}</strong></span>
      </div>

      <!-- Fila 3: Estado, Ocupación y Botones de Acción -->
      <div class="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-color)] font-mono text-[11px]">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${statusBadgeColor}">
            ${statusText}
          </span>
          ${occupancyBadgeHTML}
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

    // Clic en el botón de estrella de favoritos
    const favBtn = article.querySelector('.btn-fav');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(line.id, favBtn);
      });
    }

    // Clic en candado de ocupación para abrir el modal de Premium
    const lockBtn = article.querySelector('.premium-occupancy-lock-btn');
    if (lockBtn) {
      lockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.dispatchEvent(new CustomEvent('busrio:open-premium', { detail: { trigger: lockBtn } }));
      });
    }

    // Clic en toda la tarjeta selecciona la línea en el mapa
    article.addEventListener('click', (e) => {
      if (e.target.closest('.view-route-btn')) {
        openLineModal(line);
        return;
      }
      if (e.target.closest('.btn-fav')) {
        return;
      }
      if (e.target.closest('.premium-occupancy-lock-btn')) {
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
    if (state.map) return;
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

    // Inicializar Telemetría de Colectivos en Movimiento
    if (window.SimulationEngine) {
      SimulationEngine.init(state.map, BUSRIO_DATA.lines);
      renderCards();
    }

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
    }, 50);

    setTimeout(() => {
      if (state.map) state.map.invalidateSize();
    }, 150);

    setTimeout(() => {
      if (state.map) state.map.invalidateSize();
    }, 300);
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

    // Actualizar banner flotante en el mapa
    const banner = document.getElementById('active-route-banner');
    const defaultBanner = document.getElementById('default-route-banner');
    const badge = document.getElementById('active-route-badge');
    const text = document.getElementById('active-route-text');

    if (banner && badge && text) {
      badge.textContent = line.number;
      text.textContent = line.name;
      banner.classList.remove('hidden');
      banner.classList.add('flex');
    }
    if (defaultBanner) {
      defaultBanner.classList.add('hidden');
    }

    const isMobile = window.innerWidth < 1024;

    // En celular, si aplica autoSwitchMobile:
    // PASO CRÍTICO: Primero hacer visible el mapa ANTES de calcular bounds
    if (autoSwitchMobile && isMobile) {
      switchMobileView('map');
      smoothScrollTo('monitor');
    }

    // Encuadrar el mapa a la traza con actualización de dimensiones garantizada
    if (state.routeLayers[line.id]) {
      const routeLayer = state.routeLayers[line.id];
      const bounds = routeLayer.getBounds();

      if (bounds && bounds.isValid()) {
        if (isMobile) {
          // En móvil, dar 60ms para que el navegador aplique display:block antes de calcular píxeles
          setTimeout(() => {
            if (state.map) {
              state.map.invalidateSize();
              state.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
            }
          }, 60);
        } else {
          state.map.invalidateSize();
          state.map.fitBounds(bounds, { padding: [40, 40] });
        }
      }
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
    const defaultBanner = document.getElementById('default-route-banner');
    if (banner) {
      banner.classList.add('hidden');
      banner.classList.remove('flex');
    }
    if (defaultBanner) {
      defaultBanner.classList.remove('hidden');
    }
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
     9. ROL ADMINISTRADOR SIMULADO (LOGIN + PANEL DE CONTROL)
     ⚠️ Simulación sin seguridad real (ver ADMIN_CREDENTIALS al inicio del archivo).
     Los datos de configuración se definen dentro de funciones / state porque
     initAdmin() se invoca antes de este bloque (evita errores de TDZ con const).
     ========================================================================== */
  function getAdminConfig() {
    return {
      validStatuses: ['normal', 'warning', 'danger'],
      statusOptions: { normal: 'Normal', warning: 'Demorada', danger: 'Desviada' },
      statusLabels: {
        normal: 'Normal - A Horario',
        warning: 'Demorada (+5 min)',
        danger: 'Desviada (recorrido alternativo)'
      },
      // Minutos que se suman al ETA según el estado de la línea
      etaPenalty: { normal: 0, warning: 5, danger: 8 },
      speeds: [0.5, 1, 2]
    };
  }

  // ETA mostrado = ETA simulado + diferencia de penalización respecto del estado original de demo
  function getDisplayEta(line) {
    const original = state.adminOriginal && state.adminOriginal[line.id];
    if (!original) return line.etaMinutes;
    const penalty = getAdminConfig().etaPenalty;
    const diff = (penalty[line.status] || 0) - (penalty[original.status] || 0);
    return Math.max(1, line.etaMinutes + diff);
  }

  function isAdminLoggedIn() {
    try {
      const session = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null');
      return !!(session && session.user === ADMIN_CREDENTIALS.username);
    } catch (err) {
      return false;
    }
  }

  function loadAdminState() {
    const empty = { lines: {}, paused: [], timeScale: null };
    try {
      const raw = JSON.parse(localStorage.getItem(ADMIN_STATE_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return empty;
      const { validStatuses, speeds } = getAdminConfig();
      const lines = {};
      Object.keys(raw.lines || {}).forEach(id => {
        if (state.adminOriginal[id] && validStatuses.includes(raw.lines[id])) lines[id] = raw.lines[id];
      });
      const paused = Array.isArray(raw.paused) ? raw.paused.filter(id => state.adminOriginal[id]) : [];
      const timeScale = speeds.includes(raw.timeScale) ? raw.timeScale : null;
      return { lines, paused, timeScale };
    } catch (err) {
      return empty;
    }
  }

  function saveAdminState(adminState) {
    localStorage.setItem(ADMIN_STATE_KEY, JSON.stringify(adminState));
  }

  // Aplica un estado a una línea: datos, simulación (marcador) y trazado del mapa
  function applyLineStatus(lineId, status) {
    const line = BUSRIO_DATA.lines.find(l => l.id === lineId);
    const original = state.adminOriginal[lineId];
    if (!line || !original) return;

    line.status = status;
    line.statusLabel = status === original.status ? original.statusLabel : getAdminConfig().statusLabels[status];

    if (window.SimulationEngine && SimulationEngine.setLineStatus) {
      SimulationEngine.setLineStatus(lineId, status);
    }

    const layer = state.routeLayers[lineId];
    if (layer) {
      layer.setStyle({ dashArray: status === 'danger' ? '6, 6' : status === 'warning' ? '2, 8' : null });
    }
  }

  function applyAdminStateToApp(adminState) {
    BUSRIO_DATA.lines.forEach(line => {
      const status = adminState.lines[line.id] || state.adminOriginal[line.id].status;
      applyLineStatus(line.id, status);
      if (window.SimulationEngine && SimulationEngine.setBusPaused) {
        SimulationEngine.setBusPaused(line.id, adminState.paused.includes(line.id));
      }
    });
    if (window.SimulationEngine) {
      SimulationEngine.setTimeScale(adminState.timeScale || 1);
    }
  }

  function initAdmin() {
    // Snapshot del estado original de demo (base para ETA y para "Restablecer")
    state.adminOriginal = {};
    BUSRIO_DATA.lines.forEach(line => {
      state.adminOriginal[line.id] = { status: line.status, statusLabel: line.statusLabel };
    });
    state.adminLastFocus = null;

    const loginBtn = document.getElementById('admin-login-btn');
    const panelBtn = document.getElementById('admin-panel-btn');
    const mobileAdminBtn = document.getElementById('mobile-admin-btn');
    const mobileAdminLabel = document.getElementById('mobile-admin-label');

    const loginModal = document.getElementById('admin-login-modal');
    const loginForm = document.getElementById('admin-login-form');
    const userInput = document.getElementById('admin-username');
    const passInput = document.getElementById('admin-password');
    const loginError = document.getElementById('admin-login-error');

    const panel = document.getElementById('admin-panel');
    const linesList = document.getElementById('admin-lines-list');
    const fleetList = document.getElementById('admin-fleet-list');
    const speedGroup = document.getElementById('admin-speed-group');
    const resetBtn = document.getElementById('admin-reset-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');

    // Aplicar cambios persistidos del admin al iniciar (visibles para cualquier usuario)
    applyAdminStateToApp(loadAdminState());

    if (!loginModal || !panel) return;

    const isOpen = (el) => el && !el.classList.contains('hidden');

    function openDialog(el, focusEl) {
      state.adminLastFocus = document.activeElement;
      el.classList.remove('hidden');
      el.removeAttribute('hidden');
      document.body.classList.add('overflow-hidden');
      setTimeout(() => { if (focusEl) focusEl.focus(); }, 30);
    }

    function closeDialog(el) {
      el.classList.add('hidden');
      el.setAttribute('hidden', '');
      if (!isOpen(loginModal) && !isOpen(panel)) {
        document.body.classList.remove('overflow-hidden');
      }
      const last = state.adminLastFocus;
      if (last && document.body.contains(last) && last.offsetParent !== null) last.focus();
    }

    function trapFocus(e, el) {
      const focusables = Array.from(
        el.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter(node => node.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function updateAdminUI() {
      const logged = isAdminLoggedIn();
      if (loginBtn) loginBtn.classList.toggle('hidden', logged);
      if (panelBtn) panelBtn.classList.toggle('hidden', !logged);
      if (mobileAdminLabel) mobileAdminLabel.textContent = logged ? 'Panel Admin' : 'Acceso Admin';
      if (mobileAdminBtn) {
        mobileAdminBtn.setAttribute('aria-label', logged ? 'Abrir panel de administración' : 'Iniciar sesión como administrador');
      }
      if (!logged && isOpen(panel)) closeDialog(panel);
    }

    /* ---------- Login ---------- */
    function clearLoginError() {
      if (loginError) {
        loginError.textContent = '';
        loginError.classList.add('hidden');
      }
      [userInput, passInput].forEach(input => {
        if (!input) return;
        input.removeAttribute('aria-invalid');
        input.classList.remove('border-red-500');
      });
    }

    function showLoginError(message, fields) {
      if (loginError) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
      }
      fields.forEach(input => {
        input.setAttribute('aria-invalid', 'true');
        input.classList.add('border-red-500');
      });
      if (fields[0]) fields[0].focus();
    }

    function openLogin() {
      if (loginForm) loginForm.reset();
      clearLoginError();
      openDialog(loginModal, userInput);
    }

    function closeLogin() {
      closeDialog(loginModal);
    }

    if (loginForm && userInput && passInput) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearLoginError();

        const username = userInput.value.trim();
        const password = passInput.value;

        if (!username && !password) {
          showLoginError('Completá el usuario y la contraseña.', [userInput, passInput]);
          return;
        }
        if (!username) {
          showLoginError('Ingresá el nombre de usuario.', [userInput]);
          return;
        }
        if (!password) {
          showLoginError('Ingresá la contraseña.', [passInput]);
          return;
        }

        // ⚠️ Comparación en el cliente: simulación sin seguridad real
        if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
          passInput.value = '';
          showLoginError('Usuario o contraseña incorrectos. Verificá los datos e intentá de nuevo.', [passInput]);
          return;
        }

        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ user: username, since: new Date().toISOString() }));
        loginForm.reset();
        closeLogin();
        updateAdminUI();
        showToast('Sesión de administrador iniciada', 'success');
        openPanel();
      });

      [userInput, passInput].forEach(input => {
        input.addEventListener('input', () => {
          input.removeAttribute('aria-invalid');
          input.classList.remove('border-red-500');
        });
      });
    }

    document.querySelectorAll('[data-admin-login-close]').forEach(el => {
      el.addEventListener('click', closeLogin);
      // Backdrop click for admin login modal
      const adminLoginBackdrop = loginModal.querySelector('#modal-backdrop');
      if (adminLoginBackdrop) adminLoginBackdrop.addEventListener('click', (e) => { if (isOpen(loginModal)) closeLogin(); });
      // Escape key to close admin login modal
      window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen(loginModal)) closeLogin(); });
    });

    /* ---------- Panel ---------- */
    function renderAdminLines() {
      if (!linesList) return;
      const { statusOptions } = getAdminConfig();
      linesList.innerHTML = BUSRIO_DATA.lines.map(line => `
        <li class="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)]">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${line.color};" aria-hidden="true"></span>
            <div class="min-w-0">
              <p class="font-mono font-bold text-xs text-[var(--text-primary)]">${line.number}</p>
              <p class="text-[11px] text-[var(--text-secondary)] truncate">${line.name}</p>
            </div>
          </div>
          <label for="admin-status-${line.id}" class="sr-only">Estado de ${line.number}</label>
          <select
            id="admin-status-${line.id}"
            data-admin-line="${line.id}"
            class="min-h-[44px] shrink-0 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent-transit)] cursor-pointer"
          >
            ${Object.keys(statusOptions).map(value => `
              <option value="${value}" ${line.status === value ? 'selected' : ''}>${statusOptions[value]}</option>
            `).join('')}
          </select>
        </li>
      `).join('');
    }

    function renderAdminFleet() {
      if (!fleetList) return;
      const sim = window.SimulationEngine;
      fleetList.innerHTML = BUSRIO_DATA.lines.map(line => {
        const paused = !!(sim && sim.isBusPaused && sim.isBusPaused(line.id));
        const unit = line.busUnit || 'Unidad';
        return `
          <li class="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)]">
            <div class="min-w-0">
              <p class="font-mono font-bold text-xs text-[var(--text-primary)] truncate">${line.number.replace('Línea ', 'L')} · ${unit}</p>
              <p class="text-[11px] font-mono ${paused ? 'text-slate-400' : 'text-emerald-500'}">
                <i class="fa-solid ${paused ? 'fa-circle-pause' : 'fa-circle-play'} mr-1" aria-hidden="true"></i>${paused ? 'Pausado' : 'En movimiento'}
              </p>
            </div>
            <button
              type="button"
              data-admin-bus="${line.id}"
              aria-pressed="${paused}"
              aria-label="${paused ? 'Reanudar' : 'Pausar'} ${unit} de la ${line.number}"
              class="min-h-[44px] min-w-[44px] px-3 rounded-lg border font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                paused
                  ? 'bg-[var(--accent-transit)] text-slate-950 border-[var(--accent-transit)] hover:bg-[var(--accent-transit-hover)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--accent-transit)]'
              }"
            >
              <i class="fa-solid ${paused ? 'fa-play' : 'fa-pause'}" aria-hidden="true"></i>
              <span>${paused ? 'Reanudar' : 'Pausar'}</span>
            </button>
          </li>
        `;
      }).join('');
    }

    function renderAdminSpeed() {
      if (!speedGroup || !window.SimulationEngine) return;
      const current = SimulationEngine.getTimeScale();
      speedGroup.querySelectorAll('[data-admin-speed]').forEach(btn => {
        const active = parseFloat(btn.dataset.adminSpeed) === current;
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        btn.classList.toggle('bg-[var(--accent-transit)]', active);
        btn.classList.toggle('text-slate-950', active);
        btn.classList.toggle('text-[var(--text-secondary)]', !active);
      });
    }

    function renderAdminPanel() {
      renderAdminLines();
      renderAdminFleet();
      renderAdminSpeed();
    }

    function openPanel() {
      if (!isAdminLoggedIn()) {
        openLogin();
        return;
      }
      renderAdminPanel();
      openDialog(panel, document.getElementById('admin-panel-close'));
    }

    function closePanel() {
      closeDialog(panel);
    }

    // Click on X button closes panel
    document.querySelectorAll('[data-admin-panel-close]').forEach(el => {
      el.addEventListener('click', closePanel);
    });

    // Backdrop click for admin panel modal (only once)
    const adminPanelBackdrop = panel.querySelector('#modal-backdrop');
    if (adminPanelBackdrop) {
      adminPanelBackdrop.addEventListener('click', (e) => {
        if (isOpen(panel)) closePanel();
      });
    }

    // Escape key to close admin panel modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen(panel)) closePanel();
    });

    // Delegación de eventos: un único listener por contenedor (sin duplicados al re-renderizar)
    if (linesList) {
      linesList.addEventListener('change', (e) => {
        const select = e.target.closest('select[data-admin-line]');
        if (!select || !isAdminLoggedIn()) return;
        const lineId = select.dataset.adminLine;
        const status = select.value;
        const { validStatuses, statusOptions } = getAdminConfig();
        if (!validStatuses.includes(status)) return;

        applyLineStatus(lineId, status);

        const adminState = loadAdminState();
        if (status === state.adminOriginal[lineId].status) {
          delete adminState.lines[lineId];
        } else {
          adminState.lines[lineId] = status;
        }
        saveAdminState(adminState);
        renderCards();

        const line = BUSRIO_DATA.lines.find(l => l.id === lineId);
        showToast(`${line ? line.number : lineId}: ${statusOptions[status]}`, status === 'normal' ? 'success' : 'info');
      });
    }

    if (fleetList) {
      fleetList.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-admin-bus]');
        if (!btn || !isAdminLoggedIn() || !window.SimulationEngine) return;
        const lineId = btn.dataset.adminBus;
        const willPause = !SimulationEngine.isBusPaused(lineId);
        SimulationEngine.setBusPaused(lineId, willPause);

        const adminState = loadAdminState();
        adminState.paused = adminState.paused.filter(id => id !== lineId);
        if (willPause) adminState.paused.push(lineId);
        saveAdminState(adminState);

        renderAdminFleet();
        const newBtn = fleetList.querySelector(`button[data-admin-bus="${lineId}"]`);
        if (newBtn) newBtn.focus();

        const line = BUSRIO_DATA.lines.find(l => l.id === lineId);
        showToast(`${line ? line.busUnit : lineId} ${willPause ? 'pausado' : 'reanudado'}`, 'info');
      });
    }

    if (speedGroup) {
      speedGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-admin-speed]');
        if (!btn || !isAdminLoggedIn() || !window.SimulationEngine) return;
        const speed = parseFloat(btn.dataset.adminSpeed);
        if (!getAdminConfig().speeds.includes(speed)) return;

        SimulationEngine.setTimeScale(speed);
        const adminState = loadAdminState();
        adminState.timeScale = speed;
        saveAdminState(adminState);
        renderAdminSpeed();
        showToast(`Velocidad de simulación: x${speed}`, 'info');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!isAdminLoggedIn()) return;
        const ok = window.confirm('¿Restablecer los datos de demo? Se perderán los estados de líneas, pausas y velocidad configurados.');
        if (!ok) return;
        localStorage.removeItem(ADMIN_STATE_KEY);
        applyAdminStateToApp(loadAdminState());
        renderAdminPanel();
        renderCards();
        showToast('Datos de demo restablecidos', 'success');
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        closePanel();
        updateAdminUI();
        showToast('Sesión de administrador cerrada', 'info');
      });
    }

    /* ---------- Disparadores del navbar ---------- */
    if (loginBtn) loginBtn.addEventListener('click', openLogin);
    if (panelBtn) panelBtn.addEventListener('click', openPanel);
    if (mobileAdminBtn) {
      mobileAdminBtn.addEventListener('click', () => {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenu) mobileMenu.classList.add('hidden');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
        if (isAdminLoggedIn()) openPanel(); else openLogin();
      });
    }

    // Teclado: Escape cierra y Tab queda atrapado dentro del diálogo activo
    window.addEventListener('keydown', (e) => {
      const active = isOpen(loginModal) ? loginModal : isOpen(panel) ? panel : null;
      if (!active) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog(active);
      } else if (e.key === 'Tab') {
        trapFocus(e, active);
      }
    });

    // Sincronización entre pestañas del mismo navegador (sin backend no hay sync entre dispositivos)
    window.addEventListener('storage', (e) => {
      if (e.key === ADMIN_STATE_KEY) {
        applyAdminStateToApp(loadAdminState());
        renderCards();
        if (isOpen(panel)) renderAdminPanel();
      } else if (e.key === ADMIN_SESSION_KEY) {
        updateAdminUI();
      }
    });

    updateAdminUI();
  }

  /* ==========================================================================
     10. TOASTS RESPONSIVOS Y UTILITARIOS
     ========================================================================== */
  function showToast(message, type = 'success', action = null) {
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

    // Acción opcional (ej.: "Ver Premium" al alcanzar el límite de favoritos)
    if (action && action.label && typeof action.onClick === 'function') {
      const actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      actionBtn.className = 'toast-action-btn shrink-0 min-h-[44px] px-3 rounded-lg bg-amber-400 text-slate-950 font-mono font-bold text-[11px] flex items-center gap-1.5 hover:bg-amber-300';
      actionBtn.setAttribute('aria-label', action.ariaLabel || action.label);
      actionBtn.innerHTML = '<i class="fa-solid fa-crown text-[10px]"></i>';
      actionBtn.appendChild(document.createTextNode(action.label));
      actionBtn.addEventListener('click', () => {
        action.onClick();
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 200);
      });
      toast.insertBefore(actionBtn, toast.querySelector('.toast-close-btn'));
    }

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
    }, action ? 6000 : 3000);
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

// --- Animaciones E.F.I. (Scroll Intersection Observer) ---
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  // Seleccionar tarjetas, secciones y el equipo para animar
  const animatedElements = document.querySelectorAll('.transit-card, section h2, .grid > div');
  animatedElements.forEach(el => {
    el.classList.add('fade-in-up');
    observer.observe(el);
  });
});
