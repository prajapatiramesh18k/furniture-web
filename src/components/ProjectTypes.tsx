import Link from 'next/link';

const projectTypes = [
  {
    id: '1bhk',
    name: '1 BHK',
    description: 'Compact & smart interiors',
    icon: 'fa-door-closed',
    woodenPrice: '₹3L',
    pvcPrice: '₹2.5L',
    popular: false,
    covers: [
      'Modular kitchen with cabinets & chimney',
      '1 wardrobe with loft',
      'Shoe rack & TV unit',
      'Bed with storage & side tables',
      'Bathroom vanity & mirror',
    ],
  },
  {
    id: '2bhk',
    name: '2 BHK',
    description: 'Complete home interiors',
    icon: 'fa-home',
    woodenPrice: '₹5L',
    pvcPrice: '₹4L',
    popular: true,
    covers: [
      'Modular kitchen + chimney + hob',
      '2 wardrobes with lofts',
      'Shoe rack, TV unit, crockery unit',
      '2 beds with storage & side tables',
      'Dining table (4-seater)',
      '2 bathroom vanities & mirrors',
    ],
  },
  {
    id: '3bhk',
    name: '3 BHK',
    description: 'Premium family homes',
    icon: 'fa-house-user',
    woodenPrice: '₹8L',
    pvcPrice: '₹6.5L',
    popular: false,
    covers: [
      'Premium modular kitchen + island',
      '3 wardrobes with lofts & dressing',
      'Shoe rack, TV unit, bar cabinet',
      '3 beds (king/queen) with storage',
      'Dining table (6-seater) + crockery',
      'Study unit / work-from-home desk',
      '3 bathroom vanities & mirrors',
    ],
  },
  {
    id: '4bhk',
    name: '4 BHK / Villa',
    description: 'Luxury large homes',
    icon: 'fa-building',
    woodenPrice: '₹12.5L',
    pvcPrice: '₹10L',
    popular: false,
    covers: [
      'Luxury modular kitchen + island + pantry',
      '4 wardrobes with walk-in dressing',
      'Shoe rack, TV units, bar + wine cellar',
      '4 beds (king) with luxury headboards',
      '8-seater dining + crockery + server',
      '2 study units + library shelving',
      '4 bathroom vanities',
    ],
  },
  {
    id: 'office',
    name: 'Office',
    description: 'Workstations, cabins, meeting rooms',
    icon: 'fa-briefcase',
    woodenPrice: '₹4L',
    pvcPrice: '₹3.3L',
    popular: false,
    covers: [
      'Reception counter + logo wall',
      'Workstations with partitions',
      'Manager cabins with storage',
      'Conference / meeting room table',
      'Pantry / break-out kitchenette',
      'Server room rack',
      'Storage cabinets & lockers',
    ],
  },
  {
    id: 'shop',
    name: 'Shop / Retail',
    description: 'Display units, counters, storage',
    icon: 'fa-store',
    woodenPrice: '₹2.5L',
    pvcPrice: '₹2.1L',
    popular: false,
    covers: [
      'Billing / POS counter',
      'Wall display shelves & racks',
      'Center island display unit',
      'Trial room partition',
      'Storage / stock room shelving',
      'Signage board & branding wall',
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Dining, bar, full fit-out',
    icon: 'fa-utensils',
    woodenPrice: '₹5.5L',
    pvcPrice: '₹4.5L',
    popular: false,
    covers: [
      'Reception & hostess counter',
      'Dining seating (booths + chairs)',
      'Bar counter with back bar display',
      'Wash area & service station',
      'Kitchen trolleys & shelves',
      'Washroom partitions & vanities',
    ],
  },
  {
    id: 'showroom',
    name: 'Showroom',
    description: 'Product display interiors',
    icon: 'fa-store-alt',
    woodenPrice: '₹4.5L',
    pvcPrice: '₹3.7L',
    popular: false,
    covers: [
      'Entrance display & welcome zone',
      'Brand wall + feature display',
      'Product display racks / podiums',
      'Reception & consultation area',
      'Fitting room / demo space',
      'Storage / back-office shelving',
    ],
  },
];

export default function ProjectTypes() {
  return (
    <section className="project-types" id="project-types">
      <h1 className="heading">We <span>Specialize In</span></h1>
      <p className="project-types-subtitle">
        From compact 1BHKs to large offices — custom furniture & complete interiors for every space
      </p>
      <div className="project-types-grid">
        {projectTypes.map((type) => (
          <Link
            key={type.id}
            href={`/contact?type=${type.id}`}
            className={`project-type-card ${type.popular ? 'popular' : ''}`}
          >
            {type.popular && <span className="project-type-popular">Most Popular</span>}

            <div className="project-type-tooltip">
              <div className="project-type-tooltip-header">
                <i className="fas fa-list-check"></i> What's included
              </div>
              <ul>
                {type.covers.map((item, i) => (
                  <li key={i}>
                    <i className="fas fa-check"></i> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="project-type-icon">
              <i className={`fas ${type.icon}`}></i>
            </div>
            <h3>{type.name}</h3>
            <p>{type.description}</p>
            <div className="project-type-prices">
              <div className="project-type-price-row">
                <span className="project-type-material">
                  <i className="fas fa-tree"></i> Wooden
                </span>
                <span className="project-type-amount">{type.woodenPrice}</span>
              </div>
              <div className="project-type-price-row pvc">
                <span className="project-type-material">
                  <i className="fas fa-layer-group"></i> PVC
                  <span className="project-type-new-tag">New</span>
                </span>
                <span className="project-type-amount">{type.pvcPrice}</span>
              </div>
            </div>
            <span className="project-type-cta">
              Get Quote <i className="fas fa-arrow-right"></i>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
