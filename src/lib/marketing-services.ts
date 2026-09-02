export type MarketingServiceSlug =
  | 'custom-furniture'
  | 'modular-kitchen'
  | 'wardrobes'
  | 'pvc-furniture'
  | 'tv-units'
  | 'bedroom-furniture'
  | 'office-furniture'
  | 'home-interiors';

export type MarketingService = {
  slug: MarketingServiceSlug;
  name: string;
  shortName: string;
  h1: string;
  title: string;
  description: string;
  image: string;
  intro: string;
  benefits: string[];
  materials: string[];
  designProcess: string[];
  manufacturingProcess: string[];
  installation: string;
  warranty: string;
  faqs: { question: string; answer: string }[];
  whatsappMessage: string;
  relatedSlugs: MarketingServiceSlug[];
};

export const marketingServices: MarketingService[] = [
  {
    slug: 'custom-furniture',
    name: 'Custom Furniture',
    shortName: 'Custom Furniture',
    h1: 'Custom Furniture in Mumbai, Navi Mumbai & Thane',
    title:
      'Custom Furniture in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Custom-made furniture for Mumbai, Navi Mumbai & Thane homes. Free site visit, 3D design consultation, in-house manufacturing and professional installation.',
    image: '/images/service-1.png',
    intro:
      'Ananya House of Furniture designs and manufactures made-to-measure furniture for apartments, houses and commercial spaces across Mumbai, Navi Mumbai and Thane — with service also available in Ahmedabad (Bopal). Every piece is planned around your room size, storage needs and daily use, then built in our own workshop.',
    benefits: [
      'Made to your exact dimensions and layout',
      'Free site visit and 3D design consultation',
      'In-house manufacturing — clearer quality control',
      'Factory-direct pricing without middlemen',
      'Delivery and installation handled by our team',
    ],
    materials: [
      'Plywood / blockboard carcass options',
      'Laminate, acrylic and veneer finishes',
      'Hardware: soft-close hinges and channels',
      'Solid wood accents where the design needs them',
    ],
    designProcess: [
      'Share your requirement on WhatsApp, call or the contact form',
      'We visit your site, measure and discuss usage',
      'You receive a 3D design concept for approval',
      'Material, colour and hardware selections are locked',
    ],
    manufacturingProcess: [
      'Cutting and edge banding in our workshop',
      'Assembly and finish checks before dispatch',
      'Packing for safe transport to your home',
    ],
    installation:
      'Our installation team delivers, assembles and positions your furniture. We clear packaging waste after the job so the room is ready to use.',
    warranty:
      'Manufacturing defects are covered under our 5-year warranty. Wear-and-tear, misuse and water damage are excluded — we explain coverage clearly before you confirm.',
    faqs: [
      {
        question: 'How long does custom furniture take?',
        answer:
          'Timelines depend on scope. Many single-room projects finish in about 15–30 days after design approval. We confirm a schedule during consultation.',
      },
      {
        question: 'Do you only work in Mumbai?',
        answer:
          'Our primary service area is Mumbai, Navi Mumbai and Thane. We also serve Ahmedabad (Bopal). Ask us if your site is nearby — we will confirm coverage honestly.',
      },
      {
        question: 'Is the 3D design really free?',
        answer:
          'Yes. We offer a free site visit and 3D design consultation for serious project enquiries so you can see the plan before manufacturing.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in custom furniture. Please contact me for a free consultation.',
    relatedSlugs: ['modular-kitchen', 'wardrobes', 'home-interiors'],
  },
  {
    slug: 'modular-kitchen',
    name: 'Modular Kitchen',
    shortName: 'Modular Kitchen',
    h1: 'Modular Kitchens in Mumbai, Navi Mumbai & Thane',
    title:
      'Modular Kitchen in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Modular kitchen design and installation for Mumbai, Navi Mumbai & Thane. Free site visit, 3D layout, durable materials and professional fitting.',
    image: '/images/kitchen.jpeg',
    intro:
      'We plan modular kitchens around how you cook and store — not just how the showroom looks. From compact 1BHK L-shapes to larger U-shaped and parallel kitchens, we design for Mumbai and Navi Mumbai apartment constraints and Thane home layouts.',
    benefits: [
      'Layouts planned for your wall lengths and plumbing',
      'Soft-close shutters and organised storage',
      'Countertop and finish options explained clearly',
      '3D preview before manufacturing',
      'Installed by our team with cleanup',
    ],
    materials: [
      'Moisture-resistant plywood / BWP options where needed',
      'Laminate, acrylic and membrane shutters',
      'Granite / quartz countertop coordination',
      'Basket systems, tandem boxes and bottle pull-outs',
    ],
    designProcess: [
      'Site measure: walls, windows, chimney and plumbing points',
      'Workflow planning (cooking, washing, storage)',
      '3D design and quotation',
      'Final finish selection',
    ],
    manufacturingProcess: [
      'Carcass and shutter production in-house',
      'Hardware fitting and alignment checks',
      'On-site installation of base and wall units',
    ],
    installation:
      'We coordinate chimney, sink and appliance clearances during design so installation day is smoother. Final alignment and soft-close checks are done on site.',
    warranty:
      'Carcass and manufacturing defects are covered under our 5-year warranty policy. Hardware warranty follows manufacturer terms where applicable.',
    faqs: [
      {
        question: 'What is the cost of a modular kitchen in Mumbai?',
        answer:
          'Cost depends on size, material grade, hardware and accessories. After a site visit we share a clear quotation — we do not publish a one-size price because every kitchen footprint differs.',
      },
      {
        question: 'Can you work in small Mumbai apartments?',
        answer:
          'Yes. Many of our kitchens are for compact flats. We focus on storage, chimney placement and circulation so the kitchen stays usable.',
      },
      {
        question: 'Do you provide a free 3D design?',
        answer:
          'Yes — free site visit and 3D design consultation for modular kitchen projects in our service areas.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in a modular kitchen. I would like a free 3D design and site visit.',
    relatedSlugs: ['custom-furniture', 'wardrobes', 'home-interiors'],
  },
  {
    slug: 'wardrobes',
    name: 'Wardrobes',
    shortName: 'Wardrobes',
    h1: 'Custom Wardrobes in Mumbai, Navi Mumbai & Thane',
    title:
      'Custom Wardrobes in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Sliding and hinged wardrobes for Mumbai, Navi Mumbai & Thane homes. Space-efficient interiors, free site visit and 3D design consultation.',
    image: '/images/wardrobe.jpeg',
    intro:
      'Custom wardrobes help Mumbai and Thane bedrooms use every inch — loft storage, sliding shutters for tight clearances, and internal layouts for clothes, bags and linen. We design hinged or sliding systems based on your room.',
    benefits: [
      'Internal layout planned for your clothing volume',
      'Sliding options for rooms with limited door swing',
      'Loft and full-height options where ceiling allows',
      'Mirror, laminate and acrylic finish choices',
      'Free consultation and site measure',
    ],
    materials: [
      'Plywood / engineered board carcass',
      'Laminate and acrylic shutters',
      'Soft-close hinges / quality sliding channels',
      'Accessories: drawers, tie racks, pull-out trays',
    ],
    designProcess: [
      'Bedroom measure and door swing check',
      'Internal zoning (hang, fold, drawers)',
      '3D elevation for approval',
      'Colour and handle selection',
    ],
    manufacturingProcess: [
      'Panel cutting and edge finishing',
      'Carcass assembly and shutter fabrication',
      'On-site fixing, leveling and accessory fitment',
    ],
    installation:
      'Wardrobes are leveled and fixed securely. Sliding tracks and soft-close mechanisms are adjusted on site for smooth daily use.',
    warranty:
      'Manufacturing defects covered under our 5-year warranty. Sliding channel and hardware follow applicable manufacturer coverage.',
    faqs: [
      {
        question: 'Sliding or hinged — which is better?',
        answer:
          'Hinged wardrobes often give fuller access; sliding suits narrow rooms. We recommend after measuring your bedroom clearances.',
      },
      {
        question: 'Can you do wardrobes for small bedrooms?',
        answer:
          'Yes. We regularly design for compact 1BHK and 2BHK bedrooms in Mumbai, Navi Mumbai and Thane.',
      },
      {
        question: 'Do you include loft storage?',
        answer:
          'Where ceiling height and structure allow, loft storage is a common request — we confirm during site visit.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in a custom wardrobe. I would like a free consultation.',
    relatedSlugs: ['bedroom-furniture', 'modular-kitchen', 'custom-furniture'],
  },
  {
    slug: 'pvc-furniture',
    name: 'PVC Furniture',
    shortName: 'PVC Furniture',
    h1: 'PVC Furniture for Homes & Commercial Spaces',
    title:
      'PVC Furniture in Mumbai & Ahmedabad | Ananya House of Furniture',
    description:
      'PVC furniture and cabinetry for moisture-prone areas. Available for Mumbai region projects and our Ahmedabad (Bopal) branch — free consultation.',
    image: '/images/service-2.png',
    intro:
      'PVC furniture is useful where moisture resistance and easy cleaning matter — kitchens, wash areas and certain commercial interiors. Our Ahmedabad (Bopal) branch particularly focuses on PVC work suited to Gujarat climate needs, while Mumbai-region customers can enquire for project suitability.',
    benefits: [
      'Better resistance to moisture vs standard untreated boards',
      'Smooth finishes that are easy to wipe clean',
      'Useful for select kitchen and storage applications',
      'Custom sizes based on site measure',
      'Guidance on when PVC vs plywood is the better choice',
    ],
    materials: [
      'PVC foam board / WPC options as per application',
      'Compatible hardware and edge treatments',
      'Finish choices suited to wet-area use cases',
    ],
    designProcess: [
      'Discuss room use and humidity conditions',
      'Site measure and application check',
      'Material recommendation (PVC vs plywood)',
      'Design approval and quotation',
    ],
    manufacturingProcess: [
      'Cutting and fabrication to drawing',
      'Assembly and finish checks',
      'Delivery and installation',
    ],
    installation:
      'We install PVC units with attention to leveling and fixing points suitable for the substrate on site.',
    warranty:
      'Warranty terms depend on the specific PVC system used. We share coverage before you confirm the order.',
    faqs: [
      {
        question: 'Is PVC better than plywood for wardrobes?',
        answer:
          'It depends on climate, budget and design. We explain trade-offs during consultation rather than pushing one material for every job.',
      },
      {
        question: 'Do you offer PVC work in Ahmedabad?',
        answer:
          'Yes. Our Ahmedabad branch at TRP Mall, Bopal specialises in PVC furniture and related interiors.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in PVC furniture. Please advise if it suits my project and share a free consultation.',
    relatedSlugs: ['modular-kitchen', 'wardrobes', 'custom-furniture'],
  },
  {
    slug: 'tv-units',
    name: 'TV Units',
    shortName: 'TV Units',
    h1: 'Custom TV Units in Mumbai, Navi Mumbai & Thane',
    title:
      'Custom TV Units in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Wall TV units and entertainment walls for Mumbai, Navi Mumbai & Thane. Cable management, storage and finishes matched to your living room.',
    image: '/images/tv-unit.jpeg',
    intro:
      'A well-planned TV unit handles screen size, set-top boxes, speakers and storage without clutter. We design floating, floor-standing and full-feature walls for living rooms across Mumbai, Navi Mumbai and Thane.',
    benefits: [
      'Sized for your TV and wall width',
      'Hidden cable paths where possible',
      'Closed storage for remotes and devices',
      'Finish matched to living-room furniture',
      'Free site visit for built-in units',
    ],
    materials: [
      'Engineered wood / plywood carcass',
      'Laminate, veneer or acrylic faces',
      'LED-ready niches on request',
    ],
    designProcess: [
      'Measure wall, niches and electrical points',
      'Plan open vs closed storage',
      '3D concept for living-room view',
      'Confirm finish and hardware',
    ],
    manufacturingProcess: [
      'Panel production and edge finish',
      'Assembly and dry fit checks',
      'On-site fixing and cable routing support',
    ],
    installation:
      'Units are leveled and fixed securely. We coordinate mounting height with your TV size during design.',
    warranty:
      'Manufacturing defects covered under our 5-year warranty policy.',
    faqs: [
      {
        question: 'Can you make a full TV feature wall?',
        answer:
          'Yes. Many clients combine TV storage with display niches and panels. We design based on wall strength and electrical points.',
      },
      {
        question: 'Do you install the TV as well?',
        answer:
          'We install the furniture unit. TV wall-mounting can be coordinated — confirm during consultation.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in a custom TV unit. I would like a free consultation and site visit.',
    relatedSlugs: ['custom-furniture', 'home-interiors', 'bedroom-furniture'],
  },
  {
    slug: 'bedroom-furniture',
    name: 'Bedroom Furniture',
    shortName: 'Bedroom Furniture',
    h1: 'Bedroom Furniture in Mumbai, Navi Mumbai & Thane',
    title:
      'Bedroom Furniture in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Custom beds, wardrobes, side tables and bedroom sets for Mumbai, Navi Mumbai & Thane. Free site visit and 3D design consultation.',
    image: '/images/product-7.jpg',
    intro:
      'Bedroom furniture should fit mattress size, wardrobe depth and circulation — especially in Mumbai apartments. We design beds, wardrobes, dressers and coordinated sets that work as one layout.',
    benefits: [
      'Coordinated wardrobe + bed planning',
      'Storage beds and space-saving options',
      'Finish consistency across the room',
      'Kids bedroom layouts available',
      'Free measure and design consult',
    ],
    materials: [
      'Plywood / engineered wood structures',
      'Upholstered headboards on request',
      'Laminate and veneer finishes',
    ],
    designProcess: [
      'Room measure and furniture zoning',
      'Storage needs discussion',
      '3D layout for approval',
      'Material lock-in',
    ],
    manufacturingProcess: [
      'Workshop fabrication',
      'Quality checks before dispatch',
      'Delivery and installation',
    ],
    installation:
      'Beds and wardrobes are assembled and positioned. We check drawers, shutters and alignments before handover.',
    warranty:
      'Manufacturing defects covered under our 5-year warranty.',
    faqs: [
      {
        question: 'Do you make complete bedroom sets?',
        answer:
          'Yes — wardrobes, beds, side tables and storage can be planned together for a consistent finish.',
      },
      {
        question: 'Can you design for small 1BHK bedrooms?',
        answer:
          'Yes. Compact layouts and sliding wardrobes are common requests in Mumbai and Navi Mumbai flats.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in bedroom furniture. Please contact me for a free consultation.',
    relatedSlugs: ['wardrobes', 'custom-furniture', 'home-interiors'],
  },
  {
    slug: 'office-furniture',
    name: 'Office Furniture',
    shortName: 'Office Furniture',
    h1: 'Office & Commercial Furniture',
    title:
      'Office Furniture in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Custom office desks, workstations, storage and commercial fit-outs for Mumbai, Navi Mumbai, Thane and Ahmedabad. Free consultation.',
    image: '/images/service-2.png',
    intro:
      'We build office and shop furniture for workstations, cabins, reception counters and storage — tailored to floor plates in Mumbai, Navi Mumbai, Thane and our Ahmedabad presence.',
    benefits: [
      'Workstations planned for staff count',
      'Cabin and storage solutions',
      'Reception and display counters',
      'Durable finishes for daily commercial use',
      'Site measure and quotation',
    ],
    materials: [
      'Commercial-grade boards and laminates',
      'Cable management options',
      'Hardware suited to high-use drawers',
    ],
    designProcess: [
      'Understand staff layout and workflow',
      'Measure and propose zoning',
      'Share drawings / 3D where needed',
      'Confirm materials and timeline',
    ],
    manufacturingProcess: [
      'Batch production for multi-station orders',
      'Finish and hardware QC',
      'Phased installation to reduce downtime',
    ],
    installation:
      'We can phase installation around your working hours where practical. Confirm constraints during planning.',
    warranty:
      'Manufacturing defects covered under our 5-year warranty for applicable pieces.',
    faqs: [
      {
        question: 'Do you do complete office interiors?',
        answer:
          'We handle custom furniture and related interior carpentry. Scope is confirmed per project after site visit.',
      },
      {
        question: 'Can you furnish a small shop or clinic?',
        answer:
          'Yes — counters, storage and display units are common commercial requests.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in office / commercial furniture. Please contact me for a free consultation.',
    relatedSlugs: ['custom-furniture', 'home-interiors', 'tv-units'],
  },
  {
    slug: 'home-interiors',
    name: 'Home Interiors',
    shortName: 'Home Interiors',
    h1: 'Home Interior Solutions for 1BHK to 4BHK',
    title:
      'Home Interiors in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Complete home interior carpentry — kitchens, wardrobes, TV units and more — for Mumbai, Navi Mumbai & Thane. Free site visit and 3D design.',
    image: '/images/home-slide1.jpg',
    intro:
      'For full-home projects we coordinate modular kitchen, wardrobes, TV units, pooja units and other carpentry so finishes and timelines stay consistent across rooms.',
    benefits: [
      'Single team for multi-room carpentry',
      'Coordinated finishes across spaces',
      '3D design for key areas',
      'Clearer project sequencing',
      'Free site visit for qualifying projects',
    ],
    materials: [
      'Material grades selected room-by-room',
      'Consistent laminate / acrylic language',
      'Hardware standards agreed upfront',
    ],
    designProcess: [
      'Walkthrough of all rooms',
      'Priority list (kitchen, bedrooms, living)',
      'Design packages and quotation',
      'Phased manufacturing plan',
    ],
    manufacturingProcess: [
      'Room-wise production batches',
      'QC before each dispatch',
      'Sequenced installation',
    ],
    installation:
      'Installation is sequenced to reduce disruption — typically kitchen and wet areas coordinated carefully with other trades when needed.',
    warranty:
      'Applicable manufactured pieces carry our 5-year manufacturing defect warranty.',
    faqs: [
      {
        question: 'Do you handle painting and false ceiling too?',
        answer:
          'Our core strength is custom furniture and interior carpentry. For other trades we can advise — confirm scope during consultation.',
      },
      {
        question: 'Can you do only two rooms in a flat?',
        answer:
          'Yes. Many clients start with kitchen + wardrobes. You do not need a full-home package to enquire.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in home interiors. I would like a free 3D design and site visit.',
    relatedSlugs: ['modular-kitchen', 'wardrobes', 'custom-furniture'],
  },
];

export function getMarketingService(slug: string) {
  return marketingServices.find((s) => s.slug === slug);
}

export function getAllMarketingServiceSlugs() {
  return marketingServices.map((s) => s.slug);
}
