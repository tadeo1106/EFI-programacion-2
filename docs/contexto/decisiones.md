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
