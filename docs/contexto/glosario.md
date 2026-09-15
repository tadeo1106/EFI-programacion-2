# Glosario de Dominio y Componentes de Interfaz - BusRío

Este documento establece el lenguaje ubicuo del proyecto, unificando conceptos del negocio del transporte urbano y la terminología técnica de interfaz.

---

## 1. Términos del Dominio de Transporte Urbano (Río Cuarto)
| Término | Definición y Contexto Operativo |
| :--- | :--- |
| **BusRío** | Monitor interactivo y progresivo de transporte público para los ciudadanos de Río Cuarto. |
| **BusRío Tech S.A.S.** | Empresa tecnológica ficticia responsable del desarrollo y soporte de la solución. |
| **Parada Crítica / Concurrida** | Garitas y nodos de alta afluencia de pasajeros donde se concentran demoras (ej. Plaza Roca, Hospital San Antonio de Padua, UNRC Campus, Centro de Trasbordo). |
| **Línea Urbana** | Ramal de transporte público identificado por número y color temático (ej. Línea 1, Línea 2, Línea 8, etc.). |
| **Tiempo Estimado de Arribo (ETA)** | Estimación numérica en minutos para la llegada del próximo colectivo a una garita seleccionada. |
| **Alerta Comunitaria** | Notificación generada colaborativamente por pasajeros sobre desvíos, demoras severas o unidades colmadas. |
| **Trasbordo / Boleto Combinado** | Régimen tarifario local de Río Cuarto que habilita el cambio entre dos líneas distintas en una ventana horaria sin abonar un pasaje adicional. |
| **Low-Data Mode** | Estrategia de optimización para garantizar respuesta veloz bajo redes móviles 3G lentas en las márgenes del río o periferia. |
| **Accesibilidad Universal** | Señalización de coches equipados con rampa retráctil o plataforma de piso bajo para sillas de ruedas. |

---

## 2. Componentes de Interfaz de Usuario (UI)
| Componente UI | Función en Pantalla |
| :--- | :--- |
| **Monitor de Paradas (Board)** | Tablero interactivo principal que renderiza la grilla de tarjetas de arribo en vivo. |
| **Tarjeta de Arribo (Line Card)** | Unidad modular que muestra la línea, el destino, el tiempo restante en minutos, el badge de estado y el botón de acción. |
| **Badge de Estado (Status Badge)** | Etiqueta coloreada que comunica el estado del servicio: Verde (`Normal`), Amarillo (`Frecuencia reducida`), Rojo (`Desvío / Demora`). |
| **Modal de Recorrido (Route Modal)** | Ventana emergente interactiva que se abre al cliquear una tarjeta para mostrar el trayecto completo de la línea y sus paradas. |
| **Toast de Confirmación (Feedback Toast)** | Notificación visual animada y flotante que confirma el envío exitoso de una alerta ciudadana sin recargar la página. |
| **Selector de Modo (Theme Toggle)** | Botón accesible en el Navbar que conmuta la interfaz entre Modo Oscuro y Modo Claro guardando la selección en `localStorage`. |
| **Menú Hamburguesa (Mobile Drawer)** | Menú interactivo desplegable exclusivo para pantallas de smartphone. |
| **Selector de Garita (Stop Filter Tabs)** | Botones de filtro rápido para aislar instantáneamente las líneas que confluyen en Plaza Roca, Hospital o UNRC. |
