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
  },
  {
    id: '2bhk',
    name: '2 BHK',
    description: 'Complete home interiors',
    icon: 'fa-home',
    woodenPrice: '₹5L',
    pvcPrice: '₹4L',
    popular: true,
  },
  {
    id: '3bhk',
    name: '3 BHK',
    description: 'Premium family homes',
    icon: 'fa-house-user',
    woodenPrice: '₹8L',
    pvcPrice: '₹6.5L',
    popular: false,
  },
  {
    id: '4bhk',
    name: '4 BHK / Villa',
    description: 'Luxury large homes',
    icon: 'fa-building',
    woodenPrice: '₹12.5L',
    pvcPrice: '₹10L',
    popular: false,
  },
  {
    id: 'office',
    name: 'Office',
    description: 'Workstations, cabins, meeting rooms',
    icon: 'fa-briefcase',
    woodenPrice: '₹4L',
    pvcPrice: '₹3.3L',
    popular: false,
  },
  {
    id: 'shop',
    name: 'Shop / Retail',
    description: 'Display units, counters, storage',
    icon: 'fa-store',
    woodenPrice: '₹2.5L',
    pvcPrice: '₹2.1L',
    popular: false,
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Dining, bar, full fit-out',
    icon: 'fa-utensils',
    woodenPrice: '₹5.5L',
    pvcPrice: '₹4.5L',
    popular: false,
  },
  {
    id: 'showroom',
    name: 'Showroom',
    description: 'Product display interiors',
    icon: 'fa-store-alt',
    woodenPrice: '₹4.5L',
    pvcPrice: '₹3.7L',
    popular: false,
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
