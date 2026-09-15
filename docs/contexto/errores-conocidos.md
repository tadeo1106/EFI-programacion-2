# Bitácora de Errores Conocidos y Gotchas del Maquetado - BusRío

Este documento recopila las trampas comunes de maquetado frontend, problemas recurrentes y sus soluciones técnicas probadas para blindar el código de **BusRío**.

---

## 1. Gotchas Críticos y Soluciones Preventivas

| # | Gotcha / Síntoma Típico | Causa Raíz | Solución Preventiva Probada |
| :--- | :--- | :--- | :--- |
| **1** | **Scroll horizontal roto en móviles** | Elementos hijos con anchos fijos mayores a la pantalla (ej. `w-[500px]`, `min-w-[600px]`) o márgenes negativos desbordados. | Usar siempre `w-full max-w-screen-xl` en contenedores maestros; envolver la aplicación en un contenedor raíz con `overflow-x: hidden` y verificar con DevTools a 360px de ancho. |
| **2** | **Mapa Leaflet superpuesto a la barra de navegación** | Leaflet aplica por defecto capas internas con `z-index` de hasta 400 y 600, tapando menús desplegables o el Navbar. | Asignar al `<header>` y a los modales emergentes un índice superior explícito mediante `z-[1000]` o `z-[1050]` en Tailwind (`z-50` o clases personalizadas elevadas). |
| **3** | **Recarga involuntaria de página al enviar alertas** | El botón de envío dentro de una etiqueta `<form>` tiene por defecto el comportamiento `type="submit"`, provocando recarga completa de la web. | Interceptar el evento en JavaScript con `e.preventDefault()`, validar campos visualmente y mostrar la notificación toast/modal sin recargar la página. |
| **4** | **Pérdida de contraste y texto invisible en Modo Oscuro** | Uso de clases de texto gris oscuro (como `text-gray-600`) sin declarar su contraparte oscura `dark:text-slate-300`. | Aplicar sistemáticamente clases de contraste dual en todo texto secundario: `text-slate-600 dark:text-slate-300` y `text-slate-900 dark:text-white`. |
| **5** | **Mapa Leaflet no renderiza azulejos correctamente al redimensionar** | Leaflet calcula las dimensiones del contenedor durante la carga inicial; si la ventana cambia de tamaño o el contenedor estaba oculto, los azulejos se ven grises o cortados. | Ejecutar `map.invalidateSize()` tras la carga inicial del DOM o cuando se redimensione la ventana (`window.addEventListener('resize', ...)`). |
| **6** | **Botones táctiles demasiado pequeños en celular** | Botones de filtro o de cierre de modales con un área de toque inferior a 44x44 px, frustrando la interacción con una sola mano. | Asegurar un padding mínimo (`p-2.5` o `py-2 px-4`) y altura táctil mínima (`min-h-[44px] min-w-[44px]`) en todos los elementos interactivos. |
| **7** | **Pérdida de preferencia de tema al recargar** | La alternancia de tema solo modifica la clase en memoria sin consultar `localStorage` al iniciar el script. | Inyectar un script de inicialización inmediata en el `<head>` que lea `localStorage.getItem('busrio_theme')` y asigne `class="dark"` antes del render del `<body>` para evitar parpadeos blancos (*Flash of Unstyled Theme - FOUT*). |
