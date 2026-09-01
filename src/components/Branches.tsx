const branches = [
  {
    id: 'mumbai',
    name: 'Mumbai (Head Office)',
    badge: 'Headquarters',
    badgeIcon: 'fa-building',
    address: 'Diva-Shil Road, Khardipada',
    city: 'Mumbai, Maharashtra - 400612',
    phone: '+91 83187 27813',
    phone2: '+91 77150 95021',
    email: 'ananyahouseoffurniture@gmail.com',
    mapLink: 'https://maps.app.goo.gl/3wAw79stEiGNyeWa9',
    services: ['Wooden Furniture', 'Modular Kitchen', 'Custom Interiors', 'Pooja Units', 'Wardrobes & TV Units'],
    specialty: 'In-house wooden furniture factory',
    established: '2012',
    icon: 'fa-industry',
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    badge: 'Newly Opened',
    badgeIcon: 'fa-star',
    address: 'West Court 2nd Floor ,TRP Mall ,Bopal',
    city: 'Ahmedabad, Gujarat - 380059',
    phone: '+91 93218 12823',
    email: 'ananyahouseoffurniture@gmail.com',
    mapLink: 'https://maps.google.com/?q=Navrangpura+Ahmedabad',
    services: ['Wooden Furniture', 'PVC Furniture', 'Modular Kitchen', 'Custom Interiors', 'PVC Wardrobes & Cabinets'],
    specialty: 'PVC work specialists — perfect for Gujarat climate',
    established: '2026',
    icon: 'fa-layer-group',
    highlight: true,
  },
];

export default function Branches() {
  return (
    <section className="branches-section" id="branches">
      <h1 className="heading">Our <span>Branches</span></h1>
      <p className="branches-subtitle">
        Two locations. Same quality. Visit us at the branch closest to you.
      </p>
      <div className="branches-grid">
        {branches.map((branch) => (
          <div key={branch.id} className={`branch-card ${branch.highlight ? 'highlight' : ''}`}>
            {branch.highlight && <span className="branch-new-badge">⭐ NEW</span>}
            <div className="branch-card-header">
              <div className="branch-icon">
                <i className={`fas ${branch.icon}`}></i>
              </div>
              <div>
                <h3>{branch.name}</h3>
                <span className="branch-badge">
                  <i className={`fas ${branch.badgeIcon}`}></i> {branch.badge}
                </span>
              </div>
            </div>

            <div className="branch-info">
              <div className="branch-info-row">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <p>{branch.address}</p>
                  <p>{branch.city}</p>
                </div>
              </div>
              <div className="branch-info-row">
                <i className="fas fa-phone"></i>
                <div>
                  <p><a href={`tel:${branch.phone}`}>{branch.phone}</a></p>
                  {'phone2' in branch && branch.phone2 ? (
                    <p><a href={`tel:${branch.phone2}`}>{branch.phone2}</a></p>
                  ) : null}
                </div>
              </div>
              <div className="branch-info-row">
                <i className="fas fa-envelope"></i>
                <p><a href={`mailto:${branch.email}`}>{branch.email}</a></p>
              </div>
              <div className="branch-info-row">
                <i className="fas fa-calendar-check"></i>
                <p>Established: <strong>{branch.established}</strong></p>
              </div>
            </div>

            <div className="branch-specialty">
              <i className="fas fa-award"></i> {branch.specialty}
            </div>

            <div className="branch-services">
              <h4>What we do here:</h4>
              <div className="branch-services-tags">
                {branch.services.map((s) => (
                  <span key={s} className="branch-service-tag">{s}</span>
                ))}
              </div>
            </div>

            <div className="branch-actions">
              <a href={branch.mapLink} target="_blank" rel="noopener noreferrer" className="branch-action-btn">
                <i className="fas fa-map-marked-alt"></i> Get Directions
              </a>
              <a href={`/contact?branch=${branch.id}`} className="branch-action-btn primary">
                <i className="fas fa-paper-plane"></i> Get Free Quote
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
