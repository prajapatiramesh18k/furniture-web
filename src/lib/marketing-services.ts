export type MarketingServiceSlug =
  | 'custom-furniture-manufacturing'
  | 'modular-furniture-interior-work'
  | 'furniture-repair-restoration'
  | 'finishing-polishing'
  | 'upholstery-work'
  | 'delivery-installation'
  | 'furniture-design-consultation'
  | 'furniture-sales-collection'
  | 'product-customization'
  | 'commercial-furniture';

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
    slug: 'custom-furniture-manufacturing',
    name: 'Custom Furniture Manufacturing',
    shortName: 'Custom Manufacturing',
    h1: 'Custom Furniture Manufacturing in Mumbai, Navi Mumbai & Thane',
    title:
      'Custom Furniture Manufacturing in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Made-to-measure furniture manufactured in our own workshop for Mumbai, Navi Mumbai & Thane homes. Free site visit, 3D design consultation and professional installation.',
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
      'Hi, I am interested in custom furniture manufacturing. Please contact me for a free consultation.',
    relatedSlugs: ['modular-furniture-interior-work', 'product-customization', 'furniture-design-consultation'],
  },
  {
    slug: 'modular-furniture-interior-work',
    name: 'Modular Furniture & Interior Work',
    shortName: 'Modular & Interiors',
    h1: 'Modular Furniture & Interior Work in Mumbai, Navi Mumbai & Thane',
    title:
      'Modular Furniture & Interior Work in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Modular kitchens, wardrobes, TV units and complete interior carpentry for Mumbai, Navi Mumbai & Thane. Free site visit, 3D layout and professional fitting.',
    image: '/images/kitchen.jpeg',
    intro:
      'We plan modular furniture and interior work around how you live — from compact 1BHK kitchens and wardrobes to full-home interiors. Designed for Mumbai and Navi Mumbai apartment constraints and Thane home layouts, manufactured in our own workshop.',
    benefits: [
      'Room-wise layouts planned for your exact floor plan',
      'Modular kitchens, wardrobes, TV units and storage walls',
      'Soft-close hardware and organised storage systems',
      '3D preview before manufacturing',
      'Installed by our team with cleanup',
    ],
    materials: [
      'Moisture-resistant plywood / BWP options where needed',
      'Laminate, acrylic and membrane finishes',
      'Granite / quartz countertop coordination for kitchens',
      'Basket systems, tandem boxes and pull-outs',
    ],
    designProcess: [
      'Site visit with measurements and requirement discussion',
      'Room-wise 3D layouts for your approval',
      'Finishes, colours and hardware selections locked',
      'Manufacturing schedule confirmed in writing',
    ],
    manufacturingProcess: [
      'Precision cutting and edge banding in our workshop',
      'Pre-assembly quality checks before dispatch',
      'Packed room-wise for organised installation',
    ],
    installation:
      'Our team installs room by room — kitchen, wardrobes, TV units and storage — checking alignment, shutters and finishes before handover. Packaging waste is cleared after the job.',
    warranty:
      'Manufacturing and installation defects are covered under our 5-year warranty. Misuse and water damage are excluded — coverage is explained before you confirm.',
    faqs: [
      {
        question: 'How long does a full modular project take?',
        answer:
          'A single kitchen or wardrobe wall typically takes 15–25 days after approval. Full-home interior work is scheduled room-wise — we confirm timelines during consultation.',
      },
      {
        question: 'Can you match new work with my existing furniture?',
        answer:
          'Yes. We carry finish and laminate samples to the site visit so new shutters and panels blend with what you already own.',
      },
      {
        question: 'Do you handle small single-room jobs?',
        answer:
          'Yes. Many clients start with one kitchen or one wardrobe wall. You do not need a full-home package to enquire.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in modular furniture and interior work. I would like a free 3D design and site visit.',
    relatedSlugs: ['custom-furniture-manufacturing', 'product-customization', 'furniture-design-consultation'],
  },
  {
    slug: 'furniture-repair-restoration',
    name: 'Furniture Repair & Restoration',
    shortName: 'Repair & Restoration',
    h1: 'Furniture Repair & Restoration in Mumbai, Navi Mumbai & Thane',
    title:
      'Furniture Repair & Restoration in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Furniture repair and restoration for Mumbai, Navi Mumbai & Thane — loose joints, broken shutters, damaged panels and wobbly structures fixed by skilled craftsmen.',
    image: '/images/service-2.png',
    intro:
      'Good furniture deserves a second life. Our craftsmen repair loose joints, broken hinges, sagging shutters, damaged panels and worn structures across Mumbai, Navi Mumbai and Thane — at your home or in our workshop for bigger jobs.',
    benefits: [
      'Repairs for beds, wardrobes, tables, chairs and storage',
      'Hinge, channel, lock and handle replacements',
      'Structural strengthening for wobbly or sagging pieces',
      'Home visits for assessment and minor on-site repairs',
      'Honest advice — we tell you when replacement costs less',
    ],
    materials: [
      'Matching plywood / blockboard for panel replacement',
      'Branded hinges, channels, locks and handles',
      'Wood fillers and adhesives for joint repair',
      'Touch-up finishes matched to existing colour',
    ],
    designProcess: [
      'Share photos of the damage on WhatsApp or book a visit',
      'We assess repairability and share a clear quotation',
      'You approve the scope — repair or part replacement',
      'Work is scheduled at your home or our workshop',
    ],
    manufacturingProcess: [
      'Damaged parts opened and joints re-glued or replaced',
      'Replacement panels cut and fitted to size',
      'Hardware refitted and movement tested before handover',
    ],
    installation:
      'On-site repairs are finished the same visit wherever possible. Workshop jobs are delivered back and reinstalled by our team.',
    warranty:
      'Repair workmanship is covered for 6 months. Damage from misuse or overloading after repair is excluded — we explain load limits before handover.',
    faqs: [
      {
        question: 'Can you repair a broken wardrobe shutter?',
        answer:
          'Yes — hinge replacement, shutter realignment and full shutter rebuilding are routine jobs. Share a photo and we will quote before visiting.',
      },
      {
        question: 'Is repair worth it for old furniture?',
        answer:
          'For solid wood and good plywood pieces, usually yes. We assess honestly and tell you upfront if a new piece would cost nearly the same.',
      },
      {
        question: 'Do you offer repair visits at home?',
        answer:
          'Yes, across Mumbai, Navi Mumbai and Thane. Minor repairs finish on the spot; bigger jobs go to our workshop and return fitted.',
      },
    ],
    whatsappMessage:
      'Hi, I need furniture repair / restoration. Please contact me for a free assessment.',
    relatedSlugs: ['finishing-polishing', 'upholstery-work', 'custom-furniture-manufacturing'],
  },
  {
    slug: 'finishing-polishing',
    name: 'Finishing & Polishing',
    shortName: 'Finishing & Polish',
    h1: 'Furniture Finishing & Polishing in Mumbai, Navi Mumbai & Thane',
    title:
      'Furniture Finishing & Polishing in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Melamine, PU, polyester and traditional wood polishing for furniture and interiors in Mumbai, Navi Mumbai & Thane. Factory-grade finish at your home or our workshop.',
    image: '/images/service-3.png',
    intro:
      'The finish is what you see and touch every day. We offer melamine, PU, polyester and traditional polish for new and old furniture across Mumbai, Navi Mumbai and Thane — colour-matched and applied by experienced polishers.',
    benefits: [
      'Melamine, PU, polyester and traditional polish options',
      'Colour matching for repairs and extensions',
      'Scratch and dullness removal with re-coating',
      'Dust-controlled application for a clean finish',
      'Matte to high-gloss levels as per your taste',
    ],
    materials: [
      'Branded melamine and PU polish systems',
      'Sealers, fillers and stains for grain work',
      'Fine abrasives for multi-stage rubbing',
      'Eco-friendly finish options on request',
    ],
    designProcess: [
      'Share photos or book a visit for finish inspection',
      'We suggest the right polish type and gloss level',
      'Colour sample approved before full application',
      'Work scheduled with dust protection for your home',
    ],
    manufacturingProcess: [
      'Surface sanded and dents filled stage by stage',
      'Sealer, colour and top coats applied evenly',
      'Final rubbing and inspection in daylight before handover',
    ],
    installation:
      'On-site polishing includes masking and dust sheets for your room. Workshop polishing returns fully cured and ready to use.',
    warranty:
      'Polish application defects (peeling, patchiness) are covered for 6 months. Scratches from daily use and water exposure are excluded.',
    faqs: [
      {
        question: 'PU or melamine — which should I choose?',
        answer:
          'PU gives a richer, more durable finish and costs more; melamine is economical for large areas. We suggest after seeing your furniture and usage.',
      },
      {
        question: 'Can you repolish only one damaged patch?',
        answer:
          'Yes, with careful colour matching — though a full-panel coat usually blends better. We show you both options with pricing.',
      },
      {
        question: 'How long does polishing take?',
        answer:
          'A dining set typically takes 3–5 days including drying. Full-room or multi-piece jobs are scheduled piece by piece.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in furniture finishing and polishing. Please contact me for a free consultation.',
    relatedSlugs: ['furniture-repair-restoration', 'upholstery-work', 'product-customization'],
  },
  {
    slug: 'upholstery-work',
    name: 'Upholstery Work',
    shortName: 'Upholstery',
    h1: 'Sofa & Furniture Upholstery in Mumbai, Navi Mumbai & Thane',
    title:
      'Sofa & Furniture Upholstery in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Sofa, chair, headboard and cushion upholstery with fabric, leatherette and foam replacement across Mumbai, Navi Mumbai & Thane.',
    image: '/images/sofa.jpg',
    intro:
      'Sagging seats and faded fabric make good frames look tired. We re-upholster sofas, chairs, headboards, dining seats and office seating across Mumbai, Navi Mumbai and Thane — with fabric catalogues brought to your home.',
    benefits: [
      'Fabric, leatherette and leather options to every budget',
      'Foam and spring replacement for sagging seats',
      'Stitching styles — plain, tufted, piped and panelled',
      'Cushion, backrest and armrest reshaping',
      'Pickup, workshop finishing and re-delivery',
    ],
    materials: [
      'Upholstery fabrics in cotton, polyester and blends',
      'Leatherette and genuine leather options',
      'High-density foam in multiple grades',
      'Zippers, piping cords and webbing tapes',
    ],
    designProcess: [
      'Share photos or book a visit with fabric catalogues',
      'Foam and fabric selected against your budget',
      'Stitching pattern and piping details confirmed',
      'Pickup scheduled for workshop finishing',
    ],
    manufacturingProcess: [
      'Old covers stripped and frames inspected',
      'Foam rebuilt and new covers stitched to size',
      'Fitted, stapled and finished with piping detail',
    ],
    installation:
      'Finished pieces are delivered back, positioned and checked for comfort and stitching before handover.',
    warranty:
      'Stitching and fitting defects are covered for 6 months. Fabric wear, stains and pet damage are excluded.',
    faqs: [
      {
        question: 'My sofa sags — do I need a new one?',
        answer:
          'Usually not. If the frame is solid, new foam and fabric make it feel new at a fraction of replacement cost. We check the frame free during assessment.',
      },
      {
        question: 'Can I choose my own fabric?',
        answer:
          'Yes — use our catalogues or supply your own fabric. Labour-only pricing applies if you provide material.',
      },
      {
        question: 'How long does sofa upholstery take?',
        answer:
          'A standard 3-seater typically takes 5–7 days including foam curing and stitching. Sets are scheduled together.',
      },
    ],
    whatsappMessage:
      'Hi, I am interested in upholstery work for my sofa / chairs. Please contact me for a free consultation.',
    relatedSlugs: ['furniture-repair-restoration', 'finishing-polishing', 'furniture-sales-collection'],
  },
  {
    slug: 'delivery-installation',
    name: 'Delivery & Installation',
    shortName: 'Delivery & Fitting',
    h1: 'Furniture Delivery & Installation in Mumbai, Navi Mumbai & Thane',
    title:
      'Furniture Delivery & Installation in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Safe furniture transport, assembly and installation across Mumbai, Navi Mumbai & Thane — including high-rise delivery and old-furniture shifting.',
    image: '/images/service-4.jpg',
    intro:
      'Heavy wardrobes, dining sets and modular units need careful handling — especially in high-rises. Our team delivers, carries, assembles and installs furniture across Mumbai, Navi Mumbai and Thane, and clears the packaging after.',
    benefits: [
      'Safe packing and transport for bulky furniture',
      'High-rise delivery with lift and staircase planning',
      'Expert assembly — beds, wardrobes, dining and storage',
      'Wall-mounting for shelves, TV units and crockery units',
      'Packaging waste cleared after installation',
    ],
    materials: [
      'Protective packing — bubble, foam and corner guards',
      'Assembly hardware, wall plugs and brackets',
      'Touch-up kits for transit marks',
      'Floor protectors during carrying and fitting',
    ],
    designProcess: [
      'Share your delivery address, floor and lift details',
      'We plan vehicle size, manpower and access route',
      'Delivery slot confirmed a day in advance',
      'Team arrives with packing protection and tools',
    ],
    manufacturingProcess: [
      'Pieces checked against order before loading',
      'Loaded and strapped to prevent transit damage',
      'Unpacked room-wise on arrival for organised fitting',
    ],
    installation:
      'Furniture is assembled, levelled and wall-anchored where needed. We test every shutter and drawer before handover and take the packaging away.',
    warranty:
      'Installation defects (alignment, anchoring) are covered for 6 months. Transit damage claims must be reported at delivery time.',
    faqs: [
      {
        question: 'Do you deliver to high floors without a lift?',
        answer:
          'Yes — we plan manpower and disassembly for staircase carries. Access constraints are confirmed before the delivery date.',
      },
      {
        question: 'Can you shift my old furniture to another room or home?',
        answer:
          'Yes. We handle internal shifting and inter-home moves for furniture, including disassembly and reassembly.',
      },
      {
        question: 'Is installation included in delivery?',
        answer:
          'For our own manufactured pieces, yes. For standalone delivery jobs, assembly and wall-mounting are quoted clearly upfront.',
      },
    ],
    whatsappMessage:
      'Hi, I need furniture delivery and installation. Please contact me with a quotation.',
    relatedSlugs: ['custom-furniture-manufacturing', 'modular-furniture-interior-work', 'product-customization'],
  },
  {
    slug: 'furniture-design-consultation',
    name: 'Furniture Design & Consultation',
    shortName: 'Design Consultation',
    h1: 'Furniture Design & Consultation in Mumbai, Navi Mumbai & Thane',
    title:
      'Furniture Design & Consultation in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Free site visit and 3D design consultation for furniture and interiors in Mumbai, Navi Mumbai & Thane. See your plan before manufacturing.',
    image: '/images/service-5.jpg',
    intro:
      'Not sure what fits your space? Our designers visit your home, measure, understand your usage and show you 3D concepts — free for serious project enquiries across Mumbai, Navi Mumbai and Thane, plus Ahmedabad (Bopal).',
    benefits: [
      'Free site visit with measurements',
      '3D design concepts before you commit',
      'Material, colour and budget guidance',
      'Room-wise planning for phased budgets',
      'No-pressure advice — designs are yours to review',
    ],
    materials: [
      '3D views in realistic colours and finishes',
      'Material and laminate sample references',
      'Hardware options with price differences',
      'Written scope and estimate after approval',
    ],
    designProcess: [
      'Book a visit on WhatsApp, call or the contact form',
      'We measure your rooms and discuss needs and budget',
      'You receive 3D concepts for review and changes',
      'Final design locked with a clear written quotation',
    ],
    manufacturingProcess: [
      'Approved designs converted to workshop drawings',
      'Cutting lists and hardware schedules prepared',
      'Production slot reserved on your confirmation',
    ],
    installation:
      'Consultation covers installation planning too — access, sequencing and timelines are part of the approved proposal.',
    warranty:
      'Designs follow standard ergonomic dimensions. Execution warranty applies when we manufacture and install the approved design.',
    faqs: [
      {
        question: 'Is the consultation really free?',
        answer:
          'Yes — site visit and 3D concepts are free for genuine project enquiries. If you only need drawings without execution, a nominal design fee applies.',
      },
      {
        question: 'Which areas do you visit?',
        answer:
          'Mumbai, Navi Mumbai and Thane, plus Ahmedabad (Bopal). Nearby areas are confirmed honestly at booking time.',
      },
      {
        question: 'Can I get designs for one room only?',
        answer:
          'Absolutely. Single-room consultations — one kitchen, one bedroom, one office cabin — are very common.',
      },
    ],
    whatsappMessage:
      'Hi, I would like a free design consultation and site visit for my space.',
    relatedSlugs: ['custom-furniture-manufacturing', 'modular-furniture-interior-work', 'product-customization'],
  },
  {
    slug: 'furniture-sales-collection',
    name: 'Furniture Sales & Product Collection',
    shortName: 'Sales & Collection',
    h1: 'Furniture Sales & Ready Collection in Mumbai, Navi Mumbai & Thane',
    title:
      'Furniture Sales & Ready Collection in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Ready and semi-ready furniture — beds, tables, chairs, storage and more — with showroom viewing in Thane and Bopal. Factory-direct prices.',
    image: '/images/service-6.jpg',
    intro:
      'Prefer to see before you buy? Browse our ready and semi-ready collection — beds, side tables, dining sets, chairs, shoe racks, TV units and storage — at our Thane showroom and Ahmedabad (Bopal) branch, at factory-direct prices.',
    benefits: [
      'See and try products before buying',
      'Factory-direct pricing without middlemen',
      'Quick delivery on ready stock',
      'Minor size and finish tweaks available',
      '5-year warranty on manufactured pieces',
    ],
    materials: [
      'Solid wood, plywood and engineered options',
      'Laminate, veneer and polished finishes',
      'Upholstered options in fabric and leatherette',
      'Branded hardware on storage pieces',
    ],
    designProcess: [
      'Visit the showroom or browse products online',
      'Shortlist pieces with our team’s guidance',
      'Confirm sizes against your room measurements',
      'Delivery slot booked at billing time',
    ],
    manufacturingProcess: [
      'Ready pieces quality-checked before dispatch',
      'Made-to-tweak orders finished in our workshop',
      'Packed with transit protection for delivery',
    ],
    installation:
      'Delivery includes assembly and positioning. Packaging waste is cleared after installation.',
    warranty:
      'Manufactured pieces carry our 5-year warranty against manufacturing defects. Wear-and-tear and misuse are excluded.',
    faqs: [
      {
        question: 'Where can I see the collection?',
        answer:
          'At our Thane showroom (Diva-Shil Road, Khardipada) and our Ahmedabad branch at TRP Mall, Bopal. The products page also shows live stock.',
      },
      {
        question: 'Can ready products be customised slightly?',
        answer:
          'Often yes — size, colour and fabric tweaks are possible on many pieces. Ask before billing and we will confirm feasibility.',
      },
      {
        question: 'How fast is delivery on ready stock?',
        answer:
          'Usually within a few days in Mumbai, Navi Mumbai and Thane, subject to slot availability. Outstation delivery is quoted separately.',
      },
    ],
    whatsappMessage:
      'Hi, I want to know about your ready furniture collection. Please share details.',
    relatedSlugs: ['product-customization', 'delivery-installation', 'furniture-design-consultation'],
  },
  {
    slug: 'product-customization',
    name: 'Product Customization',
    shortName: 'Customization',
    h1: 'Furniture Product Customization in Mumbai, Navi Mumbai & Thane',
    title:
      'Furniture Product Customization in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Customise size, finish, fabric and storage on our furniture designs across Mumbai, Navi Mumbai & Thane. Your dimensions, our craftsmanship.',
    image: '/images/dining-table.jpeg',
    intro:
      'Love a design but need it wider, shorter, darker or softer? We customise our product designs — beds, tables, seating, storage and more — to your dimensions, finishes and fabrics across Mumbai, Navi Mumbai and Thane.',
    benefits: [
      'Size adjustments to fit your exact space',
      'Finish and colour changes on any design',
      'Fabric and upholstery swaps on seating',
      'Storage additions — drawers, shelves, lofts',
      'Preview and quotation before we start',
    ],
    materials: [
      'Same-grade materials as the base design',
      'Full laminate, veneer and polish shade cards',
      'Fabric and leatherette catalogues',
      'Matching hardware for added storage',
    ],
    designProcess: [
      'Pick a base product from our collection',
      'Tell us the changes — size, colour, fabric, storage',
      'We confirm feasibility with adjusted pricing',
      'Custom piece scheduled in our workshop queue',
    ],
    manufacturingProcess: [
      'Base design redrawn to your dimensions',
      'Cut, assembled and finished as a custom order',
      'Checked against the approved specification',
    ],
    installation:
      'Delivered, assembled and positioned like any custom order, with packaging cleared after installation.',
    warranty:
      'Customised pieces carry our 5-year warranty against manufacturing defects, same as full-custom furniture.',
    faqs: [
      {
        question: 'How much extra does customization cost?',
        answer:
          'Small tweaks like colour or fabric changes cost little; size changes are quoted by material and labour. You approve pricing before we start.',
      },
      {
        question: 'How long does a customised product take?',
        answer:
          'Usually 10–20 days depending on the change. Timelines are confirmed with your quotation.',
      },
      {
        question: 'Can I combine features of two products?',
        answer:
          'Often yes — for example, one table’s top with another’s legs. Share both references and we will confirm feasibility.',
      },
    ],
    whatsappMessage:
      'Hi, I like one of your products and want it customized. Please contact me.',
    relatedSlugs: ['custom-furniture-manufacturing', 'furniture-sales-collection', 'furniture-design-consultation'],
  },
  {
    slug: 'commercial-furniture',
    name: 'Commercial Furniture',
    shortName: 'Commercial',
    h1: 'Commercial Furniture in Mumbai, Navi Mumbai & Thane',
    title:
      'Commercial Furniture in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture',
    description:
      'Office, retail, restaurant and showroom furniture across Mumbai, Navi Mumbai & Thane. Workstations, counters, display units and full fit-outs.',
    image: '/images/reception-table.png',
    intro:
      'Offices, shops, restaurants and showrooms need furniture that works as hard as you do. We manufacture workstations, counters, display units, dining setups and complete commercial fit-outs across Mumbai, Navi Mumbai and Thane — built for daily heavy use.',
    benefits: [
      'Office workstations, cabins and meeting tables',
      'Retail counters, display racks and trial rooms',
      'Restaurant dining, bar counters and service stations',
      'Showroom displays, podiums and consultation areas',
      'Sturdy commercial-grade construction throughout',
    ],
    materials: [
      'Heavy-duty plywood and blockboard carcass',
      'Scratch-resistant laminate and acrylic finishes',
      'Metal framing for workstations and racks',
      'Commercial-grade hardware and locks',
    ],
    designProcess: [
      'Site visit with measurements and footfall discussion',
      'Layout plan for staff flow and customer movement',
      'Material and finish selections for heavy use',
      'Phased schedule to minimise business downtime',
    ],
    manufacturingProcess: [
      'Bulk cutting and edge banding in our workshop',
      'Trial assembly of counters and display units',
      'Packed and labelled zone-wise for fast fitting',
    ],
    installation:
      'Installed floor by floor or zone by zone — including overnight slots where daytime work would disturb business. Packaging cleared after handover.',
    warranty:
      'Manufacturing defects are covered under our 5-year warranty. Commercial wear-and-tear beyond normal use is assessed case by case.',
    faqs: [
      {
        question: 'Can you fit out my office without stopping work?',
        answer:
          'Yes — we schedule zone-wise and overnight work so your team keeps running. Phasing is agreed in writing before we start.',
      },
      {
        question: 'Do you handle restaurants and shops too?',
        answer:
          'Yes. Dining seating, bar counters, billing desks, display racks and storage — plus the installation to match your opening date.',
      },
      {
        question: 'Is commercial furniture more expensive?',
        answer:
          'It uses heavier materials and hardware, but factory-direct manufacturing keeps pricing fair. You approve a written quotation before production.',
      },
    ],
    whatsappMessage:
      'Hi, I need commercial furniture for my office / shop. Please contact me with a quotation.',
    relatedSlugs: ['custom-furniture-manufacturing', 'modular-furniture-interior-work', 'delivery-installation'],
  },
];

export function getMarketingService(slug: string) {
  return marketingServices.find((s) => s.slug === slug);
}

export function getAllMarketingServiceSlugs() {
  return marketingServices.map((s) => s.slug);
}
