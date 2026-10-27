# Convenciones de Diseño y Código - BusRío

## 1. Semántica HTML5 y Buenas Prácticas
Para asegurar accesibilidad, SEO local y código limpio, se aplican las siguientes reglas semánticas:

* **Estructura jerárquica**:
  * `<header>`: Exclusivo para la cabecera principal y barra de navegación superior.
  * `<nav>`: Contenedor estricto de listas de enlaces interactivos.
  * `<main>`: Contenedor único del contenido central de la vista.
  * `<section>`: Delimitador de cada uno de los módulos funcionales, siempre acompañado de un encabezado (`<h2>` o `<h3>`).
  * `<article>`: Tarjetas individuales del monitor de paradas y reportes de alertas ciudadanas.
  * `<footer>`: Pie de página con créditos, enlaces legales y contacto.
* **Interactividad y Accesibilidad**:
  * Elementos accionables deben ser obligatoriamente etiquetas `<button type="button">`, nunca `<div>` ni `<span>` con manejadores de clic huérfanos.
  * Todas las imágenes y logotipos deben incluir atributo `alt` descriptivo (ej. `alt="Logotipo oficial de BusRío"`).
  * Los botones que únicamente contienen iconos (como el alternador de tema o el menú móvil) deben incluir `aria-label="Alternar modo oscuro"` o texto oculto con `sr-only`.

---

## 2. Paleta de Colores y Arquitectura de Variables CSS (v2)
La arquitectura de colores de la versión `v2` utiliza variables CSS en `:root` y `html.light` para una transición dinámica, fluida y sin parpadeos:

* **Modo Oscuro (Predeterminado)**:
  * `--bg-primary: #0A0B0E` (Fondo ultra oscuro de cabina/noche).
  * `--bg-secondary: #111318` (Superficies secundarias y footer).
  * `--bg-glass: rgba(17, 19, 24, 0.75)` (Efecto cristal esmerilado con `backdrop-filter: blur(16px)`).
  * `--text-primary: #F3F4F6` (Blanco roto de alto contraste).
  * `--text-secondary: #9CA3AF` (Gris apagado para descripciones).
  * `--accent: #2563EB` / `--accent-indigo: #4F46E5` (Acento azul cobalto con resplandor `btn-glow`).
  * `--card-bg: rgba(17, 19, 24, 0.85)` y `--card-border: rgba(255, 255, 255, 0.08)`.
  * `--border-color: #1F2937`.
* **Modo Claro**:
  * `--bg-primary: #F8F9FA` (Gris tenue limpio para descanso visual).
  * `--bg-secondary: #FFFFFF` (Superficie pura).
  * `--bg-glass: rgba(255, 255, 255, 0.85)`.
  * `--text-primary: #0F172A` (Azul/gris carbón profundo).
  * `--text-secondary: #475569` (Gris pizarra medio).
  * `--card-bg: #FFFFFF` con sombra profunda difusa `0 20px 40px rgba(0,0,0,0.04)`.
  * `--card-border: #E2E8F0` y `--border-color: #E2E8F0`.

---

## 3. Tipografía y Jerarquía Visual
Importadas desde Google Fonts en el `<head>` del documento:

* **Títulos Display y Marca (`font-heading`)**:
  * Fuente: `'Plus Jakarta Sans', sans-serif`.
  * Pesos: `700 (Bold)` y `800 (ExtraBold)` con degradado sutil (`title-gradient`) de blanco a gris plata en modo oscuro, o de pizarra oscuro a medio en modo claro.
* **Cuerpo de Texto y Datos (`font-sans`)**:
  * Fuente: `'Inter', sans-serif`.
  * Pesos: `400 (Regular)`, `500 (Medium)` y `600 (SemiBold)` para datos tabulares, conteos y garitas.
  * Interlineado holgado (`leading-relaxed`) para máxima legibilidad.


---

## 4. Diseño Responsive y Micro-interacciones
* **Estrategia Mobile-First**:
  * Todas las clases base se definen para pantallas pequeñas (`< 768px`) y se expanden con prefijos (`md:`, `lg:`).
  * En celulares: el monitor se despliega en 1 columna vertical (`grid-cols-1`) con botones de al menos 44px de altura táctil.
  * En pantallas medianas y grandes: `md:grid-cols-2 lg:grid-cols-3` para aprovechar el ancho visual.
* **Micro-interacciones y Efectos Hover**:
  * **Transiciones fluidas**: `transition-all duration-200 ease-in-out` en todos los elementos interactivos.
  * **Elevación de Tarjetas**: `hover:-translate-y-1.5 hover:shadow-xl` para brindar sensación de profundidad.
  * **Botones**: `hover:scale-105 active:scale-95` para proporcionar respuesta táctil inmediata.
  * **Arribo Inminente**: Las tarjetas con colectivos arribando en $\le 5$ minutos integran la clase `animate-pulse` en su indicador de estado.
