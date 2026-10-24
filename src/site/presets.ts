import type { CatalogCategory, CatalogItem } from '../app/models/catalog';
import type {
  BrandOverrides,
  PresetSummary,
  SiteConfig,
  SiteIdentity,
  SitePreset,
  SiteTerms,
  SectorPresetId,
} from './site.types';

/**
 * Bundled sector presets.
 *
 * All demo copy is in English on purpose: the template code is English, the
 * documentation is Spanish. A generated project replaces the identity through
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
  items: CatalogEntry[];
}

function catalog(prefix: string, groups: CatalogGroup[]): CatalogCategory[] {
  return groups.map((group, groupIndex) => {
    const image = `images/catalog-${(groupIndex % 4) + 1}.svg`;
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
  appName: 'App Skeleton',
  shortName: 'Skeleton',
  tagline: 'Generic commerce template',
  description:
    'A mobile-first PWA template for any commercial sector: catalog, cart, checkout, roles and offline support.',
  lang: 'en',
  locale: 'en-US',
  currency: 'EUR',
  version: '1.1.0',
  themeColorDark: '#050505',
  themeColorLight: '#f2f2f7',
  backgroundColor: '#050505',
  storagePrefix: 'app-skeleton',
  accentDark: '#0a84ff',
  accentLight: '#007aff',
};

function identity(overrides: Partial<SiteIdentity>): SiteIdentity {
  return { ...BASE_IDENTITY, ...overrides };
}

function standardTerms(entity: string, updated: string): SiteTerms {
  return {
    title: 'Terms & Conditions',
    intro: `These terms apply to ${entity} and to every request or order placed through this app.`,
    sections: [
      {
        heading: 'Using the service',
        body: 'Use the catalog for personal, non-commercial purposes. Availability, descriptions and imagery may change without notice.',
      },
      {
        heading: 'Prices and payment',
        body: 'Prices are shown in the configured currency and include applicable taxes unless stated otherwise. Payment is confirmed before preparation or delivery begins.',
      },
      {
        heading: 'Cancellations and returns',
        body: 'Contact us as soon as possible if something is wrong with a request. Perishable goods and custom work may not be eligible for a return.',
      },
      {
        heading: 'Privacy',
        body: 'We only store the details needed to answer a request or fulfil an order. This demo keeps that information in the browser and sends nothing to a server.',
      },
    ],
    updated: `Last updated: ${updated}`,
  };
}

/* ------------------------------------------------------------------ */
/* Presets                                                             */
/* ------------------------------------------------------------------ */

const BOUTIQUE: SitePreset = {
  id: 'boutique',
  label: 'Boutique',
  description: 'Full commerce for a small shop: prices, cart, checkout and stores.',
  icon: 'storefront',
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
    tagline: 'Objects for slow living',
    description:
      'A curated boutique for ceramics, textiles, lighting and paper, with local delivery and in-store pickup.',
    accentDark: '#d4a373',
    accentLight: '#9c6644',
    storagePrefix: 'maison-lumiere',
  }),
  content: {
    hero: {
      meta: 'Catalog · Cart · Offline',
      swipeHint: 'Swipe up',
      enterLabel: 'Enter the boutique catalog',
    },
    promo: {
      label: 'Autumn edit',
      detail: 'Free local delivery on orders over €80',
    },
    about: {
      title: 'A small studio for enduring objects',
      lead: 'We work with makers who care about material, repair and time.',
      paragraphs: [
        'Maison Lumière began as a weekend market stall and grew into a quiet shop for pieces that are meant to be used every day. Every object is chosen in person, in small quantities.',
        'We repair what we sell, keep the packaging simple and publish the materials of each piece in the catalog. If you need a hand choosing, write to us: we answer every message.',
      ],
    },
    locations: [
      {
        id: 'location-1',
        eyebrow: 'Flagship',
        name: 'Downtown',
        address: '12 Carrer de la Llum',
        area: 'Old quarter',
        phone: '+34 910 000 101',
        hours: '10:00 - 20:00',
        hoursLabel: 'Monday - Saturday',
      },
      {
        id: 'location-2',
        eyebrow: 'Studio',
        name: 'Riverside',
        address: '48 Passeig del Riu',
        area: 'Riverside workshops',
        phone: '+34 910 000 102',
        hours: '11:00 - 19:00',
        hoursLabel: 'Tuesday - Saturday',
      },
      {
        id: 'location-3',
        eyebrow: 'Pop-up',
        name: 'Harbour',
        address: '8 Moll de la Marina',
        area: 'Seafront promenade',
        phone: '+34 910 000 103',
        hours: '11:00 - 21:00',
        hoursLabel: 'Friday - Sunday',
      },
    ],
    contact: {
      email: 'hello@maisonlumiere.example',
      phone: '+34 910 000 101',
    },
    terms: standardTerms('Maison Lumière', 'October 2026'),
  },
  catalog: catalog('boutique', [
    {
      name: 'Ceramics',
      subtitle: 'Hand-thrown stoneware',
      icon: 'coffee',
      description: 'Speckled glaze, fired in small batches and safe for daily use.',
      items: [
        { name: 'Stoneware mug', price: 24 },
        { name: 'Serving bowl', price: 38 },
        { name: 'Pour-over set', price: 62 },
      ],
    },
    {
      name: 'Textiles',
      subtitle: 'Washed linen and wool',
      icon: 'bed',
      description: 'Woven in Portugal, softened with every wash and easy to mend.',
      items: [
        { name: 'Linen throw', price: 89 },
        { name: 'Cushion cover', price: 42 },
        { name: 'Wool runner', price: 76 },
      ],
    },
    {
      name: 'Lighting',
      subtitle: 'Warm, low light',
      icon: 'light_mode',
      description: 'Dimmable fixtures with replaceable bulbs and repairable cable.',
      items: [
        { name: 'Paper pendant', price: 120 },
        { name: 'Table lamp', price: 148 },
        { name: 'Candle holder', price: 34 },
      ],
    },
    {
      name: 'Paper',
      subtitle: 'Notes and small gifts',
      icon: 'menu_book',
      description: 'Printed on recycled stock by a family-run press.',
      items: [
        { name: 'Cloth notebook', price: 18 },
        { name: 'Desk calendar', price: 22 },
        { name: 'Gift wrap set', price: 12 },
      ],
    },
  ]),
};

const MENU: SitePreset = {
  id: 'menu',
  label: 'Menu',
  description: 'Restaurant or cafe: dishes, prices, pickup orders and one location.',
  icon: 'restaurant',
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
    tagline: 'Seasonal kitchen, all day',
    description:
      'A neighborhood kitchen with a seasonal menu, natural wine and pickup orders.',
    accentDark: '#7cb518',
    accentLight: '#4f772d',
    storagePrefix: 'casa-verde',
  }),
  content: {
    hero: {
      meta: 'Menu · Pickup · Offline',
      swipeHint: 'Swipe up',
      enterLabel: 'Open the menu',
    },
    promo: {
      label: "Today's special",
      detail: 'Roast chicken with market greens · €16',
    },
    about: {
      title: 'A neighborhood kitchen',
      lead: 'Seasonal plates, natural wine and a counter to linger at.',
      paragraphs: [
        'Casa Verde cooks what the market gives us. The menu changes every few weeks, and the small plates are designed to be shared around the table.',
        'Order for pickup from this app or come by without a reservation. We keep a few stools free for coffee and a slice of whatever came out of the oven that morning.',
      ],
    },
    locations: [
      {
        id: 'location-1',
        eyebrow: 'Kitchen',
        name: 'Casa Verde',
        address: '24 Carrer del Mercat',
        area: 'Market square',
        phone: '+34 910 000 202',
        hours: '09:00 - 23:00',
        hoursLabel: 'Tuesday - Sunday',
      },
    ],
    contact: {
      email: 'hola@casaverde.example',
      phone: '+34 910 000 202',
    },
    terms: standardTerms('Casa Verde', 'October 2026'),
  },
  catalog: catalog('menu', [
    {
      name: 'Breakfast',
      subtitle: 'Served until 11:30',
      icon: 'breakfast_dining',
      description: 'Baked that morning and served with coffee or tea.',
      items: [
        { name: 'Sourdough toast', price: 6.5 },
        { name: 'Seasonal bowl', price: 9.5 },
        { name: 'Soft eggs', price: 8 },
      ],
    },
    {
      name: 'Small plates',
      subtitle: 'Made to share',
      icon: 'tapas',
      description: 'Bright, salty and easy to pass around the table.',
      items: [
        { name: 'Olives & citrus', price: 4.5 },
        { name: 'Grilled bread', price: 5.5 },
        { name: 'Market salad', price: 8.5 },
      ],
    },
    {
      name: 'Mains',
      subtitle: 'From the wood oven',
      icon: 'lunch_dining',
      description: 'Cooked to order; ask the team about allergens.',
      items: [
        { name: 'Roast chicken', price: 16 },
        { name: 'Mushroom pasta', price: 14.5 },
        { name: 'Catch of the day', price: 18 },
      ],
    },
    {
      name: 'Drinks',
      subtitle: 'Coffee, wine and soft drinks',
      icon: 'local_cafe',
      description: 'Small producers, low intervention and plenty of ice.',
      items: [
        { name: 'Filter coffee', price: 3.2 },
        { name: 'House lemonade', price: 4 },
        { name: 'Natural wine', price: 6.5 },
      ],
    },
  ]),
};

const SHOWCASE: SitePreset = {
  id: 'showcase',
  label: 'Showcase',
  description: 'Image and information only: no prices, cart or checkout.',
  icon: 'palette',
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
    tagline: 'Print, objects and spaces',
    description:
      'Selected work from an independent design studio: print, objects and interiors.',
    accentDark: '#f2a65a',
    accentLight: '#c46d1f',
    storagePrefix: 'atelier-north',
  }),
  content: {
    hero: {
      meta: 'Work · Studio · Contact',
      swipeHint: 'Swipe up',
      enterLabel: 'Enter the showcase',
    },
    promo: {
      label: 'Open studio',
      detail: 'Visit us on the first Friday of every month',
    },
    about: {
      title: 'Independent design studio',
      lead: 'Print, objects and spaces made with a quiet point of view.',
      paragraphs: [
        'Atelier North is a two-person studio working across identity, editorial design and small interiors. We take on a handful of projects each year and stay close to the making.',
        'This catalog is a selection of recent work. Open any piece to read the brief; write to us if you would like to see the full case study or talk about a project.',
      ],
    },
    locations: [],
    contact: {
      email: 'studio@ateliernorth.example',
      phone: '+44 20 0000 3030',
    },
    terms: standardTerms('Atelier North', 'October 2026'),
  },
  catalog: catalog('showcase', [
    {
      name: 'Print',
      subtitle: 'Editorial and identity',
      icon: 'print',
      description: 'A quarterly journal, a type specimen and an exhibition poster.',
      items: [
        {
          name: 'Field Notes 2026',
          price: null,
          description: 'A 96-page quarterly on landscape, craft and walking. Commissioned identity, art direction and print production.',
        },
        {
          name: 'Type Specimen',
          price: null,
          description: 'A numbered specimen book for a new serif family, printed in two inks on uncoated stock.',
        },
        {
          name: 'Exhibition Poster',
          price: null,
          description: 'A three-colour poster series for a small photography exhibition in Copenhagen.',
        },
      ],
    },
    {
      name: 'Objects',
      subtitle: 'Furniture and glass',
      icon: 'chair',
      description: 'Small runs made with local workshops.',
      items: [
        {
          name: 'Oak Bench',
          price: null,
          description: 'A solid oak bench for a reading room, finished with hard wax oil and designed to be repaired.',
        },
        {
          name: 'Glass Series',
          price: null,
          description: 'Hand-blown vessels in three sizes, developed with a studio in Murano.',
        },
        {
          name: 'Ceramic Vessel',
          price: null,
          description: 'A limited slip-cast vessel for a hotel lobby, glazed in a warm matte white.',
        },
      ],
    },
    {
      name: 'Spaces',
      subtitle: 'Interiors and installations',
      icon: 'meeting_room',
      description: 'Quiet rooms built around light and a single material.',
      items: [
        {
          name: 'Corner Gallery',
          price: null,
          description: 'A 40 m² gallery with a movable wall, linen curtains and a single oak bench.',
        },
        {
          name: 'Reading Room',
          price: null,
          description: 'A library and reading room for a publisher, built around existing shelves and daylight.',
        },
        {
          name: 'Courtyard Studio',
          price: null,
          description: 'A live-work studio around a planted courtyard, with a compact kitchen and a long desk.',
        },
      ],
    },
  ]),
};

const SERVICES: SitePreset = {
  id: 'services',
  label: 'Services',
  description: 'Professional services: capabilities, studio contact and legal terms.',
  icon: 'support_agent',
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
    tagline: 'Design and engineering for growing teams',
    description:
      'A senior product studio for strategy, interface design and web engineering.',
    accentDark: '#5b8def',
    accentLight: '#2f5fce',
    storagePrefix: 'pulse-studio',
  }),
  content: {
    hero: {
      meta: 'Services · Process · Contact',
      swipeHint: 'Swipe up',
      enterLabel: 'Explore the services',
    },
    promo: {
      label: 'Availability',
      detail: 'Two project slots open for the next quarter',
    },
    about: {
      title: 'A product studio for growing teams',
      lead: 'Strategy, design and engineering in one small senior team.',
      paragraphs: [
        'Pulse Studio helps teams turn a clear product idea into something people can use. We work in short, focused engagements: discover, design, build, then hand over.',
        'Every project starts with a working session and a written scope. You work directly with the people doing the work, and you keep the source files, the design system and the documentation.',
      ],
    },
    locations: [
      {
        id: 'location-1',
        eyebrow: 'Studio',
        name: 'Pulse Studio',
        address: '7 Carrer de la Indústria',
        area: 'Poblenou',
        phone: '+34 910 000 404',
        hours: '09:30 - 18:00',
        hoursLabel: 'Monday - Friday',
      },
    ],
    contact: {
      email: 'hello@pulsestudio.example',
      phone: '+34 910 000 404',
    },
    terms: standardTerms('Pulse Studio', 'October 2026'),
  },
  catalog: catalog('services', [
    {
      name: 'Strategy',
      subtitle: 'Find the next move',
      icon: 'explore',
      description: 'Short engagements to clarify the product, the user and the first release.',
      items: [
        {
          name: 'Product discovery',
          price: null,
          description: 'Two weeks of interviews, mapping and a written recommendation for the first release.',
        },
        {
          name: 'Positioning sprint',
          price: null,
          description: 'A one-week workshop to sharpen the promise, the audience and the language.',
        },
        {
          name: 'Roadmap review',
          price: null,
          description: 'An independent read of the backlog, the sequence and the risks before you commit.',
        },
      ],
    },
    {
      name: 'Design',
      subtitle: 'Interfaces that hold up',
      icon: 'palette',
      description: 'From first flows to a documented design system.',
      items: [
        {
          name: 'Interface design',
          price: null,
          description: 'End-to-end product design for web and mobile, delivered as a working prototype.',
        },
        {
          name: 'Design system',
          price: null,
          description: 'Tokens, components and usage rules your team can extend without us.',
        },
        {
          name: 'Brand refresh',
          price: null,
          description: 'A focused update to type, colour and voice, with a compact usage guide.',
        },
      ],
    },
    {
      name: 'Engineering',
      subtitle: 'Ship and keep shipping',
      icon: 'code',
      description: 'Senior front-end and integration work, with tests and documentation.',
      items: [
        {
          name: 'Web application',
          price: null,
          description: 'A production Angular or React application, from scaffold to deploy.',
        },
        {
          name: 'API integration',
          price: null,
          description: 'Connect the interface to your backend, with typed contracts and error states.',
        },
        {
          name: 'Performance audit',
          price: null,
          description: 'A measured review of load, rendering and offline behaviour, with a fix list.',
        },
      ],
    },
    {
      name: 'Support',
      subtitle: 'Stay close after launch',
      icon: 'support_agent',
      description: 'Flexible help for the weeks after release.',
      items: [
        {
          name: 'Monthly retainer',
          price: null,
          description: 'A fixed block of design and engineering time each month, with a shared backlog.',
        },
        {
          name: 'Team training',
          price: null,
          description: 'Hands-on sessions for your team on the stack, the design system and the release process.',
        },
        {
          name: 'Accessibility review',
          price: null,
          description: 'A keyboard and screen-reader pass, with prioritised fixes and a re-test.',
        },
      ],
    },
  ]),
};

const REAL_ESTATE: SitePreset = {
  id: 'real-estate',
  label: 'Real estate',
  description: 'Listings with prices and enquiry actions, but no cart.',
  icon: 'apartment',
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
    tagline: 'Homes with a point of view',
    description:
      'A property collection for sale and rent, with viewings by appointment.',
    accentDark: '#c9a227',
    accentLight: '#8a6d0b',
    storagePrefix: 'habitat',
  }),
  content: {
    hero: {
      meta: 'Listings · Viewings · Offline',
      swipeHint: 'Swipe up',
      enterLabel: 'Browse the listings',
    },
    promo: {
      label: 'Viewing week',
      detail: 'Book a visit from Monday to Thursday',
    },
    about: {
      title: 'Homes with a point of view',
      lead: 'A small collection of places we would live in ourselves.',
      paragraphs: [
        'Habitat represents a limited number of apartments, houses and plots. We visit every property, write the description ourselves and keep the photography honest.',
        'Viewings are by appointment. Open a listing to see the asking price and write to us with the reference; we will reply with availability and the full dossier.',
      ],
    },
    locations: [
      {
        id: 'location-1',
        eyebrow: 'Sales office',
        name: 'Habitat Centre',
        address: '3 Plaça del Mirador',
        area: 'City centre',
        phone: '+34 910 000 505',
        hours: '09:00 - 19:00',
        hoursLabel: 'Monday - Friday',
      },
      {
        id: 'location-2',
        eyebrow: 'Viewing room',
        name: 'Habitat Coast',
        address: '21 Camí de la Costa',
        area: 'Coastal district',
        phone: '+34 910 000 506',
        hours: '10:00 - 18:00',
        hoursLabel: 'Saturday by appointment',
      },
    ],
    contact: {
      email: 'viewings@habitat.example',
      phone: '+34 910 000 505',
    },
    terms: standardTerms('Habitat', 'October 2026'),
  },
  catalog: catalog('real-estate', [
    {
      name: 'Apartments',
      subtitle: 'City living',
      icon: 'apartment',
      description: 'Apartments with daylight, storage and a clear plan of the building.',
      items: [
        {
          name: 'Harbour Loft',
          price: 385000,
          description: 'A top-floor loft with a 6 m window, one bedroom and a shared roof terrace. Reference H-101.',
        },
        {
          name: 'Garden Flat',
          price: 265000,
          description: 'Two bedrooms, a private garden and direct access from the street. Reference H-102.',
        },
        {
          name: 'City Studio',
          price: 189000,
          description: 'A compact studio with a full-height window and a separate kitchen. Reference H-103.',
        },
      ],
    },
    {
      name: 'Houses',
      subtitle: 'Space to grow',
      icon: 'house',
      description: 'Houses outside the centre, chosen for light and a usable plot.',
      items: [
        {
          name: 'Cedar House',
          price: 540000,
          description: 'Three bedrooms, a timber extension and a south-facing garden. Reference H-201.',
        },
        {
          name: 'Courtyard Villa',
          price: 720000,
          description: 'Four bedrooms around a planted courtyard, with a studio and covered parking. Reference H-202.',
        },
        {
          name: 'Hillside Cottage',
          price: 430000,
          description: 'A restored cottage with two bedrooms, a wood stove and views to the ridge. Reference H-203.',
        },
      ],
    },
    {
      name: 'Land',
      subtitle: 'Plots and parcels',
      icon: 'landscape',
      description: 'Plots with access, services and planning notes checked before listing.',
      items: [
        {
          name: 'North Plot',
          price: 120000,
          description: 'A 1,200 m² plot with road access and water at the boundary. Reference H-301.',
        },
        {
          name: 'Orchard Parcel',
          price: 95000,
          description: 'A terraced parcel with mature fruit trees and a small stone shed. Reference H-302.',
        },
        {
          name: 'Coastal Lot',
          price: 210000,
          description: 'A 900 m² lot within walking distance of the beach, with planning notes available. Reference H-303.',
        },
      ],
    },
  ]),
};

const MARKET: SitePreset = {
  id: 'market',
  label: 'Market',
  description: 'Full grocery commerce: prices, cart, delivery slots and stores.',
  icon: 'shopping_basket',
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
    tagline: 'Market goods, delivered',
    description:
      'Fresh produce, bakery and pantry staples from local makers, with weekly delivery.',
    accentDark: '#f77f00',
    accentLight: '#d65a00',
    storagePrefix: 'mercado-central',
  }),
  content: {
    hero: {
      meta: 'Market · Delivery · Offline',
      swipeHint: 'Swipe up',
      enterLabel: 'Enter the market',
    },
    promo: {
      label: 'Weekly box',
      detail: 'Seasonal fruit and veg, delivered on Fridays',
    },
    about: {
      title: 'Market goods from local makers',
      lead: 'Produce, bread and pantry staples with a short supply chain.',
      paragraphs: [
        'Mercado Central brings together growers, bakers and small food makers from around the city. We buy in small quantities, twice a week, and list what is actually available.',
        'Order before Thursday evening for Friday delivery, or collect from the market stall. The catalog changes with the season; if something is missing, it is probably between harvests.',
      ],
    },
    locations: [
      {
        id: 'location-1',
        eyebrow: 'Market stall',
        name: 'Central',
        address: 'Stall 14, Mercat Central',
        area: 'Market hall',
        phone: '+34 910 000 606',
        hours: '08:00 - 15:00',
        hoursLabel: 'Tuesday - Saturday',
      },
      {
        id: 'location-2',
        eyebrow: 'Bakery counter',
        name: 'North',
        address: '19 Carrer del Forn',
        area: 'North district',
        phone: '+34 910 000 607',
        hours: '07:30 - 14:00',
        hoursLabel: 'Wednesday - Sunday',
      },
      {
        id: 'location-3',
        eyebrow: 'Delivery hub',
        name: 'Riverside',
        address: '5 Nau del Riu',
        area: 'Riverside industrial',
        phone: '+34 910 000 608',
        hours: '09:00 - 18:00',
        hoursLabel: 'Monday - Friday',
      },
    ],
    contact: {
      email: 'pedidos@mercadocentral.example',
      phone: '+34 910 000 606',
    },
    terms: standardTerms('Mercado Central', 'October 2026'),
  },
  catalog: catalog('market', [
    {
      name: 'Fruit & veg',
      subtitle: 'Picked this week',
      icon: 'nutrition',
      description: 'Seasonal produce from growers around the city; varieties change weekly.',
      items: [
        { name: 'Seasonal box', price: 18 },
        { name: 'Tomatoes', price: 4.5 },
        { name: 'Citrus mix', price: 6 },
      ],
    },
    {
      name: 'Bakery',
      subtitle: 'Baked before sunrise',
      icon: 'bakery_dining',
      description: 'Long fermentation, local flour and a short list of ingredients.',
      items: [
        { name: 'Sourdough loaf', price: 5.5 },
        { name: 'Butter croissant', price: 2.8 },
        { name: 'Seed crackers', price: 4.2 },
      ],
    },
    {
      name: 'Pantry',
      subtitle: 'Keeps the kitchen going',
      icon: 'kitchen',
      description: 'Small-batch staples from makers we buy from directly.',
      items: [
        { name: 'Olive oil', price: 12.5 },
        { name: 'Wildflower honey', price: 8 },
        { name: 'Preserves', price: 6.5 },
      ],
    },
    {
      name: 'Drinks',
      subtitle: 'Cold and ready',
      icon: 'local_drink',
      description: 'Made nearby, delivered chilled and packed in returnable glass.',
      items: [
        { name: 'Cold brew', price: 4 },
        { name: 'Kombucha', price: 3.8 },
        { name: 'Orange juice', price: 4.5 },
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
 * Resolves a preset plus optional brand overrides into the object the app reads.
 * Only the fields a project actually sets are replaced; everything else keeps
 * the preset defaults.
 */
export function resolveSiteConfig(
  presetId: SectorPresetId,
  overrides: BrandOverrides,
  demoMode: boolean,
): SiteConfig {
  const preset = SECTOR_PRESETS[presetId];
  const identity: SiteIdentity = { ...preset.identity, ...overrides };

  return {
    preset: preset.id,
    demoMode,
    identity,
    features: { ...preset.features },
    content: preset.content,
    catalog: preset.catalog,
  };
}
