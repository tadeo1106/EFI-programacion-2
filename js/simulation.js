/**
 * BusRío - Motor de Simulación y Telemetría
 * Módulo independiente para físicas de movimiento, anti-agua y cálculos de ETA.
 */

const SimulationEngine = (function() {
  // Constantes de la Tierra para cálculos Haversine
  const R = 6371e3; // Radio de la tierra en metros

  // Convierte grados a radianes
  const toRad = (value) => (value * Math.PI) / 180;
  const toDeg = (value) => (value * 180) / Math.PI;

  // Distancia entre dos coordenadas en metros
  function getDistance(coord1, coord2) {
    const lat1 = toRad(coord1[0]);
    const lat2 = toRad(coord2[0]);
    const deltaLat = toRad(coord2[0] - coord1[0]);
    const deltaLng = toRad(coord2[1] - coord1[1]);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Ángulo (bearing) entre dos coordenadas
  function getBearing(coord1, coord2) {
    const lat1 = toRad(coord1[0]);
    const lat2 = toRad(coord2[0]);
    const lng1 = toRad(coord1[1]);
    const lng2 = toRad(coord2[1]);

    const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
    const brng = Math.atan2(y, x);
    return (toDeg(brng) + 360) % 360;
  }

  // Interpola una coordenada dada una distancia desde el punto de inicio
  function interpolatePosition(path, targetDistance) {
    if (!path || path.length === 0) return null;
    if (targetDistance <= 0) return { coord: path[0], bearing: 0, index: 0 };

    let accumulated = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      const segDist = getDistance(p1, p2);

      if (accumulated + segDist >= targetDistance) {
        // El punto cae en este segmento
        const remaining = targetDistance - accumulated;
        const ratio = segDist === 0 ? 0 : remaining / segDist;
        
        const lat = p1[0] + (p2[0] - p1[0]) * ratio;
        const lng = p1[1] + (p2[1] - p1[1]) * ratio;
        const bearing = getBearing(p1, p2);
        
        return { coord: [lat, lng], bearing, index: i };
      }
      accumulated += segDist;
    }
    
    // Si excede, devuelve el último punto
    const lastP = path[path.length - 1];
    const prevP = path.length > 1 ? path[path.length - 2] : lastP;
    return { coord: lastP, bearing: getBearing(prevP, lastP), index: path.length - 1 };
  }

  // Calcula la longitud total de un path
  function getPathLength(path) {
    let len = 0;
    for(let i = 0; i < path.length - 1; i++){
      len += getDistance(path[i], path[i+1]);
    }
    return len;
  }

  // Motor principal
  let simulationLoop = null;
  let timeScale = 1; // 1x, 5x, 10x
  let lastTick = performance.now();
  let mapRef = null;
  
  // Estado interno de los buses
  const buses = {}; 

  
  // --- Validación Anti-Agua ---
  function isDebugMode() {
    return new URLSearchParams(window.location.search).has('debug');
  }

  // Comprueba si dos segmentos (p1-p2) y (p3-p4) se intersectan
  function intersects(p1, p2, p3, p4) {
    const ccw = (A, B, C) => (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
    return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
  }

  function checkWaterCrossing(linesData) {
    if (!window.BUSRIO_DATA || !window.BUSRIO_DATA.riverGeometry) return;
    const river = window.BUSRIO_DATA.riverGeometry;
    const bridges = window.BUSRIO_DATA.validBridges || [];

    linesData.forEach(line => {
      let crossed = false;
      for (let i = 0; i < line.routeCoords.length - 1; i++) {
        const segStart = line.routeCoords[i];
        const segEnd = line.routeCoords[i+1];
        
        for (let j = 0; j < river.length - 1; j++) {
           const rStart = river[j];
           const rEnd = river[j+1];
           
           if (intersects(segStart, segEnd, rStart, rEnd)) {
              // Intersecta! Verificar si está cerca de un puente
              const midPoint = [(segStart[0]+segEnd[0])/2, (segStart[1]+segEnd[1])/2];
              const validBridge = bridges.find(b => getDistance(midPoint, b.coord) <= b.radius);
              
              if (!validBridge) {
                 console.warn(`💧 [ANTI-AGUA] La ${line.number} cruzó el río fuera de un puente válido! Cerca de: ${midPoint}`);
              }
              crossed = true;
           }
        }
      }
    });
  }

  function drawDebugLayers(linesData) {
    if (!mapRef || !window.BUSRIO_DATA) return;
    
    // Dibujar Río (Polilínea azul gruesa simulando el cauce)
    if (window.BUSRIO_DATA.riverGeometry) {
      L.polyline(window.BUSRIO_DATA.riverGeometry, { color: '#0ea5e9', weight: 30, opacity: 0.4 }).addTo(mapRef);
    }
    
    // Dibujar Puentes
    if (window.BUSRIO_DATA.validBridges) {
      window.BUSRIO_DATA.validBridges.forEach(b => {
         L.circle(b.coord, { radius: b.radius, color: '#f97316', fillOpacity: 0.5 }).addTo(mapRef)
          .bindTooltip(`Puente: ${b.name}`);
      });
    }

    // Dibujar puntos densos de simulación (opcional, muy pesado, pero lo pide)
    linesData.forEach(line => {
       line.routeCoords.forEach(c => {
          L.circleMarker(c, { radius: 2, color: line.color, opacity: 0.5 }).addTo(mapRef);
       });
    });
  }
  // -----------------------------

  function init(mapInstance, linesData) {
    mapRef = mapInstance;

    if (isDebugMode()) {
       console.log("🛠️ Modo Debug Activado");
       drawDebugLayers(linesData);
    }
    checkWaterCrossing(linesData);

    
    // Crear estado inicial para cada colectivo
    linesData.forEach(line => {
      const totalLength = getPathLength(line.routeCoords);
      // Iniciar en una posición aleatoria para distribuir los buses
      const startDist = Math.random() * totalLength;
      
      buses[line.id] = {
        id: line.id,
        lineObj: line,
        path: line.routeCoords,
        totalLength: totalLength,
        currentDistance: startDist,
        direction: 1, // 1: ida, -1: vuelta
        state: line.status === 'danger' ? 'Demorado' : 'En servicio',
        speedKmH: line.speed || 30, // km/h
        marker: null,
        following: false
      };

      // Crear el marcador
      const startPos = interpolatePosition(line.routeCoords, startDist);
      const icon = L.divIcon({
        className: 'custom-moving-bus-marker',
        html: `
          <div class="moving-bus-container" id="moving-bus-${line.id}" style="transform: rotate(${startPos.bearing}deg); transition: transform 0.2s linear; display: flex; align-items: center; justify-content: center; position: relative;">
            <div class="moving-bus-ping" style="background-color: ${line.color}; position: absolute; width: 100%; height: 100%; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>
            <div class="moving-bus-badge" style="background-color: ${line.color}; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: rotate(-${startPos.bearing}deg); transition: transform 0.2s linear; z-index: 10;">
              <i class="fa-solid fa-arrow-up text-[10px] text-white" style="margin-right: 3px;"></i>
              <span class="text-white font-bold text-[10px]">${line.number.replace('Línea ', 'L')}</span>
            </div>
          </div>
        `,
        iconSize: [44, 28],
        iconAnchor: [22, 14]
      });

      buses[line.id].marker = L.marker(startPos.coord, { icon }).addTo(mapInstance);
      
      // Popup base
      buses[line.id].marker.bindPopup(`
        <div class="p-1 font-mono text-xs text-[var(--text-primary)] min-w-[160px]" id="popup-${line.id}">
           Cargando telemetría...
        </div>
      `);
    });

    // Iniciar loop a 60fps aprox (16ms)
    lastTick = performance.now();
    simulationLoop = requestAnimationFrame(tick);
  }

  function tick(timestamp) {
    const deltaTimeMs = timestamp - lastTick;
    lastTick = timestamp;
    
    // Prevenir saltos gigantes si se oculta la pestaña
    if (deltaTimeMs > 1000) {
      simulationLoop = requestAnimationFrame(tick);
      return;
    }

    const deltaHours = (deltaTimeMs / 1000) / 3600;

    Object.values(buses).forEach(bus => {
      if(bus.state === 'Demorado') {
         bus.speedKmH = bus.lineObj.speed * 0.5; // Va a la mitad
      } else {
         bus.speedKmH = bus.lineObj.speed;
      }

      // Distancia recorrida en este tick (km a metros)
      const moveMeters = (bus.speedKmH * 1000) * deltaHours * timeScale;
      
      bus.currentDistance += (moveMeters * bus.direction);

      // Lógica de Ida y Vuelta / Cabecera
      if (bus.currentDistance >= bus.totalLength) {
        bus.currentDistance = bus.totalLength;
        bus.direction = -1;
      } else if (bus.currentDistance <= 0) {
        bus.currentDistance = 0;
        bus.direction = 1;
      }

      const pos = interpolatePosition(bus.path, bus.currentDistance);
      if (pos) {
        bus.marker.setLatLng(pos.coord);
        
        // Actualizar rotación del ícono
        const iconEl = bus.marker.getElement();
        if (iconEl) {
          const container = iconEl.querySelector('.moving-bus-container');
          const badge = iconEl.querySelector('.moving-bus-badge');
          // El rumbo depende de la dirección
          const actualBearing = bus.direction === 1 ? pos.bearing : (pos.bearing + 180) % 360;
          if (container && badge) {
             container.style.transform = `rotate(${actualBearing}deg)`;
             // Contra-rotar el texto para que siempre se lea derecho
             badge.style.transform = `rotate(-${actualBearing}deg)`;
          }
        }
        
        // Actualizar popup si está abierto
        if (bus.marker.isPopupOpen()) {
           updatePopup(bus);
        }

        // Seguir unidad
        if (bus.following && mapRef) {
           mapRef.panTo(pos.coord, { animate: false });
        }
      }
    });

    simulationLoop = requestAnimationFrame(tick);
  }

  function updatePopup(bus) {
    const popupEl = document.getElementById(`popup-${bus.id}`);
    if (!popupEl) return;
    
    popupEl.innerHTML = `
      <div class="flex items-center justify-between gap-2 border-b border-[var(--border-color)] pb-1 mb-2">
        <strong style="color: ${bus.lineObj.color}; font-size: 14px;">${bus.lineObj.number}</strong>
        <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase tracking-wider">EN VIVO</span>
      </div>
      <div class="text-[11px] text-[var(--text-secondary)] space-y-1 font-sans">
        <div class="flex justify-between"><span>Estado:</span> <strong class="${bus.state === 'Demorado' ? 'text-amber-500' : 'text-emerald-500'}">${bus.state}</strong></div>
        <div class="flex justify-between"><span>Vel. Sim.:</span> <strong class="font-mono">${(bus.speedKmH * timeScale).toFixed(1)} km/h</strong></div>
        <div class="flex justify-between"><span>Sentido:</span> <strong class="text-[var(--text-primary)]">${bus.direction === 1 ? 'Ida' : 'Vuelta'}</strong></div>
        <div class="flex justify-between"><span>Ocupación:</span> <strong class="text-[var(--text-primary)]">${bus.lineObj.capacity || 'Media'}</strong></div>
      </div>
      <div class="mt-2 pt-2 border-t border-[var(--border-color)]">
        <button onclick="SimulationEngine.toggleFollow('${bus.id}')" class="w-full py-1 text-[10px] font-bold rounded bg-[var(--bg-card-hover)] hover:bg-[var(--accent-transit)] hover:text-slate-900 transition-colors border border-[var(--border-color)]">
           ${bus.following ? '■ DEJAR DE SEGUIR' : '▶ SEGUIR UNIDAD'}
        </button>
      </div>
    `;
  }

  function toggleFollow(busId) {
    const bus = buses[busId];
    if (!bus) return;
    bus.following = !bus.following;
    // Detener seguimiento de otros
    if (bus.following) {
      Object.values(buses).forEach(b => { if(b.id !== busId) b.following = false; });
    }
  }

  function setTimeScale(scale) {
    timeScale = scale;
  }
  
  function getTimeScale() { return timeScale; }

  return {
    init,
    setTimeScale,
    getTimeScale,
    toggleFollow
  };
})();

window.SimulationEngine = SimulationEngine;
