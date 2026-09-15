# Antigravity Operating System - Directivas del Proyecto BusRío

## 1. Reglas Globales Permanentes
@.agents/rules/antigravity_global_rules.md

---

## 2. Documentación de Contexto Vivo (SDD / Gentle-AI)
Este proyecto opera bajo la metodología Spec-Driven Development (SDD). Toda la toma de decisiones, arquitectura, convenciones y criterios de aceptación se rigen por la base de conocimiento vivo en `docs/contexto/`:

* **Arquitectura y Stack Técnico**:
  @docs/contexto/arquitectura.md
* **Convenciones de Diseño, Estilos y Semántica**:
  @docs/contexto/convenciones.md
* **Registro de Decisiones de Arquitectura (ADR)**:
  @docs/contexto/decisiones.md
* **Glosario de Dominio y Componentes de Interfaz**:
  @docs/contexto/glosario.md
* **Flujo de Trabajo y Control de Calidad (DoD)**:
  @docs/contexto/flujo-de-trabajo.md
* **Bitácora de Errores Conocidos y Gotchas del Maquetado**:
  @docs/contexto/errores-conocidos.md

---

## 3. Resumen Operativo
- **Proyecto**: "BusRío" - Monitor interactivo de frecuencias, paradas y recorridos de colectivos urbanos (Río Cuarto).
- **Stack**: HTML5 Semántico, TailwindCSS (v3 CDN), Vanilla JavaScript ES6+, Leaflet.js + OpenStreetMap.
- **Modo**: Bimodal con Modo Oscuro predeterminado y persistencia en `localStorage`.
- **DoD**: Explicar el POR QUÉ antes del CÓMO, validación de los 4 estados de UI (⏳ Loading, 📭 Empty, ❌ Error, ✅ Success), responsive mobile-first y código limpio.
