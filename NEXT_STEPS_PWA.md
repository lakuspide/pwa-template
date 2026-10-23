# Plan Maestro de Evolución: La PWA Definitiva (Bycoding Method)

> **⚠️ Nota de estado (revisión de plantilla):** el asistente de IA (`AiAssistantComponent`
> / `ai-assistant.service.ts`) fue **removido del código base** en esta versión de la
> plantilla. Los puntos de este documento que lo mencionan (integración de contexto,
> prompt oculto, etc.) describen una funcionalidad que ya no existe en el repo; tomalos
> como ideas de roadmap si en tu proyecto decides reintroducir un asistente, no como
> tareas pendientes sobre código actual.

Como Arquitecto Senior, este es el documento de diseño y ejecución para elevar nuestra aplicación (actualmente un prototipo visual de altísima calidad) a la categoría de **PWA Premium de Producción**. 

El objetivo es mantener el diseño "Titan Carbon Noir / Alabaster Light" intacto, pero inyectarle un motor de rendimiento, capacidades offline y conexión real con el ecosistema de IA.

---

## 🛠️ Fase 1: Fundamentos Nativos (PWA Core)
El primer paso es hacer que la aplicación deje de comportarse como una página web y se sienta como una app nativa instalada en el dispositivo.

### 1. Angular Service Worker & Offline-First
- **Acción:** Instalar `@angular/service-worker` y activarlo en `angular.json`.
- **Estrategia de Caché:** 
  - `performance`: Caché agresiva para los assets estáticos (fuentes Montserrat/JetBrains, iconos de Material, estilos CSS).
  - `freshness`: Caché con fallback a red para datos del catálogo. Si el usuario pierde conexión, podrá seguir navegando por los productos que ya visitó.
- **Background Sync:** Implementar sincronización en segundo plano para el `CheckoutDrawerComponent` y `ReservationSuccessModalComponent`. Si el usuario hace un pedido sin internet, la petición se encola y se envía automáticamente al recuperar la señal.

### 2. Manifest & Experiencia de Instalación
- **Acción:** Configurar `manifest.json`.
- **Detalles Clave:**
  - `display: "standalone"` o `"fullscreen"` para ocultar la barra de direcciones del navegador.
  - `theme_color` y `background_color` adaptables al tema oscuro/claro (usando meta tags inyectados dinámicamente).
  - Generación de iconos adaptativos y Splash Screens de alta resolución para iOS y Android (evitando pantallas blancas al cargar).
  - Intercepción del evento `beforeinstallprompt` para mostrar un prompt de instalación personalizado con diseño Titan Carbon Noir.

---

## 🧠 Fase 2: Arquitectura de Estado y Caché (IndexedDB)
Actualmente, el catálogo vive en memoria. Necesitamos persistencia robusta y ultrarrápida.

### 1. Almacenamiento Local (IndexedDB)
- **Acción:** Integrar `localforage` o la API nativa de IndexedDB.
- **Propósito:** Al abrir la app, la UI debe renderizarse *inmediatamente* leyendo de IndexedDB. En paralelo, un "Service Worker" verifica si hay actualizaciones en el servidor (SWR - Stale-While-Revalidate). Esto garantiza un tiempo de carga (TTV) casi nulo.

### 2. Refinamiento del Manejo de Estado (Signals)
- **Acción:** Consolidar el estado en un Repositorio Central de Signals.
- **Propósito:** Separar completamente la capa visual (`carousel-cylinder.component.ts`) de la lógica de negocio. Crear un `AppStore` centralizado que gestione la transición de vistas (`viewState`, `activeCategory`), carrito y usuario, asegurando que componentes como el `AiAssistantComponent` tengan acceso inmediato al contexto actual.

---

## ⚡ Fase 3: Conexión con el Backend Abstrato (InsForge / Supabase / MCP)
Es el momento de inyectar vida a los datos.

### 1. Integración de Base de Datos
- **Acción:** Implementar los endpoints reales en `product.service.ts` y `reservation.service.ts`.
- **Arquitectura:** Usar el cliente de Supabase o las APIs generadas por InsForge vía MCP.
- **Reglas de Seguridad (RLS):** Configurar políticas estricta:
  - Lectura de catálogo: Pública.
  - Creación de órdenes/reservas: Autenticada o Anónima con vinculación de session ID.
  - Lectura de historial: Solo el usuario dueño (`auth.uid() = user_id`).

### 2. Sincronización en Tiempo Real
- **Acción:** Suscripciones a cambios en la base de datos.
- **Propósito:** Si un producto se agota (stock 0) mientras el usuario tiene la app abierta, la UI debe actualizarse instantáneamente sin recargar la página.

---

## 🤖 Fase 4: Inteligencia Contextual (N8N + Nodos AI)
El Asistente de IA no debe ser un simple chatbot, debe ser un "Conserje Virtual".

### 1. Inyección de Contexto UI
- **Acción:** Modificar el `AiAssistantComponent` para inyectar el estado de la app en su prompt oculto.
- **Mecánica:** Cuando el usuario abre el asistente, enviamos en background: *"El usuario está viendo la categoría 'Premium Meats', tiene 2 items en el carrito por valor de $45. Su última acción fue hacer zoom en 'Wagyu A5'."*
- **Resultado:** El asistente iniciará la conversación diciendo: *"Excelente elección el Wagyu, ¿quieres que te recomiende un vino para acompañarlo?"* en lugar de *"¿En qué te puedo ayudar?"*

### 2. Acciones Inversas (Bot -> UI)
- **Acción:** Permitir que las respuestas del bot ejecuten funciones en la PWA (Function Calling en Gemini/N8N).
- **Mecánica:** Si el usuario dice *"Añade el vino y procede al pago"*, la IA responde con un payload JSON estructurado que la PWA interpreta, añadiendo el item al carrito y abriendo automáticamente el `CheckoutDrawerComponent`.

---

## 🎨 Fase 5: Micro-Interacciones y "Native Feel"

### 1. View Transitions API
- **Acción:** Habilitar el módulo de animaciones nativas del navegador para transiciones entre rutas o estados.
- **Propósito:** Que el paso de la grilla de categorías (`categories`) al detalle de ítems (`items`) fluya morphing elements (la imagen pequeña de la categoría se expande fluidamente hacia el título del header).

### 2. Prevención del Pull-to-Refresh y Elastic Scrolling
- **Acción:** Gestionar el `overscroll-behavior: none` en el CSS principal.
- **Propósito:** Evitar que el usuario recargue accidentalmente la página al hacer swipe hacia abajo, o que vea "el fondo blanco del navegador", manteniendo la ilusión de aplicación nativa.

### 3. Haptic Feedback (Vibración)
- **Acción:** Usar la API nativa `navigator.vibrate()`.
- **Uso:** Añadir retroalimentación táctil muy sutil (10-20ms) en pulsaciones de botones críticos: "Add to Cart", "Pay", "Swipes" en el carrusel 3D. Esto dispara masivamente la percepción de calidad en dispositivos móviles.

---

## 🚀 Plan de Ejecución Inmediata (Siguientes Pasos)

Si estás de acuerdo con esta arquitectura, el orden fisiológico de ejecución que debemos seguir es:

1. **[Core PWA]** Generar y vincular el `manifest.json`, iconos adaptables y habilitar el Service Worker de Angular básico.
2. **[Refactoring State]** Limpiar y centralizar todos los `Signals` en un Store Service inyectable para preparar el terreno para la base de datos real.
3. **[Integración]** Reemplazar la data dummy de `menu.service.ts` por llamadas reales usando el backend configurado.
4. **[AI Sync]** Conectar el estado de la UI (Store) con el componente del AI Assistant para darle contexto situacional.

*Firma: Tu Arquitecto Senior de PWA.*
