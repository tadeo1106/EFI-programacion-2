# Registro de Decisiones de Arquitectura (ADR) - BusRío

Este documento registra cronológicamente las decisiones fundamentales de arquitectura, tecnología y diseño adoptadas en el proyecto.

> [!IMPORTANT]
> **Control de Guardas y Autorización Previa Obligatoria**:
> Cualquier modificación que altere o elimine reglas de negocio consolidadas (fórmulas de tiempo de arribo, lógica de trasbordos, esquemas de datos mock o despacho de eventos de usuario) debe ser previamente explicada con su análisis de impacto y **requiere autorización explícita del usuario** antes de su implementación en el código.

---

## [ADR-001] Adopción del Antigravity Operating System (AGY-OS) y Gentle-AI
* **Fecha y Hora**: 2026-09-15 11:45 UTC-3
* **Estado**: Aceptado
* **Contexto**: Se requiere un marco estructurado para guiar el desarrollo de la EFI con estándares de Senior Product Engineer, código limpio y trazabilidad.
* **Decisión**:
  1. Activar directivas permanentes `always_on` en `.agents/rules/antigravity_global_rules.md`.
  2. Implementar memoria activa y continua con protocolo Engram (`mem_save`, `mem_context`, `mem_session_summary`).
  3. Establecer ciclo SDD Adaptativo (Fast-Path para 1 archivo vs Ciclo SDD completo para $\ge 2$ archivos).
* **Consecuencias**: Desarrollo predecible, cero deuda técnica oculta y cumplimiento riguroso del Definition of Done (DoD).

---

## [ADR-002] Selección de Tailwind CSS (v3 vía CDN) como Motor de Estilos
* **Fecha y Hora**: 2026-09-15 12:00 UTC-3
* **Estado**: Aceptado
* **Contexto**: El proyecto requiere maquetación veloz, enfoque Mobile-First, soporte de Modo Oscuro nativo y cero sobrecarga de compiladores pesados para la entrega del curso.
* **Decisión**: Utilizar la distribución oficial de Tailwind CSS por CDN con script de configuración personalizada (`tailwind.config`) para inyectar la paleta corporativa y tipografía.
* **Consecuencias**: Código visual legible directamente en las clases utilitarias, sin archivos `.css` gigantescos difíciles de mantener por principiantes.

---

## [ADR-003] Selección de Leaflet.js + OpenStreetMap para Mapeo Liviano
* **Fecha y Hora**: 2026-09-15 12:02 UTC-3
* **Estado**: Aceptado
* **Contexto**: Se necesita visualizar paradas y líneas sobre un mapa interactivo de Río Cuarto sin costos comerciales de Google Maps API ni dependencias de facturación por tarjeta de crédito.
* **Decisión**: Integrar Leaflet.js (vía CDN) sobre los azulejos libres de OpenStreetMap, trazando polilíneas coloreadas por línea y marcadores interactivos para las paradas críticas.
* **Consecuencias**: Cero costo, render liviano (< 40 KB) y total independencia de cuotas de facturación externas.

---

## [ADR-004] Modo Oscuro Predeterminado con Persistencia en LocalStorage
* **Fecha y Hora**: 2026-09-15 12:04 UTC-3
* **Estado**: Aceptado
* **Contexto**: La aplicación está orientada a usuarios en la vía pública en horarios pico y nocturnos, donde la luz tenue de las garitas exige confort visual y menor consumo de batería en pantallas OLED.
* **Decisión**: Configurar la aplicación para que cargue por defecto en Modo Oscuro (`class="dark"` en `<html>`), permitiendo la alternancia manual a Modo Claro mediante un botón en la barra de navegación, guardando la preferencia en `localStorage.getItem('busrio_theme')`.
* **Consecuencias**: Excelente ergonomía visual nocturna y respeto por la preferencia del usuario en visitas posteriores.

---

## [ADR-005] Simulación de Datos Mock Ricos en Frontend Puro (Sin Servidor)
* **Fecha y Hora**: 2026-09-15 12:05 UTC-3
* **Estado**: Aceptado
* **Contexto**: La consigna de la EFI de Programación II exige un sitio completo enfocado exclusivamente en Frontend, prohibiendo expresamente la necesidad de montar backends o bases de datos complejas.
* **Decisión**: Estructurar un Data Store en memoria dentro de JavaScript con datos reales y fidedignos de Río Cuarto (recorridos hacia UNRC, Hospital, Banda Norte, Alberdi, Plaza Roca), simulando el paso del tiempo en los minutos de llegada de cada colectivo.
* **Consecuencias**: Proyecto 100% portable, autónomo, capaz de ejecutarse abriendo directamente el archivo `index.html` en cualquier navegador web.

---

## [ADR-006] Rediseño de UI/UX Editorial Inspirado en Lattice.com (Rama v2)
* **Fecha y Hora**: 2026-09-15 13:45 UTC-3
* **Estado**: Aceptado
* **Contexto**: El usuario solicitó evolucionar la presentación visual en una nueva rama `v2` adoptando el lenguaje visual de clase mundial de la plataforma Lattice (https://lattice.com/).
* **Decisión**:
  1. Conservar intactos el 100% de las reglas de negocio, datos mock de Río Cuarto, endpoints y funcionalidades interactivas (monitor, mapa, alertas, trasbordos, equipo).
  2. Implementar los tokens de diseño distintivos de Lattice:
     - Paleta con fondo cálido "Warm Paper" (`#FAF9F5`), superficies blancas prístinas, acentos verde bosque Lattice (`#0A6C44`), toques sutiles de gradiente arcoíris/aurora, y modo oscuro en carbón/obsidiana (`#0B0F17`).
     - Tipografía geométrica editorial de alta densidad (`Plus Jakarta Sans` y `Inter`).
     - Componentes con bordes curvos suaves (`rounded-3xl`), sombras difusas tenues y píldoras (`rounded-full`) para badges y botones.
     - Ticker editorial de instituciones conectadas y disposición tipo Bento Grid para valor agregado.
* **Consecuencias**: Interfaz corporativa moderna de estándar B2B SaaS internacional, manteniendo la ergonomía móvil y la identidad riocuartense de BusRío.

---

## [ADR-007] Arquitectura de Variables CSS y Diseño Glassmorphism de Alta Gama (Rama v2)
* **Fecha y Hora**: 2026-09-15 14:15 UTC-3
* **Estado**: Aceptado
* **Contexto**: El usuario requirió elevar la landing page a un estándar visual premium de alta gama ("romper el estilo IA básico") con soporte dinámico e instantáneo de Modo Oscuro (`#0A0B0E`) y Modo Claro (`#F8F9FA`), botones resplandecientes (`btn-glow`), fondos ambientales con desenfoque (`filter: blur(120px)`), tipografía de display `Plus Jakarta Sans` y cuerpo `Inter`, 4 bloques asimétricos alternados, sección de testimonios ("Customer Stories") y footer de 5 columnas.
* **Decisión**:
  1. Centralizar el color y superficies en variables CSS `:root` y `html.light` (`--bg-primary`, `--bg-secondary`, `--bg-glass`, `--text-primary`, `--text-secondary`, `--accent`, `--accent-glow`, `--card-bg`, `--card-border`, `--border-color`, `--shadow-elevation`).
  2. Implementar micro-interacciones espaciales: tarjetas de vidrio esmerilado (`backdrop-filter: blur(16px)`), gradientes de borde sutiles (`border: 1px solid var(--card-border)`) y botones con glow exterior (`box-shadow: 0 4px 20px var(--accent-glow)`).
  3. Estructurar la sección central con 4 bloques alternados asimétricos (Texto Izquierda / UI Derecha; UI Izquierda / Texto Derecha) para guiar el flujo de lectura.
  4. Respetar estrictamente los 4 estados de UI (⏳ Loading skeleton, 📭 Empty state, ❌ Error validation, ✅ Success render) en las tarjetas de monitoreo y alertas ciudadanas.
* **Consecuencias**: Estética de producto SaaS de élite, cero flash de tema no deseado (anti-FOUT en `<head>`), y compatibilidad total con el motor de datos y reglas de negocio de BusRío.

---

## [ADR-008] Centro de Control Unificado (Monitor + Mapa), Estabilidad de Layout (CLS = 0) y Toasts Móviles
* **Fecha y Hora**: 2026-09-15 15:00 UTC-3
* **Estado**: Aceptado
* **Contexto**: Tras pruebas de uso real, se identificaron 3 fricciones de UX críticas en la versión preliminar:
  1. Distancia excesiva entre la selección de líneas/paradas y el mapa Leaflet, requiriendo scroll vertical continuo.
  2. Salto abrupto de dimensiones y colapso visual al filtrar ramales o cambiar de estado (CLS severo).
  3. Desbordamiento y visualización deficiente de notificaciones flotantes (toasts) en pantallas móviles estrechas (< 420px).
* **Decisión**:
  1. **Centro de Control Unificado**: Integrar el Monitor de Líneas y el Mapa Leaflet lado a lado en un split-view (`lg:grid-cols-12`: 5 cols panel de tarjetas, 7 cols mapa interactivo). En móviles, proveer selector segmentado (`[ Líneas ]` / `[ Mapa ]`) con cambio automático y reajuste de tamaño (`invalidateSize`).
  2. **Contenedor con Altura Estable**: Establecer altura fija (`h-[600px]`) con scroll interno suave en el panel de tarjetas. Los 3 estados (Loading skeleton idéntico, Empty state centrado y Success list) comparten exactamente el mismo contenedor sin alterar el alto de la página ni un píxel.
  3. **Notificaciones Responsivas**: Contenedor adaptativo `bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-auto sm:right-6` con tarjetas `w-full sm:w-auto max-w-sm`, botón de cierre explícito y textos concisos.
* **Consecuencias**: Interfaz sumamente ágil, ergonómica para celulares y computadoras, sin saltos visuales molestos y con retroalimentación inmediata sobre la cartografía.

---

## [ADR-009] Adopción de Sistema de Diseño Utilitario y Brutalista de Tránsito
* **Fecha y Hora**: 2026-09-15 15:40 UTC-3
* **Estado**: Aceptado
* **Contexto**: Se requirió erradicar por completo la estética genérica de plantillas IA (degradados, sombras difusas grandes, manchas de desenfoque y colores pastel dispersos), reemplazándola por una estética moderna, utilitaria y brutalista inspirada en aplicaciones reales de control de tránsito urbano.
* **Decisión**:
  1. **Tipografía Utilitaria**: Adopción de `Space Grotesk` para títulos fuertes y estructurados, `Inter` para texto corrido y `JetBrains Mono` para datos, horarios y contadores de minutos.
  2. **Esquema de Color**:
     - Modo Oscuro (Predeterminado): Fondo asfalto (`#0F111A`), tarjetas gris oscuro (`#1E293B`), bordes finos (`#334155`), textos blanco tiza (`#F8FAFC`) y gris claro (`#94A3B8`).
     - Modo Claro: Fondo off-white (`#FAF9F6`), tarjetas blanco puro (`#FFFFFF`), bordes (`#E2E8F0`), textos azul asfalto (`#0F172A`).
     - Acento Único: Amarillo Tránsito (`#F59E0B`), eliminando colores pastel dispersos. Se reserva rojo suave (`#EF4444`) exclusivamente para alertas críticas y desvíos en vivo.
  3. **Hero Asimétrico en Capas**: 2 columnas (Izquierda: H1 y Buscador de Recorridos en tarjeta UI; Derecha: Mockup en capas absolutas simulando mapa base y tarjetas flotantes de arribo).
  4. **Tarjetas sin Sombras Grandes**: `border-radius: 12px`, borde sólido de 1px, elevación sutil de 2px en hover (`hover:-translate-y-0.5`).
  5. **Testimonios y Footer**: Iniciales monocromas sin degradados; footer corporativo profundo (`#0A0D14`) en ambos modos.
* **Consecuencias**: Look & feel de aplicación de tránsito seria, sólida y profesional, con altísima legibilidad y cero clichés visuales.

---

## [ADR-010] Resolución de Ergonomía de Cursor, Scroll Offset por Navbar y Sincronización Cartográfica
* **Fecha y Hora**: 2026-09-24 21:30 UTC-3
* **Estado**: Aceptado
* **Contexto**:
  1. **Cursor de edición involuntario**: Títulos, botones y contenedores mostraban el cursor I-beam (`|`) invitando a escribir y permitiendo selección accidental en elementos no editables.
  2. **Scroll Offset excesivo ("quedar más abajo")**: La barra de navegación `sticky top-0` (64px) tapaba las cabeceras de las secciones al navegar con enlaces internos o llamar a `scrollIntoView()`.
  3. **Cartografía de Ramales y Garitas**: Se detectó desincronización entre las paradas clave y los recorridos trazados (faltaba la cabecera Alberdi en Línea 1, el Centro de Trasbordo en Línea 2, y puntos intermedios en Líneas 14 y 5).
* **Decisión**:
  1. **Sistema de Cursores y Anti-I-Beam**:
     - `cursor: default` y `user-select: none` para `h1-h6`, contenedores `.transit-card`, `.transit-nav`, badges y controles.
     - `cursor: pointer` forzado en todos los botones, enlaces, selectores y elementos interactivos.
     - `cursor: text` y `user-select: text` estrictamente reservado para campos editables (`input`, `textarea`).
     - Neutralización en CSS y barrido defensivo en JS contra cualquier atributo `contenteditable` residual.
  2. **Offset de Navegación Suave (Anti-Clipping)**:
     - Configuración de `scroll-padding-top: 5.5rem` en `html` y `scroll-margin-top: 5.5rem` en todas las secciones y tarjetas ancla (`#report-form-card`).
     - Función auxiliar `smoothScrollTo(target, offsetExtra)` que descuenta dinámicamente la altura del header sticky + 24px de respiro, interceptando navegación interna y llamadas programáticas.
  3. **Sincronización Cartográfica Integral**:
     - Línea 1: Vinculada bidireccionalmente con `barrio-alberdi` (cabecera oficial).
     - Línea 2: Sincronizada con `centro-trasbordo` tanto en itinerario (`stopsList`) como en traza (`routeCoords`).
     - Línea 14 y Línea 5: Traza georreferenciada de 5 puntos exacta coincidente con sus 5 paradas.
* **Consecuencias**: Ergonomía visual óptima, navegación fluida sin cortes de títulos y mapa 100% verificado y fidedigno a la red de colectivos de Río Cuarto.

---

## [ADR-011] Telemetría Viva, PWA Real, Planificador '¿Cómo Llego?', Favoritos, Modo Tótem y Calculadora Tarifaria (Rama v2.1)
* **Fecha y Hora**: 2026-09-25 14:35 UTC-3
* **Estado**: Aceptado
* **Contexto**: Para elevar el proyecto BusRío al máximo estándar de entrega de la EFI de Programación II, se requirió implementar 7 capacidades avanzadas sin romper la arquitectura frontend pura ni incorporar librerías pesadas de pago.
* **Decisión**:
  1. **Planificador de Viajes '¿Cómo Llego?'**: Lógica algorítmica puramente en el cliente que evalúa origen y destino, detecta si existe línea directa o calcula el transbordo óptimo en nodos de conexión (Plaza Roca / Centro de Trasbordo), verificando la ventana gratuita de 60 minutos y permitiendo trazar la ruta en el mapa.
  2. **Telemetría Simulada en Vivo**: Marcadores dinámicos de colectivos en Leaflet (`DivIcon` con número de línea, pulso animado, popups con coche, velocidad en km/h y ocupación) que se desplazan de manera continua a lo largo de las coordenadas de cada ramal.
  3. **PWA Real**: Manifiesto web oficial (`manifest.webmanifest`), icono SVG vectorial multi-resolución y Service Worker (`sw.js`) con estrategia Cache-First y resiliencia offline para paradas sin cobertura celular.
  4. **Sistema de Favoritos en LocalStorage**: Pestaña dedicada "⭐ Favoritos" y botón estrella en cada tarjeta de línea, permitiendo a pasajeros habituales priorizar sus ramales frecuentes.
  5. **Modo Tótem / Kiosco**: Vista en pantalla completa con reloj digital, tipografía monospace gigante (`JetBrains Mono`) y tiempos de llegada de alto contraste, diseñada para proyectarse en salas de espera de la UNRC o del Hospital San Antonio de Padua.
  6. **Calculadora Interactiva de Ahorro**: Simulador financiero en la sección de trasbordos que calcula en tiempo real el dinero mensual (\$ ARS) que ahorra el usuario al utilizar el régimen de combinación de Río Cuarto.
  7. **Modo Low-Data**: Interruptor de ahorro de datos para conexiones 3G débiles que atenúa los azulejos de OpenStreetMap y optimiza el consumo de batería y CPU móvil.
* **Consecuencias**: Solución integral, atractiva y funcional que cumple y supera ampliamente los requisitos técnicos y de producto de la consigna.
