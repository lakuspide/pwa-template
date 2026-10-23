# 🏗️ Arquitectura Técnica: L.K.O.S PWA

Este documento detalla la estructura de código, tecnologías y flujos de datos para el despliegue del wireframe de **L.K.O.S (La Kuspide Operating System)**.

## 🛠️ Stack Tecnológico

*   **Framework Core:** Angular (v21+, 100% Zoneless, Standalone Components).
*   **Gestión de Estado:** Angular Signals (Reactividad pura y síncrona).
*   **Estilos y Layouts:** Tailwind CSS (Arquitectura utilitaria de CSS, UI consistente).
*   **Animaciones y Drag & Drop:** `motion` (Librería Vanilla JS para animaciones fluidas) + utilidades nativas de HTML5 o Angular CDK para arrastrar elementos.
*   **Iconografía:** Angular Material Icons (integración ligera) y/o iconos en SVG personalizados.

## 🗂️ Estructura de Directorios (Propuesta)

```text
/src/app/
│
├── core/                   # Núcleo del Sistema Operativo
│   ├── os-state.service.ts # Gestor principal de Signals (procesos, z-index, temas)
│   ├── window.manager.ts   # Lógica matemática para redimensionar y posicionar ventanas
│   └── platform.service.ts # Detección de dispositivo (Móvil vs Escritorio)
│
├── desktop/                # El entorno visual principal
│   ├── desktop.component.ts        # Renderiza fondo y accesos directos
│   ├── taskbar/                    # Barra de tareas
│   │   ├── taskbar.component.ts
│   │   ├── start-menu.component.ts # Menú de inicio
│   │   └── system-tray.component.ts# Hora, estado de red, batería
│   └── window/                     # Contenedor agnóstico de ventanas
│       ├── window.component.ts     # Wrapper (botones de cerrar, redimensionar)
│       └── window.directives.ts    # Directivas de Drag & Drop y Resize
│
├── apps/                   # Aplicaciones del Sistema (Instanciables)
│   ├── k-files/            # Explorador de archivos
│   ├── k-term/             # Terminal
│   ├── k-settings/         # Ajustes
│   └── k-web/              # Web Browser
│
└── shared/                 # Componentes genéricos de UI interna
    ├── ui-button/
    ├── ui-context-menu/
    └── ui-dialog/
```

## 🧠 Arquitectura del Motor de Ventanas (Window Manager)

El mayor desafío técnico de un OS simulado en web es el rendimiento renderizando múltiples ventanas y el control preciso de eventos del ratón/pantalla táctil.

### 1. El Estado Global (OS State Service)

Utilizaremos un Store basado en Signals (`os-state.service.ts`) que actuará como el "Kernel" del OS.

```typescript
// Estructura del estado de los procesos/ventanas
export interface Process {
  id: string;             // Identificador único (e.g. 'sys.term.1')
  title: string;          // Título en la barra superior
  componentName: string;  // Qué app cargar dentro del contenedor
  state: 'opened' | 'minimized' | 'maximized' | 'closed';
  zIndex: number;         // Profundidad para decidir cuál está al frente
  bounds: {               // Dimensiones y ubicación
    x: number;
    y: number;
    width: number;
    height: number;
  };
  icon: string;
}
```

El servicio tendrá Signals como `processesMap = signal<Map<string, Process>>()` y un `activeProcessId = signal<string | null>()`.

### 2. Flujo de Renderizado de Ventanas

1.  El usuario hace clic en el ícono de "Terminal".
2.  El evento invoca `OsStateService.spawn('k-term')`.
3.  El servicio crea un nuevo objeto `Process`, le asigna coordenadas base y el z-index más alto disponible y lo añade al map.
4.  El `desktop.component.html` tiene un *for loop* reactivo (`@for (process of processes(); track process.id)`) que renderiza componentes `<app-window>`.
5.  `<app-window>` es un "*shell*" visual, dentro de él utilizará Angular `ViewContainerRef` o directivas estructurales (`@switch`) para renderizar dinámicamente el componente de la app (`<k-term>`).

### 3. Z-Index y Focalización (Enfoque)

*   Cada vez que una ventana recibe una interacción (`mousedown` o toque), notifica al `OsStateService`.
*   El servicio actualiza el `activeProcessId` y aumenta el `zIndex` de ese proceso por encima del máximo actual, desencadenando un render que trae la ventana al frente.

## 🎨 Sistema de Diseño y UI

1.  **Glassmorphism Moderado:** Se utilizarán clases de Tailwind como `bg-white/70 backdrop-blur-md` (o `bg-zinc-900/80` para modo oscuro) en la barra de tareas y marcos de ventana, aportando una sensación de profundidad de OS moderno corporativo, pero cuidando el rendimiento en móviles.
2.  **Modo Oscuro como un Ciudadano de Primera Clase:** Soporte profundo mediante la clase `dark:` en Tailwind, alternable instantáneamente desde `k-settings`.
3.  **Movimiento Físico:** Al abrir una ventana, no aparece de golpe. Utilizará `motion` para escalar desde `scale: 0.9, opacity: 0` hasta su tamaño real con un efecto `spring` rápido. Al minimizar, se encogerá hacia su ícono en la barra de tareas.

## 📱 Estrategia "Responsiva por Paradigma"

Los sistemas operativos de escritorio no se ajustan directamente bien a pantallas de 375px.

**Detección:** El sistema detectará el `viewport`.
*   **Pantallas Grandes (+768px):** Paradigma de ventanas libre, solapables, *drag and drop* activado, barra de tareas inferor completa.
*   **Pantallas Pequeñas (Mobile):** 
    *   Las ventanas siempre se abren maximizadas (ancho 100%, altura total menos la barra de tareas).
    *   El Drag & Resize se deshabilita preventivamente.
    *   El gestor de ventanas emula una vista apilada tipo tarjetas (similar a la navegación entre apps en iOS) o un z-index simple donde solo la app frontal es visible.
    *   La barra de tareas se convierte en un Dock compacto simplificado.
