/**
 * BusRío - Mock Data Store
 * Datos realistas y georreferenciados del sistema de transporte urbano de Río Cuarto.
 */

const BUSRIO_DATA = {
  // Coordenadas centrales de Río Cuarto
  cityCenter: {
    lat: -33.1230,
    lng: -64.3490,
    zoom: 13
  },

  // Paradas Críticas de alta afluencia
  stops: [
    {
      id: "plaza-roca",
      name: "Plaza Roca (Centro)",
      address: "Garita Central - Sobremonte y San Martín",
      coords: [-33.1247, -64.3489],
      type: "Centro de Conexión Primario",
      lines: ["linea-1", "linea-2", "linea-8", "linea-11", "linea-5"]
    },
    {
      id: "hospital-padua",
      name: "Hospital San Antonio de Padua",
      address: "Guardias Médicas y Policlínico - Guardias Nacionales",
      coords: [-33.1118, -64.3335],
      type: "Punto de Salud Crítico",
      lines: ["linea-2", "linea-14"]
    },
    {
      id: "unrc-campus",
      name: "UNRC (Campus Universitario)",
      address: "Ruta Nacional 36 Km 601 - Pabellón Central",
      coords: [-33.1114, -64.3005],
      type: "Polo Educativo Universitario",
      lines: ["linea-1", "linea-14"]
    },
    {
      id: "centro-trasbordo",
      name: "Centro de Trasbordo Constitución",
      address: "Calle Constitución 645",
      coords: [-33.1275, -64.3482],
      type: "Nodo de Combinación Rápida",
      lines: ["linea-1", "linea-2", "linea-11"]
    },
    {
      id: "banda-norte",
      name: "Banda Norte (Alvear y Garibaldi)",
      address: "Av. Marcelo T. de Alvear 850",
      coords: [-33.1120, -64.3560],
      type: "Sector Norte y Accesos",
      lines: ["linea-2", "linea-8"]
    },
    {
      id: "barrio-alberdi",
      name: "Barrio Alberdi (Bv. Roca)",
      address: "Bv. Roca y Colombres",
      coords: [-33.1360, -64.3390],
      type: "Sector Este y Comercial",
      lines: ["linea-1", "linea-11", "linea-5"]
    }
  ],

  // Líneas Urbanas con recorridos y frecuencias
  lines: [
    {
      id: "linea-1",
      number: "Línea 1",
      name: "Ramal Campus UNRC - Alberdi",
      color: "#ef4444", // Rojo
      textColor: "#ffffff",
      bgClass: "bg-red-500",
      textClass: "text-red-500",
      borderClass: "border-red-500",
      badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      etaMinutes: 3,
      currentStop: "plaza-roca",
      stopName: "Plaza Roca (Garita San Martín)",
      direction: "Hacia Campus Universitario UNRC",
      frequency: "Cada 12 min",
      status: "normal", // normal, warning, danger
      statusLabel: "Normal - A Horario",
      accessible: true, // Rampa para sillas de ruedas
      capacity: "Media (Asientos disponibles)",
      description: "Conecta el Centro Cívico y Plaza Roca de manera directa con la Universidad Nacional de Río Cuarto.",
      busUnit: "Coche #102",
      speed: 34,
      currentCoordIndex: 2,
      stopsList: [
        "Barrio Alberdi (Plaza San Martín)",
        "Centro de Trasbordo Constitución",
        "Plaza Roca (Centro)",
        "Puente Carretero",
        "Terminal de Ómnibus",
        "UNRC - Ingreso Principal Campus"
      ],
      routeCoords: [
        [-33.1360, -64.3390],
        [-33.1275, -64.3482],
        [-33.1247, -64.3489],
        [-33.1180, -64.3420],
        [-33.1150, -64.3300],
        [-33.1114, -64.3005]
      ]
    },
    {
      id: "linea-2",
      number: "Línea 2",
      name: "Ramal Hospital - Banda Norte",
      color: "#3b82f6", // Azul
      textColor: "#ffffff",
      bgClass: "bg-blue-600",
      textClass: "text-blue-600",
      borderClass: "border-blue-600",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      etaMinutes: 7,
      currentStop: "hospital-padua",
      stopName: "Hospital San Antonio de Padua",
      direction: "Hacia Garita Banda Norte",
      frequency: "Cada 15 min",
      status: "normal",
      statusLabel: "Normal - A Horario",
      accessible: true,
      capacity: "Moderada (80% de ocupación)",
      description: "Servicio esencial con destino al Hospital Central y barrios residenciales de Banda Norte.",
      busUnit: "Coche #108",
      speed: 30,
      currentCoordIndex: 0,
      stopsList: [
        "Hospital San Antonio de Padua",
        "Puente Colgante Bicentenario",
        "Plaza Roca (Centro)",
        "Centro de Trasbordo Constitución",
        "Parque Sarmiento",
        "Banda Norte (Av. Marcelo T. de Alvear)"
      ],
      routeCoords: [
        [-33.1118, -64.3335],
        [-33.1190, -64.3410],
        [-33.1247, -64.3489],
        [-33.1275, -64.3482],
        [-33.1160, -64.3520],
        [-33.1120, -64.3560]
      ]
    },
    {
      id: "linea-8",
      number: "Línea 8",
      name: "Troncal Banda Norte - Centro",
      color: "#f59e0b", // Ámbar / Amarillo
      textColor: "#ffffff",
      bgClass: "bg-amber-500",
      textClass: "text-amber-500",
      borderClass: "border-amber-500",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      etaMinutes: 14,
      currentStop: "plaza-roca",
      stopName: "Plaza Roca (Garita Sobremonte)",
      direction: "Hacia Barrio Jardín Norte",
      frequency: "Cada 20 min (Demora)",
      status: "warning",
      statusLabel: "Demora de 10 min",
      accessible: false,
      capacity: "Alta (Unidad colmada)",
      description: "Concurrencia alta en horario pico. Se recomienda utilizar Línea 2 como vía alternativa de trasbordo.",
      busUnit: "Coche #114",
      speed: 22,
      currentCoordIndex: 1,
      stopsList: [
        "Plaza Roca",
        "Palacio Municipal",
        "Puente Islas Malvinas",
        "Av. Marcelo T. de Alvear 850",
        "Barrio Jardín Norte"
      ],
      routeCoords: [
        [-33.1247, -64.3489],
        [-33.1210, -64.3470],
        [-33.1140, -64.3530],
        [-33.1120, -64.3560],
        [-33.1020, -64.3600]
      ]
    },
    {
      id: "linea-11",
      number: "Línea 11",
      name: "Ramal B° Alberdi - Trasbordo",
      color: "#06b6d4", // Cyan / Celeste
      textColor: "#ffffff",
      bgClass: "bg-cyan-600",
      textClass: "text-cyan-600",
      borderClass: "border-cyan-600",
      badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      etaMinutes: 5,
      currentStop: "centro-trasbordo",
      stopName: "Centro de Trasbordo Constitución",
      direction: "Hacia Bv. Roca y Colombres",
      frequency: "Cada 10 min",
      status: "normal",
      statusLabel: "Normal - A Horario",
      accessible: true,
      capacity: "Baja (Coche con asientos)",
      description: "Servicio rápido y directo entre el nodo de trasbordo céntrico y los sectores residenciales de Alberdi.",
      busUnit: "Coche #122",
      speed: 36,
      currentCoordIndex: 0,
      stopsList: [
        "Centro de Trasbordo Constitución",
        "Plaza Roca",
        "Estación Ferrocarril",
        "Bv. Roca y Colombres (Alberdi)"
      ],
      routeCoords: [
        [-33.1275, -64.3482],
        [-33.1247, -64.3489],
        [-33.1310, -64.3420],
        [-33.1360, -64.3390]
      ]
    },
    {
      id: "linea-14",
      number: "Línea 14",
      name: "Intersectorial Hospital - UNRC",
      color: "#8b5cf6", // Violeta / Púrpura
      textColor: "#ffffff",
      bgClass: "bg-purple-600",
      textClass: "text-purple-600",
      borderClass: "border-purple-600",
      badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      etaMinutes: 19,
      currentStop: "hospital-padua",
      stopName: "Hospital San Antonio de Padua",
      direction: "Hacia UNRC Campus por Buteler",
      frequency: "Frecuencia Especial (Desvío)",
      status: "danger",
      statusLabel: "Desvío por Obras en Puente",
      accessible: true,
      capacity: "Media",
      description: "⚠️ ATENCIÓN: Desvío temporal por repavimentación en Puente Carretero. Cruce habilitado por Puente Colgante.",
      busUnit: "Coche #135",
      speed: 26,
      currentCoordIndex: 3,
      stopsList: [
        "Hospital San Antonio de Padua",
        "Puente Colgante Bicentenario (Desvío)",
        "Bv. Buteler y Circunvalación",
        "Ruta 36 (Acceso UNRC)",
        "UNRC - Campus Este"
      ],
      routeCoords: [
        [-33.1118, -64.3335],
        [-33.1180, -64.3250],
        [-33.1150, -64.3120],
        [-33.1130, -64.3060],
        [-33.1114, -64.3005]
      ]
    },
    {
      id: "linea-5",
      number: "Línea 5",
      name: "Ramal B° Bimaco - Hipódromo",
      color: "#10b981", // Verde Esmeralda
      textColor: "#ffffff",
      bgClass: "bg-emerald-500",
      textClass: "text-emerald-500",
      borderClass: "border-emerald-500",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      etaMinutes: 9,
      currentStop: "barrio-alberdi",
      stopName: "Bv. Roca (Barrio Alberdi)",
      direction: "Hacia Barrio Bimaco e Hipódromo",
      frequency: "Cada 15 min",
      status: "normal",
      statusLabel: "Normal - A Horario",
      accessible: true,
      capacity: "Baja",
      description: "Recorrido troncal sur conectando Plaza Roca con los barrios Bimaco, Hipódromo y Club de Golf.",
      busUnit: "Coche #141",
      speed: 31,
      currentCoordIndex: 1,
      stopsList: [
        "Plaza Roca",
        "Bv. Roca (Alberdi)",
        "Av. Sabattini",
        "Barrio Bimaco",
        "Hipódromo Río Cuarto"
      ],
      routeCoords: [
        [-33.1247, -64.3489],
        [-33.1360, -64.3390],
        [-33.1420, -64.3450],
        [-33.1460, -64.3490],
        [-33.1500, -64.3520]
      ]
    }
  ],

  // Datos Tarifarios Oficiales (Río Cuarto) para Calculadora de Ahorro
  fare: {
    singleTicket: 1150, // Tarifa plana urbana vigente en Río Cuarto
    combinedTicket: 1150, // Con boleto combinado el 2do pasaje es gratis ($0)
    transferWindowMinutes: 60,
    averageMonthlyWorkDays: 22
  },

  // Alertas Comunitarias Ciudadanas
  alerts: [
    {
      id: "alt-1",
      type: "danger",
      title: "Desvío por Obras en Puente Carretero",
      line: "Línea 14",
      stop: "Puente Carretero / Hospital",
      author: "Comunidad Río Cuarto",
      time: "Hace 12 minutos",
      description: "Tránsito interrumpido por bacheo preventivo. Las unidades desvían por Puente Colgante Bicentenario."
    },
    {
      id: "alt-2",
      type: "warning",
      title: "Garita Plaza Roca Colmada",
      line: "Línea 8",
      stop: "Plaza Roca (Sobremonte)",
      author: "Pasajero Verificado (Lucas)",
      time: "Hace 25 minutos",
      description: "Fila de más de 40 personas esperando hacia Banda Norte. Tiempo de espera mayor a 15 minutos."
    },
    {
      id: "alt-3",
      type: "success",
      title: "Servicio Normalizado en Campus UNRC",
      line: "Línea 1",
      stop: "UNRC Campus",
      author: "Centro de Estudiantes",
      time: "Hace 40 minutos",
      description: "Frecuencia regular cada 10 minutos para regreso estudiantil hacia Plaza Roca."
    }
  ],

  // Matriz de Trasbordos y Beneficios
  transfers: {
    rule: "El boleto combinado permite conectar dos líneas diferentes abonando un único pasaje, siempre que la combinación se realice dentro de los 60 minutos desde el primer timbrado.",
    hubs: [
      {
        name: "Nodo Plaza Roca - Garita Central",
        connections: "Líneas 1, 2, 5, 8 y 11",
        benefit: "Conexión directa entre Banda Norte, Alberdi y Campus UNRC sin costo extra."
      },
      {
        name: "Centro de Trasbordo Constitución 645",
        connections: "Líneas 1, 2 y 11",
        benefit: "Parada techada con terminal de recarga y pantallas informativas del monitor BusRío."
      }
    ]
  }
};
