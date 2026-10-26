import type { CatalogCategory, CatalogItem } from '../app/models/catalog';
import type {
  BrandOverrides,
  PresetSummary,
  SiteConfig,
  SiteContent,
  SiteIdentity,
  SitePreset,
  SiteTerms,
  SectorPresetId,
} from './site.types';

/**
 * Bundled sector presets.
 *
 * All demo copy is in Spanish (es-ES) on purpose, like the interface: the
 * template code and its comments stay in English, the documentation is in
 * Spanish. A generated project replaces the identity through
 * `BRAND_OVERRIDES` and keeps the chosen preset's structure.
 *
 * Each preset is independent: changing one never affects another, and a
 * production project pins exactly one (`DEMO_MODE = false`).
 */

/* ------------------------------------------------------------------ */
/* Catalog helpers                                                     */
/* ------------------------------------------------------------------ */

interface CatalogEntry {
  name: string;
  price: number | null;
  description?: string;
}

interface CatalogGroup {
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  /** Sector artwork, relative to `public/`. */
  image: string;
  items: CatalogEntry[];
}

function catalog(prefix: string, groups: CatalogGroup[]): CatalogCategory[] {
  return groups.map((group, groupIndex) => {
    const image = group.image;
    return {
      id: `${prefix}-${groupIndex + 1}`,
      name: group.name,
      subtitle: group.subtitle,
      icon: group.icon,
      image,
      items: group.items.map<CatalogItem>((entry, itemIndex) => ({
        id: `${prefix}-${groupIndex + 1}-${itemIndex + 1}`,
        name: entry.name,
        price: entry.price,
        description: entry.description ?? group.description,
        image,
      })),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Identity and editorial helpers                                      */
/* ------------------------------------------------------------------ */

const BASE_IDENTITY: SiteIdentity = {
  appName: 'Plantilla Base',
  shortName: 'Plantilla',
  tagline: 'Plantilla de comercio genérica',
  description:
    'Plantilla PWA mobile-first para cualquier sector comercial: catálogo, carrito, pedidos, roles y funcionamiento sin conexión.',
  lang: 'es',
  locale: 'es-ES',
  currency: 'EUR',
  version: '1.4.0',
  themeColorDark: '#050505',
  themeColorLight: '#f2f2f7',
  backgroundColor: '#050505',
  storagePrefix: 'plantilla-base',
  accentDark: '#0a84ff',
  accentLight: '#007aff',
};

function identity(overrides: Partial<SiteIdentity>): SiteIdentity {
  return { ...BASE_IDENTITY, ...overrides };
}

function standardTerms(entity: string, updated: string): SiteTerms {
  return {
    title: 'Términos y condiciones',
    intro: `Estos términos se aplican a ${entity} y a cada solicitud o pedido realizado a través de esta aplicación.`,
    sections: [
      {
        heading: 'Uso del servicio',
        body: 'Utiliza el catálogo con fines personales y no comerciales. La disponibilidad, las descripciones y las imágenes pueden cambiar sin previo aviso.',
      },
      {
        heading: 'Precios y pago',
        body: 'Los precios se muestran en la moneda configurada e incluyen los impuestos aplicables, salvo que se indique lo contrario. El pago se confirma antes de iniciar la preparación o la entrega.',
      },
      {
        heading: 'Cancelaciones y devoluciones',
        body: 'Escríbenos lo antes posible si algo va mal en una solicitud. Los productos perecederos y los trabajos personalizados pueden no admitir devolución.',
      },
      {
        heading: 'Privacidad',
        body: 'Solo guardamos los datos necesarios para responder a una solicitud o preparar un pedido. Esta demo mantiene esa información en el navegador y no envía nada a un servidor.',
      },
    ],
    updated: `Última actualización: ${updated}`,
  };
}

/* ------------------------------------------------------------------ */
/* Presets                                                             */
/* ------------------------------------------------------------------ */

const BOUTIQUE: SitePreset = {
  id: 'boutique',
  label: 'Boutique',
  description: 'Comercio completo para una tienda pequeña: precios, carrito, pedidos y tiendas.',
  icon: 'storefront',
  heroImage: 'images/sectors/boutique.svg',
  features: {
    prices: true,
    cart: true,
    checkout: true,
    auth: true,
    locations: true,
    about: true,
    promo: true,
    terms: true,
    reviews: true,
  },
  identity: identity({
    appName: 'Maison Lumière',
    shortName: 'Maison',
    tagline: 'Objetos para vivir despacio',
    description:
      'Una boutique cuidada de cerámica, textil, iluminación y papelería, con entrega local y recogida en tienda.',
    accentDark: '#d4a373',
    accentLight: '#9c6644',
    storagePrefix: 'maison-lumiere',
  }),
  content: {
    hero: {
      meta: 'Catálogo · Carrito · Sin conexión',
      swipeHint: 'Desliza hacia arriba',
      enterLabel: 'Entrar en el catálogo de la boutique',
    },
    promo: {
      label: 'Selección de otoño',
      detail: 'Entrega local gratis en pedidos de más de 80 €',
    },
    about: {
      title: 'Un pequeño estudio de objetos duraderos',
      lead: 'Trabajamos con artesanos a quienes importan el material, la reparación y el tiempo.',
      paragraphs: [
        'Maison Lumière empezó como un puesto de fin de semana y creció hasta convertirse en una tienda tranquila de piezas pensadas para usarse cada día. Cada objeto se elige en persona y en pequeñas cantidades.',
        'Reparamos lo que vendemos, mantenemos el embalaje sencillo y publicamos los materiales de cada pieza en el catálogo. Si necesitas ayuda para elegir, escríbenos: respondemos a todos los mensajes.',
      ],
    },
    locations: [
      {
        id: 'location-1',
        eyebrow: 'Tienda principal',
        name: 'Centro',
        address: 'Carrer de la Llum, 12',
        area: 'Casco antiguo',
        phone: '+34 910 000 101',
        hours: '10:00 - 20:00',
        hoursLabel: 'Lunes - sábado',
      },
      {
        id: 'location-2',
        eyebrow: 'Estudio',
        name: 'Ribera',
        address: 'Passeig del Riu, 48',
        area: 'Talleres del río',
        phone: '+34 910 000 102',
        hours: '11:00 - 19:00',
        hoursLabel: 'Martes - sábado',
      },
      {
        id: 'location-3',
        eyebrow: 'Pop-up',
        name: 'Puerto',
        address: 'Moll de la Marina, 8',
        area: 'Paseo marítimo',
        phone: '+34 910 000 103',
        hours: '11:00 - 21:00',
        hoursLabel: 'Viernes - domingo',
      },
    ],
    contact: {
      email: 'hello@maisonlumiere.example',
      phone: '+34 910 000 101',
    },
    terms: standardTerms('Maison Lumière', 'octubre de 2026'),
  },
  catalog: catalog('boutique', [
    {
      name: 'Cerámicas',
      subtitle: 'Gres torneado a mano',
      icon: 'coffee',
      image: 'images/boutique/ceramics.svg',
      description: 'Esmalte moteado, cocido en pequeñas tandas y apto para el uso diario.',
      items: [
        { name: 'Taza de gres', price: 24 },
        { name: 'Bol de servir', price: 38 },
        { name: 'Juego para filtro', price: 62 },
      ],
    },
    {
      name: 'Textiles',
      subtitle: 'Lino lavado y lana',
      icon: 'bed',
      image: 'images/boutique/textiles.svg',
      description: 'Tejidos en Portugal, más suaves con cada lavado y fáciles de remendar.',
      items: [
        { name: 'Manta de lino', price: 89 },
        { name: 'Funda de cojín', price: 42 },
        { name: 'Camino de lana', price: 76 },
      ],
    },
    {
      name: 'Iluminación',
      subtitle: 'Luz cálida y baja',
      icon: 'light_mode',
      image: 'images/boutique/lighting.svg',
      description: 'Lámparas regulables, con bombillas reemplazables y cable reparable.',
      items: [
        { name: 'Lámpara colgante de papel', price: 120 },
        { name: 'Lámpara de mesa', price: 148 },
        { name: 'Portavelas', price: 34 },
      ],
    },
    {
      name: 'Papelería',
      subtitle: 'Notas y pequeños regalos',
      icon: 'menu_book',
      image: 'images/boutique/paper.svg',
      description: 'Impreso en papel reciclado por una imprenta familiar.',
      items: [
        { name: 'Cuaderno de tela', price: 18 },
        { name: 'Calendario de sobremesa', price: 22 },
        { name: 'Set de envolver regalos', price: 12 },
      ],
    },
  ]),
};

const MENU: SitePreset = {
  id: 'menu',
  label: 'Menú',
  description: 'Restaurante o cafetería: platos, precios, pedidos para recoger y una ubicación.',
  icon: 'restaurant',
  heroImage: 'images/sectors/menu.svg',
  features: {
    prices: true,
    cart: true,
    checkout: true,
    auth: false,
    locations: true,
    about: true,
    promo: true,
    terms: true,
    reviews: false,
  },
  identity: identity({
    appName: 'Casa Verde',
    shortName: 'Casa Verde',
    tagline: 'Cocina de temporada, todo el día',
    description:
      'Una cocina de barrio con menú de temporada, vino natural y pedidos para recoger.',
    accentDark: '#7cb518',
    accentLight: '#4f772d',
    storagePrefix: 'casa-verde',
  }),
  content: {
    hero: {
      meta: 'Menú · Recogida · Sin conexión',
      swipeHint: 'Desliza hacia arriba',
      enterLabel: 'Abrir el menú',
    },
    promo: {
      label: 'Plato del día',
      detail: 'Pollo asado con verduras de mercado · 16 €',
    },
    about: {
      title: 'Una cocina de barrio',
      lead: 'Platos de temporada, vino natural y una barra donde quedarse un rato.',
      paragraphs: [
        'Casa Verde cocina lo que le da el mercado. El menú cambia cada pocas semanas y los platos pequeños están pensados para compartir alrededor de la mesa.',
        'Pide para recoger desde esta app o acércate sin reserva. Reservamos unos taburetes libres para el café y un trozo de lo que haya salido del horno esa mañana.',
      ],
    },
    locations: [
      {
        id: 'location-1',
        eyebrow: 'Cocina',
        name: 'Casa Verde',
        address: 'Carrer del Mercat, 24',
        area: 'Plaza del mercado',
        phone: '+34 910 000 202',
        hours: '09:00 - 23:00',
        hoursLabel: 'Martes - domingo',
      },
    ],
    contact: {
      email: 'hola@casaverde.example',
      phone: '+34 910 000 202',
    },
    terms: standardTerms('Casa Verde', 'octubre de 2026'),
  },
  catalog: catalog('menu', [
    {
      name: 'Desayunos',
      subtitle: 'Hasta las 11:30',
      icon: 'breakfast_dining',
      image: 'images/menu/breakfast.svg',
      description: 'Horneado esa mañana y servido con café o té.',
      items: [
        { name: 'Tostada de masa madre', price: 6.5 },
        { name: 'Bol de temporada', price: 9.5 },
        { name: 'Huevos poché', price: 8 },
      ],
    },
    {
      name: 'Para compartir',
      subtitle: 'Pequeños platos',
      icon: 'tapas',
      image: 'images/menu/small-plates.svg',
      description: 'Vivos, salados y fáciles de pasar alrededor de la mesa.',
      items: [
        { name: 'Aceitunas con cítricos', price: 4.5 },
        { name: 'Pan a la brasa', price: 5.5 },
        { name: 'Ensalada de mercado', price: 8.5 },
      ],
    },
    {
      name: 'Principales',
      subtitle: 'Del horno de leña',
      icon: 'lunch_dining',
      image: 'images/menu/mains.svg',
      description: 'Cocinado al momento; consulta al equipo por los alérgenos.',
      items: [
        { name: 'Pollo asado', price: 16 },
        { name: 'Pasta de setas', price: 14.5 },
        { name: 'Pescado del día', price: 18 },
      ],
    },
    {
      name: 'Bebidas',
      subtitle: 'Café, vino y refrescos',
      icon: 'local_cafe',
      image: 'images/menu/drinks.svg',
      description: 'Pequeños productores, poca intervención y mucho hielo.',
      items: [
        { name: 'Café de filtro', price: 3.2 },
        { name: 'Limonada de la casa', price: 4 },
        { name: 'Vino natural', price: 6.5 },
      ],
    },
  ]),
};

const SHOWCASE: SitePreset = {
  id: 'showcase',
  label: 'Escaparate',
  description: 'Solo imágenes e información: sin precios, carrito ni pedidos.',
  icon: 'palette',
  heroImage: 'images/sectors/showcase.svg',
  features: {
    prices: false,
    cart: false,
    checkout: false,
    auth: false,
    locations: false,
    about: true,
    promo: false,
    terms: false,
    reviews: false,
  },
  identity: identity({
    appName: 'Atelier North',
    shortName: 'Atelier',
    tagline: 'Impresión, objetos y espacios',
    description:
      'Una selección de trabajos de un estudio de diseño independiente: impresión, objetos e interiores.',
    accentDark: '#f2a65a',
    accentLight: '#c46d1f',
    storagePrefix: 'atelier-north',
  }),
  content: {
    hero: {
      meta: 'Trabajos · Estudio · Contacto',
      swipeHint: 'Desliza hacia arriba',
      enterLabel: 'Entrar en el escaparate',
    },
    promo: {
      label: 'Estudio abierto',
      detail: 'Visítanos el primer viernes de cada mes',
    },
    about: {
      title: 'Estudio de diseño independiente',
      lead: 'Impresión, objetos y espacios con un punto de vista sereno.',
      paragraphs: [
        'Atelier North es un estudio de dos personas que trabaja identidad, diseño editorial y pequeños interiores. Aceptamos unos pocos proyectos al año y nos implicamos en la producción.',
        'Este catálogo es una selección de trabajos recientes. Abre cualquier pieza para leer el encargo; escríbenos si quieres ver el caso completo o hablar de un proyecto.',
      ],
    },
    locations: [],
    contact: {
      email: 'studio@ateliernorth.example',
      phone: '+44 20 0000 3030',
    },
    terms: standardTerms('Atelier North', 'octubre de 2026'),
  },
  catalog: catalog('showcase', [
    {
      name: 'Impresión',
      subtitle: 'Editorial e identidad',
      icon: 'print',
      image: 'images/showcase/print.svg',
      description: 'Una revista trimestral, una muestra tipográfica y un cartel de exposición.',
      items: [
        {
          name: 'Cuadernos de campo 2026',
          price: null,
          description: 'Una revista trimestral de 96 páginas sobre paisaje, oficio y caminar. Identidad, dirección de arte y producción impresa por encargo.',
        },
        {
          name: 'Muestra tipográfica',
          price: null,
          description: 'Un libro numerado para una nueva familia serif, impreso a dos tintas sobre papel sin estucar.',
        },
        {
          name: 'Cartel de exposición',
          price: null,
          description: 'Una serie de carteles a tres colores para una pequeña exposición de fotografía en Copenhague.',
        },
      ],
    },
    {
      name: 'Objetos',
      subtitle: 'Muebles y vidrio',
      icon: 'chair',
      image: 'images/showcase/objects.svg',
      description: 'Series cortas fabricadas con talleres locales.',
      items: [
        {
          name: 'Banco de roble',
          price: null,
          description: 'Un banco de roble macizo para una sala de lectura, acabado con aceite de cera dura y pensado para repararse.',
        },
        {
          name: 'Serie de vidrio',
          price: null,
          description: 'Piezas sopladas a mano en tres tamaños, desarrolladas con un taller de Murano.',
        },
        {
          name: 'Vasija cerámica',
          price: null,
          description: 'Una vasija de colada limitada para el vestíbulo de un hotel, esmaltada en blanco mate cálido.',
        },
      ],
    },
    {
      name: 'Espacios',
      subtitle: 'Interiores e instalaciones',
      icon: 'meeting_room',
      image: 'images/showcase/spaces.svg',
      description: 'Salas serenas construidas en torno a la luz y a un solo material.',
      items: [
        {
          name: 'Galería de esquina',
          price: null,
          description: 'Una galería de 40 m² con pared móvil, cortinas de lino y un único banco de roble.',
        },
        {
          name: 'Sala de lectura',
          price: null,
          description: 'Una biblioteca y sala de lectura para una editorial, construida alrededor de las estanterías existentes y la luz natural.',
        },
        {
          name: 'Estudio con patio',
          price: null,
          description: 'Un estudio de trabajo y vivienda alrededor de un patio ajardinado, con cocina compacta y un escritorio largo.',
        },
      ],
    },
  ]),
};

const SERVICES: SitePreset = {
  id: 'services',
  label: 'Servicios',
  description: 'Servicios profesionales: capacidades, contacto del estudio y condiciones legales.',
  icon: 'support_agent',
  heroImage: 'images/sectors/services.svg',
  features: {
    prices: false,
    cart: false,
    checkout: false,
    auth: false,
    locations: true,
    about: true,
    promo: false,
    terms: true,
    reviews: false,
  },
  identity: identity({
    appName: 'Pulse Studio',
    shortName: 'Pulse',
    tagline: 'Diseño e ingeniería para equipos que crecen',
    description:
      'Un estudio de producto sénior para estrategia, diseño de interfaz e ingeniería web.',
    accentDark: '#5b8def',
    accentLight: '#2f5fce',
    storagePrefix: 'pulse-studio',
  }),
  content: {
    hero: {
      meta: 'Servicios · Proceso · Contacto',
      swipeHint: 'Desliza hacia arriba',
      enterLabel: 'Explorar los servicios',
    },
    promo: {
      label: 'Disponibilidad',
      detail: 'Dos proyectos abiertos para el próximo trimestre',
    },
    about: {
      title: 'Un estudio de producto para equipos que crecen',
      lead: 'Estrategia, diseño e ingeniería en un equipo pequeño y sénior.',
      paragraphs: [
        'Pulse Studio ayuda a los equipos a convertir una idea de producto clara en algo que la gente pueda usar. Trabajamos en encargos breves y enfocados: descubrir, diseñar, construir y entregar.',
        'Cada proyecto empieza con una sesión de trabajo y un alcance escrito. Trabajas directamente con quienes hacen el trabajo y te quedas con los archivos fuente, el sistema de diseño y la documentación.',
      ],
    },
    locations: [
      {
        id: 'location-1',
        eyebrow: 'Estudio',
        name: 'Pulse Studio',
        address: 'Carrer de la Indústria, 7',
        area: 'Poblenou',
        phone: '+34 910 000 404',
        hours: '09:30 - 18:00',
        hoursLabel: 'Lunes - viernes',
      },
    ],
    contact: {
      email: 'hello@pulsestudio.example',
      phone: '+34 910 000 404',
    },
    terms: standardTerms('Pulse Studio', 'octubre de 2026'),
  },
  catalog: catalog('services', [
    {
      name: 'Estrategia',
      subtitle: 'Encontrar el siguiente paso',
      icon: 'explore',
      image: 'images/services/strategy.svg',
      description: 'Encargos breves para aclarar el producto, el usuario y el primer lanzamiento.',
      items: [
        {
          name: 'Descubrimiento de producto',
          price: null,
          description: 'Dos semanas de entrevistas, mapas y una recomendación escrita para el primer lanzamiento.',
        },
        {
          name: 'Sprint de posicionamiento',
          price: null,
          description: 'Un taller de una semana para afinar la promesa, la audiencia y el lenguaje.',
        },
        {
          name: 'Revisión de hoja de ruta',
          price: null,
          description: 'Una lectura independiente del backlog, la secuencia y los riesgos antes de comprometerte.',
        },
      ],
    },
    {
      name: 'Diseño',
      subtitle: 'Interfaces que aguantan',
      icon: 'palette',
      image: 'images/services/design.svg',
      description: 'Desde los primeros flujos hasta un sistema de diseño documentado.',
      items: [
        {
          name: 'Diseño de interfaz',
          price: null,
          description: 'Diseño de producto de principio a fin para web y móvil, entregado como prototipo funcional.',
        },
        {
          name: 'Sistema de diseño',
          price: null,
          description: 'Tokens, componentes y reglas de uso que tu equipo puede ampliar sin nosotros.',
        },
        {
          name: 'Renovación de marca',
          price: null,
          description: 'Una actualización centrada en tipografía, color y voz, con una guía de uso compacta.',
        },
      ],
    },
    {
      name: 'Ingeniería',
      subtitle: 'Lanzar y seguir lanzando',
      icon: 'code',
      image: 'images/services/engineering.svg',
      description: 'Desarrollo front-end e integración sénior, con pruebas y documentación.',
      items: [
        {
          name: 'Aplicación web',
          price: null,
          description: 'Una aplicación Angular o React en producción, desde el esqueleto hasta el despliegue.',
        },
        {
          name: 'Integración de API',
          price: null,
          description: 'Conectamos la interfaz con tu backend, con contratos tipados y estados de error.',
        },
        {
          name: 'Auditoría de rendimiento',
          price: null,
          description: 'Una revisión medida de carga, renderizado y comportamiento sin conexión, con una lista de arreglos.',
        },
      ],
    },
    {
      name: 'Soporte',
      subtitle: 'Cerca después del lanzamiento',
      icon: 'support_agent',
      image: 'images/services/support.svg',
      description: 'Ayuda flexible para las semanas posteriores al lanzamiento.',
      items: [
        {
          name: 'Bolsa mensual',
          price: null,
          description: 'Un bloque fijo de diseño e ingeniería cada mes, con un backlog compartido.',
        },
        {
          name: 'Formación de equipo',
          price: null,
          description: 'Sesiones prácticas para tu equipo sobre el stack, el sistema de diseño y el proceso de entrega.',
        },
        {
          name: 'Revisión de accesibilidad',
          price: null,
          description: 'Una pasada con teclado y lector de pantalla, con arreglos priorizados y una nueva prueba.',
        },
      ],
    },
  ]),
};

const REAL_ESTATE: SitePreset = {
  id: 'real-estate',
  label: 'Inmobiliaria',
  description: 'Inmuebles con precios y solicitudes de visita, sin carrito.',
  icon: 'apartment',
  heroImage: 'images/sectors/real-estate.svg',
  features: {
    prices: true,
    cart: false,
    checkout: false,
    auth: false,
    locations: true,
    about: true,
    promo: false,
    terms: true,
    reviews: false,
  },
  identity: identity({
    appName: 'Habitat',
    shortName: 'Habitat',
    tagline: 'Casas con criterio',
    description:
      'Una colección de inmuebles en venta y alquiler, con visitas concertadas.',
    accentDark: '#c9a227',
    accentLight: '#8a6d0b',
    storagePrefix: 'habitat',
  }),
  content: {
    hero: {
      meta: 'Inmuebles · Visitas · Sin conexión',
      swipeHint: 'Desliza hacia arriba',
      enterLabel: 'Ver los inmuebles',
    },
    promo: {
      label: 'Semana de visitas',
      detail: 'Reserva una visita de lunes a jueves',
    },
    about: {
      title: 'Casas con criterio',
      lead: 'Una colección pequeña de lugares en los que viviríamos nosotros.',
      paragraphs: [
        'Habitat representa un número limitado de pisos, casas y terrenos. Visitamos cada propiedad, escribimos la descripción nosotros mismos y mantenemos una fotografía honesta.',
        'Las visitas son con cita previa. Abre un inmueble para ver el precio y escríbenos con la referencia; te responderemos con la disponibilidad y el dosier completo.',
      ],
    },
    locations: [
      {
        id: 'location-1',
        eyebrow: 'Oficina de ventas',
        name: 'Habitat Centre',
        address: 'Plaça del Mirador, 3',
        area: 'Centro de la ciudad',
        phone: '+34 910 000 505',
        hours: '09:00 - 19:00',
        hoursLabel: 'Lunes - viernes',
      },
      {
        id: 'location-2',
        eyebrow: 'Sala de visitas',
        name: 'Habitat Coast',
        address: 'Camí de la Costa, 21',
        area: 'Distrito costero',
        phone: '+34 910 000 506',
        hours: '10:00 - 18:00',
        hoursLabel: 'Sábado, con cita previa',
      },
    ],
    contact: {
      email: 'viewings@habitat.example',
      phone: '+34 910 000 505',
    },
    terms: standardTerms('Habitat', 'octubre de 2026'),
  },
  catalog: catalog('real-estate', [
    {
      name: 'Pisos',
      subtitle: 'Vida en la ciudad',
      icon: 'apartment',
      image: 'images/real-estate/apartments.svg',
      description: 'Pisos con luz, almacenaje y un plano claro del edificio.',
      items: [
        {
          name: 'Loft del puerto',
          price: 385000,
          description: 'Un loft en la última planta con una ventana de 6 m, un dormitorio y azotea compartida. Referencia H-101.',
        },
        {
          name: 'Piso con jardín',
          price: 265000,
          description: 'Dos dormitorios, jardín privado y acceso directo desde la calle. Referencia H-102.',
        },
        {
          name: 'Estudio urbano',
          price: 189000,
          description: 'Un estudio compacto con ventana de suelo a techo y cocina independiente. Referencia H-103.',
        },
      ],
    },
    {
      name: 'Casas',
      subtitle: 'Espacio para crecer',
      icon: 'house',
      image: 'images/real-estate/houses.svg',
      description: 'Casas fuera del centro, elegidas por su luz y una parcela aprovechable.',
      items: [
        {
          name: 'Casa de cedro',
          price: 540000,
          description: 'Tres dormitorios, una ampliación de madera y jardín orientado al sur. Referencia H-201.',
        },
        {
          name: 'Villa con patio',
          price: 720000,
          description: 'Cuatro dormitorios alrededor de un patio ajardinado, con estudio y aparcamiento cubierto. Referencia H-202.',
        },
        {
          name: 'Casa de ladera',
          price: 430000,
          description: 'Una casa restaurada con dos dormitorios, estufa de leña y vistas a la sierra. Referencia H-203.',
        },
      ],
    },
    {
      name: 'Terrenos',
      subtitle: 'Parcelas y fincas',
      icon: 'landscape',
      image: 'images/real-estate/land.svg',
      description: 'Parcelas con acceso, servicios y notas urbanísticas revisadas antes de publicar.',
      items: [
        {
          name: 'Parcela norte',
          price: 120000,
          description: 'Una parcela de 1.200 m² con acceso por carretera y agua en el límite. Referencia H-301.',
        },
        {
          name: 'Finca del huerto',
          price: 95000,
          description: 'Una parcela aterrazada con árboles frutales maduros y un pequeño cobertizo de piedra. Referencia H-302.',
        },
        {
          name: 'Solar costero',
          price: 210000,
          description: 'Un solar de 900 m² a poca distancia de la playa, con notas urbanísticas disponibles. Referencia H-303.',
        },
      ],
    },
  ]),
};

const MARKET: SitePreset = {
  id: 'market',
  label: 'Mercado',
  description: 'Compra completa de alimentación: precios, carrito, reparto y tiendas.',
  icon: 'shopping_basket',
  heroImage: 'images/sectors/market.svg',
  features: {
    prices: true,
    cart: true,
    checkout: true,
    auth: true,
    locations: true,
    about: true,
    promo: true,
    terms: true,
    reviews: true,
  },
  identity: identity({
    appName: 'Mercado Central',
    shortName: 'Mercado',
    tagline: 'Producto de mercado, a domicilio',
    description:
      'Fruta y verdura fresca, panadería y despensa de productores locales, con reparto semanal.',
    accentDark: '#f77f00',
    accentLight: '#d65a00',
    storagePrefix: 'mercado-central',
  }),
  content: {
    hero: {
      meta: 'Mercado · Reparto · Sin conexión',
      swipeHint: 'Desliza hacia arriba',
      enterLabel: 'Entrar en el mercado',
    },
    promo: {
      label: 'Cesta semanal',
      detail: 'Fruta y verdura de temporada, los viernes en tu casa',
    },
    about: {
      title: 'Producto de mercado de productores locales',
      lead: 'Fruta, pan y despensa con una cadena de suministro corta.',
      paragraphs: [
        'Mercado Central reúne a agricultores, panaderos y pequeños productores de toda la ciudad. Compramos en pequeñas cantidades, dos veces por semana, y publicamos lo que hay de verdad.',
        'Pide antes del jueves por la tarde para recibirlo el viernes o recoge en el puesto del mercado. El catálogo cambia con la temporada; si falta algo, probablemente esté entre cosechas.',
      ],
    },
    locations: [
      {
        id: 'location-1',
        eyebrow: 'Puesto de mercado',
        name: 'Central',
        address: 'Puesto 14, Mercat Central',
        area: 'Mercado central',
        phone: '+34 910 000 606',
        hours: '08:00 - 15:00',
        hoursLabel: 'Martes - sábado',
      },
      {
        id: 'location-2',
        eyebrow: 'Mostrador de panadería',
        name: 'Norte',
        address: 'Carrer del Forn, 19',
        area: 'Distrito norte',
        phone: '+34 910 000 607',
        hours: '07:30 - 14:00',
        hoursLabel: 'Miércoles - domingo',
      },
      {
        id: 'location-3',
        eyebrow: 'Centro de reparto',
        name: 'Ribera',
        address: 'Nau del Riu, 5',
        area: 'Polígono de la ribera',
        phone: '+34 910 000 608',
        hours: '09:00 - 18:00',
        hoursLabel: 'Lunes - viernes',
      },
    ],
    contact: {
      email: 'pedidos@mercadocentral.example',
      phone: '+34 910 000 606',
    },
    terms: standardTerms('Mercado Central', 'octubre de 2026'),
  },
  catalog: catalog('market', [
    {
      name: 'Fruta y verdura',
      subtitle: 'Recogida esta semana',
      icon: 'nutrition',
      image: 'images/market/fruit-veg.svg',
      description: 'Producto de temporada de agricultores de alrededor de la ciudad; las variedades cambian cada semana.',
      items: [
        { name: 'Cesta de temporada', price: 18 },
        { name: 'Tomates', price: 4.5 },
        { name: 'Mezcla de cítricos', price: 6 },
        { name: 'Calabacines', price: 3.4 },
        { name: 'Berenjenas', price: 3.8 },
        { name: 'Pimientos rojos', price: 4.2 },
        { name: 'Cebolletas', price: 2.4 },
        { name: 'Patatas nuevas', price: 3.6 },
        { name: 'Zanahorias', price: 2.8 },
        { name: 'Cogollos', price: 2.6 },
        { name: 'Espinacas', price: 3.2 },
        { name: 'Setas silvestres', price: 7.5 },
        { name: 'Manzanas', price: 3.9 },
        { name: 'Peras', price: 4.1 },
        { name: 'Naranjas', price: 4.6 },
        { name: 'Limones', price: 3.1 },
        { name: 'Aguacates', price: 5.2 },
        { name: 'Hierbas frescas', price: 2.2 },
      ],
    },
    {
      name: 'Panadería',
      subtitle: 'Horneado antes de amanecer',
      icon: 'bakery_dining',
      image: 'images/market/bakery.svg',
      description: 'Fermentación larga, harina local y una lista corta de ingredientes.',
      items: [
        { name: 'Hogaza de masa madre', price: 5.5 },
        { name: 'Croissant de mantequilla', price: 2.8 },
        { name: 'Crackers de semillas', price: 4.2 },
      ],
    },
    {
      name: 'Despensa',
      subtitle: 'Para que la cocina siga',
      icon: 'kitchen',
      image: 'images/market/pantry.svg',
      description: 'Productos básicos de pequeñas producciones, comprados directamente.',
      items: [
        { name: 'Aceite de oliva', price: 12.5 },
        { name: 'Miel de flores', price: 8 },
        { name: 'Conservas', price: 6.5 },
      ],
    },
    {
      name: 'Bebidas',
      subtitle: 'Frescas y listas',
      icon: 'local_drink',
      image: 'images/market/drinks.svg',
      description: 'Hechas cerca, entregadas frías y envasadas en vidrio retornable.',
      items: [
        { name: 'Café cold brew', price: 4 },
        { name: 'Kombucha', price: 3.8 },
        { name: 'Zumo de naranja', price: 4.5 },
      ],
    },
  ]),
};

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

export const SECTOR_PRESETS: Record<SectorPresetId, SitePreset> = {
  boutique: BOUTIQUE,
  menu: MENU,
  showcase: SHOWCASE,
  services: SERVICES,
  'real-estate': REAL_ESTATE,
  market: MARKET,
};

export const PRESET_SUMMARIES: PresetSummary[] = Object.values(SECTOR_PRESETS).map(
  (preset) => ({
    id: preset.id,
    label: preset.label,
    description: preset.description,
    icon: preset.icon,
  }),
);

/**
 * Replaces the preset's demo brand inside the editorial copy.
 *
 * Generated projects only set `BRAND_OVERRIDES.appName`, so copy such as
 * "Casa Verde cooks what the market gives us" would otherwise keep the demo
 * name. Contact details stay untouched on purpose: they identify the demo
 * mailbox/phone and are expected to be replaced by the project owner.
 */
function applyBrandCopy(content: SiteContent, from: string, to: string): SiteContent {
  if (!from || !to || from === to) {
    return content;
  }

  const swap = (text: string): string => text.split(from).join(to);

  return {
    ...content,
    hero: {
      meta: swap(content.hero.meta),
      swipeHint: swap(content.hero.swipeHint),
      enterLabel: swap(content.hero.enterLabel),
    },
    promo: {
      label: swap(content.promo.label),
      detail: swap(content.promo.detail),
    },
    about: {
      title: swap(content.about.title),
      lead: swap(content.about.lead),
      paragraphs: content.about.paragraphs.map(swap),
    },
    locations: content.locations.map((location) => ({
      ...location,
      eyebrow: swap(location.eyebrow),
      name: swap(location.name),
      address: swap(location.address),
      area: swap(location.area),
      hours: swap(location.hours),
      hoursLabel: location.hoursLabel ? swap(location.hoursLabel) : undefined,
    })),
    contact: { ...content.contact },
    terms: {
      ...content.terms,
      intro: swap(content.terms.intro),
      sections: content.terms.sections.map((section) => ({
        heading: swap(section.heading),
        body: swap(section.body),
      })),
    },
  };
}

/**
 * Resolves a preset plus optional brand overrides into the object the app reads.
 * Only the fields a project actually sets are replaced; everything else keeps
 * the preset defaults. The preset's demo brand name is also swapped out of the
 * editorial copy, so a generated project never mentions the demo brand.
 */
export function resolveSiteConfig(
  presetId: SectorPresetId,
  overrides: BrandOverrides,
  demoMode: boolean,
): SiteConfig {
  const preset = SECTOR_PRESETS[presetId];
  const identity: SiteIdentity = { ...preset.identity, ...overrides };
  const content = applyBrandCopy(
    preset.content,
    preset.identity.appName,
    identity.appName,
  );

  return {
    preset: preset.id,
    demoMode,
    heroImage: preset.heroImage,
    identity,
    features: { ...preset.features },
    content,
    catalog: preset.catalog,
  };
}
