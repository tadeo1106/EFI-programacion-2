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
  3. **Secciones**: Navbar, Hero, Monitor de Paradas Clave, Mapa Interactivo, Alertas Comunitarias & Formulario, Guía de Trasbordo & Accesibilidad, Equipo (`BusRío Tech S.A.S.` - Lucas Molina & Tadeo), Footer.
- **Estado**: Almacenado y Verificado.

---

### [2026-09-15] - Generación y Vinculación de Documentación de Contexto Vivo
- **ID**: `mem_busrio_context_generated`
- **Tipo**: Registro de Hito de Documentación SDD
- **Alcance**: Repositorio y GEMINI.md
- **Contenido**: Creados los 6 archivos canónicos en `docs/contexto/` y vinculados en `GEMINI.md`.
- **Estado**: Finalizado con éxito.

---

### [2026-09-15] - Auditoría y Poda Inteligente de Skills
- **ID**: `mem_skills_audit_pruned`
- **Tipo**: Optimización del Entorno de Skills
- **Alcance**: `.agents/skills/`
- **Contenido**: Evaluadas y podadas 1.989 skills incompatibles; promovidas 42 skills estratégicas de alta gama.
- **Estado**: Finalizado con éxito.

---

### [2026-09-15] - Creación de Rama v2 y Rediseño Inspirado en Lattice.com
- **ID**: `mem_busrio_v2_lattice_redesign`
- **Tipo**: Evolución Visual & Branching Git (`v2`)
- **Alcance**: Rama `v2`, `index.html`, `js/app.js`, `docs/contexto/decisiones.md`
- **Contenido**:
  - Creada rama Git `v2` preservando la versión base en `main`.
  - Aplicado el sistema de diseño editorial de Lattice (https://lattice.com/):
    * Fondo cálido "Warm Paper" (`#FAF9F5`), acentos verde bosque Lattice (`#0A6C44`), sage suave y modo oscuro en carbón/obsidiana (`#0B0F17`).
    * Tipografía de alta densidad `Plus Jakarta Sans` combinada con `Inter`.
    * Tarjetas `rounded-3xl` con sombras difusas ultra suaves y bordes de 1px.
    * Segmented controls pill para los filtros de paradas.
    * Barra superior informativa ("Announcement Bar") y Ticker editorial de instituciones conectadas (UNRC, Hospital Padua, Plaza Roca, etc.).
    * Bento Grid para la propuesta de valor y boleto combinado de 60 minutos.
    * Formulario de alertas y feed en vivo con diseño limpio corporate SaaS.
    * Documentado en ADR-006 en `docs/contexto/decisiones.md`.
- **Estado**: Finalizado con éxito y verificado.

---

### [2026-09-15] - Arquitectura de Variables CSS y Diseño Glassmorphism de Alta Gama (Rama v2)
- **ID**: `mem_busrio_v2_highend_redesign`
- **Tipo**: Implementación High-End UI/UX & CSS Variables System
- **Alcance**: Rama `v2`, `index.html`, `js/app.js`, `docs/contexto/`
- **Contenido**:
  - Implementado sistema de tokens con variables CSS (`--bg-primary`, `--bg-secondary`, `--text-primary`, `--accent`, `--card-bg`, `--border-color`).
  - Modo Oscuro (`#0A0B0E`) predeterminado con soporte de Modo Claro (`#F8F9FA`) y script anti-FOUT en `<head>`.
  - Botones con efecto glow radiante (`btn-glow`), fondos ambientales con desenfoque (`ambient-glow`, `blur(120px)`), tarjetas con glassmorphism esmerilado (`glass-card`).
  - Tipografía jerárquica con títulos display en `Plus Jakarta Sans` y cuerpo en `Inter`.
  - 4 bloques de características asimétricos y alternados (Texto / UI; UI / Texto).
  - Sección de testimonios ("Customer Stories") y footer multi-columna de 5 columnas.
  - Verificación visual de los 4 estados de UI (⏳ Loading skeleton, 📭 Empty state, ❌ Error validation, ✅ Success render).
  - Documentado en ADR-007 en `docs/contexto/decisiones.md`.
- **Estado**: Finalizado con éxito y verificado.

