'use client';
import { useState } from 'react';

type Material = 'wooden' | 'pvc';

const packages = [
  {
    name: 'Essential',
    woodenPrice: '₹3L',
    pvcPrice: '₹2.5L',
    woodenUnit: 'for 1BHK',
    pvcUnit: 'for 1BHK (PVC)',
    description: 'Perfect starter package',
    woodenFeatures: [
      'Modular kitchen (wooden)',
      '1 wardrobe',
      'TV unit',
      'Basic bed',
      'Free design consultation',
    ],
    pvcFeatures: [
      'PVC modular kitchen',
      '1 PVC wardrobe',
      'TV unit (PVC + wood combo)',
      'Basic bed with PVC headboard',
      'Free design consultation',
      'Waterproof & termite-free',
    ],
    cta: 'Get Quote',
    highlight: false,
  },
  {
    name: 'Premium',
    woodenPrice: '₹5L',
    pvcPrice: '₹4L',
    woodenUnit: 'for 2BHK',
    pvcUnit: 'for 2BHK (PVC)',
    description: 'Most popular complete package',
    woodenFeatures: [
      'Modular kitchen (L-shape)',
      '2 wardrobes',
      'TV unit + Crockery unit',
      '2 beds with storage',
      'Pooja unit',
      '5-year warranty',
    ],
    pvcFeatures: [
      'PVC modular kitchen (L-shape)',
      '2 PVC wardrobes',
      'TV unit + Crockery unit',
      '2 beds with PVC storage',
      'PVC pooja unit',
      '5-year warranty',
      'Best for humid climates',
    ],
    cta: 'Get Quote',
    highlight: true,
  },
  {
    name: 'Luxury',
    woodenPrice: '₹8L+',
    pvcPrice: '₹6.5L+',
    woodenUnit: 'for 3BHK',
    pvcUnit: 'for 3BHK (PVC + wood)',
    description: 'Premium finishes, full home',
    woodenFeatures: [
      'Premium modular kitchen',
      '3 walk-in wardrobes',
      'TV unit + Crockery + Bar unit',
      '3 beds with hydraulic storage',
      'Pooja unit + Study',
      'Premium hardware & finishes',
      'Dedicated project manager',
    ],
    pvcFeatures: [
      'Hybrid: wood + premium PVC',
      '3 PVC walk-in wardrobes',
      'TV unit + Crockery + Bar',
      '3 beds with PVC + wood',
      'PVC pooja unit + Study',
      'Premium hardware',
      'Dedicated project manager',
      'Best for Ahmedabad weather',
    ],
    cta: 'Get Quote',
    highlight: false,
  },
];

export default function ProjectPricing() {
  const [material, setMaterial] = useState<Material>('wooden');

  return (
    <section className="project-pricing" id="pricing">
      <h1 className="heading">Transparent <span>Pricing</span></h1>
      <p className="project-pricing-subtitle">
        Starting prices for complete interior packages. Choose your material.
      </p>

      <div className="pricing-material-toggle" role="tablist" aria-label="Material selection">
        <button
          type="button"
          role="tab"
          aria-selected={material === 'wooden'}
          className={`pricing-toggle-btn ${material === 'wooden' ? 'active' : ''}`}
          onClick={() => setMaterial('wooden')}
        >
          <i className="fas fa-tree"></i> Wooden
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={material === 'pvc'}
          className={`pricing-toggle-btn ${material === 'pvc' ? 'active' : ''}`}
          onClick={() => setMaterial('pvc')}
        >
          <i className="fas fa-layer-group"></i> PVC <span className="pricing-toggle-badge">New</span>
        </button>
      </div>

      <div className="project-pricing-grid">
        {packages.map((pkg) => {
          const price = material === 'wooden' ? pkg.woodenPrice : pkg.pvcPrice;
          const unit = material === 'wooden' ? pkg.woodenUnit : pkg.pvcUnit;
          const features = material === 'wooden' ? pkg.woodenFeatures : pkg.pvcFeatures;
          return (
            <div key={pkg.name} className={`pricing-card ${pkg.highlight ? 'highlight' : ''}`}>
              {pkg.highlight && <span className="pricing-badge">⭐ Most Popular</span>}
              <h3>{pkg.name}</h3>
              <div className="pricing-price">
                <span className="pricing-amount">{price}</span>
                <span className="pricing-unit">{unit}</span>
              </div>
              <p className="pricing-desc">{pkg.description}</p>
              <ul className="pricing-features">
                {features.map((f) => (
                  <li key={f}><i className="fas fa-check"></i> {f}</li>
                ))}
              </ul>
              <a href="/contact" className="pricing-cta">
                {pkg.cta} <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          );
        })}
      </div>
      <p className="pricing-note">
        <i className="fas fa-info-circle"></i> Prices are indicative. Final quote depends on materials, size, and customizations. <a href="/contact">Contact us</a> for exact pricing. PVC available at our Ahmedabad branch.
      </p>
    </section>
  );
}
