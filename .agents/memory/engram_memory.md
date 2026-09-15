# Engram - Memoria Persistente Activa

## Directivas Globales Guardadas (`mem_save`)

### [2026-09-15] - Antigravity Operating System (AGY-OS) Instalado
- **ID**: `mem_directiva_agy_os`
- **Tipo**: Directiva Arquitectónica y Operativa Global (`always_on`)
- **Alcance**: Global y Permanente en el Workspace y Entorno Antigravity
- **Contenido**:
  - Se activa el rol de **Senior Product Engineer** (explicar siempre el POR QUÉ antes del CÓMO).
  - Stack tecnológico por defecto: React 18+ / TS / Vite / TailwindCSS / Zustand / TanStack Query / Patrón Repository.
  - Definition of Done (DoD) estricto: Justificación técnica, tipado y tests, verificación visual de los 4 estados UI (Loading, Empty, Error, Success), código limpio.
  - Control de Guardas: Alerta previa y confirmación obligatoria ante cambios en reglas de negocio o eventos.
  - Contexto Vivo: Gestión y consulta activa de `docs/contexto/`.
  - SDD Adaptativo: Fast-Path (1 archivo) vs Ciclo SDD completo (>2 archivos) según Gentle-AI, y protocolo Engram (`mem_context`, `mem_save`, `mem_session_summary`).
- **Estado**: Activo y Permanente.

---

### [2026-09-15] - Base de Conocimiento Inicial del Proyecto: "BusRío"
- **ID**: `mem_busrio_initial_context`
- **Tipo**: Contexto de Producto, Arquitectura y Requerimientos EFI
- **Alcance**: Proyecto BusRío (Frontend EFI Programación II)
- **Contenido Consolidado**:
  1. **Nombre y Propósito**: "BusRío" - Monitor interactivo y progresivo de frecuencias, paradas y recorridos de colectivos urbanos para Río Cuarto.
  2. **Glosario**: Parada Crítica, Línea Urbana, Tiempo Estimado de Arribo (ETA), Alerta Comunitaria, Trasbordo/Boleto Combinado, Low-Data Mode, Accesibilidad (Rampa).
  3. **Secciones**: Navbar (Logo, Selector Líneas, DarkMode, Menú), Hero (Buscador y CTA), Monitor de Paradas Clave (Cards en vivo), Mapa Interactivo de Recorridos, Módulo de Alertas Comunitarias & Formulario de Reporte, Guía de Trasbordo & Accesibilidad, Equipo (`BusRío Tech S.A.S.` - Lucas Molina & Tadeo), Footer.
  4. **Tarjetas y Datos de Muestra**: Estructura (Línea, Parada, Minutos de arribo, Estado verde/amarillo/rojo, Accesibilidad, Botón 'Ver en Mapa'). Datos de muestra con 6 líneas de Río Cuarto (Línea 1, 2, 8, 11, 14, 5).
  5. **Formulario Interactivo**: Reporte Ciudadano en vivo (Línea, Parada, Tipo de Incidencia, Comentario, Botón 'Enviar Reporte en Vivo' con feedback visual inmediato).
  6. **Colores y Modo**: Dark Mode por defecto con toggle a Light Mode. Primario Azul Cobalto (`#1e3a8a` / `#1e40af`), Secundario Verde Esmeralda (`#10b981`), Alertas Ámbar/Rojo, Fondo Dark pizarra (`#0f172a`), Fondo Light blanco/gris suave (`#f8fafc`).
  7. **Tipografía**: Google Fonts `Poppins` (títulos) + `Inter` (cuerpo de texto y tablas numéricas).
  8. **Responsive**: Mobile-First, 1 columna en teléfonos con menú hamburguesa y botones anchos; 2-3 columnas en desktop con mapa expandido.
  9. **Micro-interacciones (Hover)**: Elevación y sombra en tarjetas (`-translate-y-1 shadow-xl`), transición en botones y pulso animado en arribos inmediatos.
  10. **Framework CSS**: TailwindCSS (v3 vía CDN) por agilidad de maquetado utilitario, optimización de clases y dark mode nativo.
  11. **Interactividad**: Toggle Dark/Light en `localStorage`, filtro dinámico de paradas/líneas, modal de recorrido detallado, feedback interactivo de formulario de alertas.
  12. **Límites Técnicos**: Solo Frontend (HTML5, TailwindCSS, JavaScript limpio/modular). Prohibido backend complejo, bases de datos externas o librerías de pago.
  13. **Flujo de Trabajo**: HTML semántico ➔ Estilos Tailwind ➔ Lógica JS interactiva ➔ Verificación DoD (móvil, dark mode, 4 estados UI, consola limpia).
  14. **Gotchas a Prevenir**: Evitar scroll horizontal (`overflow-x: hidden`), contraste estricto en dark mode, etiquetas semánticas y accesibilidad en imágenes y botones.
- **Estado**: Almacenado y Verificado.

---

### [2026-09-15] - Generación y Vinculación de Documentación de Contexto Vivo
- **ID**: `mem_busrio_context_generated`
- **Tipo**: Registro de Hito de Documentación SDD
- **Alcance**: Repositorio y GEMINI.md
- **Contenido**:
  - Creados los 6 archivos canónicos en `docs/contexto/`: `arquitectura.md`, `convenciones.md`, `decisiones.md`, `glosario.md`, `flujo-de-trabajo.md`, `errores-conocidos.md`.
  - Vinculación formal completada en `GEMINI.md`.
- **Estado**: Finalizado con éxito.

---

### [2026-09-15] - Auditoría y Poda Inteligente de Skills
- **ID**: `mem_skills_audit_pruned`
- **Tipo**: Optimización del Entorno de Skills
- **Alcance**: `.agents/skills/`
- **Contenido**:
  - Evaluados 2.031 playbooks frente al stack de BusRío y las directivas de `docs/contexto/`.
  - Podadas 1.989 skills incompatibles (Node/Express, Python, Java, SQL, Docker, React, Vue, Flutter, AWS, etc.).
  - Preservadas y promovidas 42 skills de alto valor en `.agents/skills/`.
- **Estado**: Finalizado con éxito.

---

### [2026-09-15] - Implementación Completa del Frontend de BusRío
- **ID**: `mem_busrio_frontend_delivered`
- **Tipo**: Entrega de Producto Frontend (Fases 1, 2, 3 y 4 completadas)
- **Alcance**: `index.html`, `js/data.js`, `js/app.js`
- **Contenido**:
  - `index.html`: Estructura semántica HTML5 accesible, TailwindCSS v3 CDN, paleta de colores corporativa, Google Fonts (Poppins & Inter), Leaflet CSS/JS, 8 módulos integrados.
  - `js/data.js`: Mock data store completo con 6 líneas de Río Cuarto, 6 paradas críticas georreferenciadas, alertas ciudadanas iniciales y matriz de trasbordo.
  - `js/app.js`: Controlador modular con alternador de tema oscuro/claro persistente (`localStorage`), filtro de paradas en tiempo real, buscador predictivo, 4 estados UI verificados (⏳ Loading skeleton, 📭 Empty state, ❌ Error validation, ✅ Success render & toast), modal de recorrido detallado, mapa interactivo Leaflet y ticker de cuenta regresiva ETA.
- **Estado**: Finalizado con éxito y verificado.
