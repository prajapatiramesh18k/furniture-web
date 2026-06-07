export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: 'fa-calendar-check',
      title: 'Book Free Consultation',
      description: 'Tell us about your space. Call, WhatsApp, or fill our form. We respond within 2 hours.',
    },
    {
      num: '02',
      icon: 'fa-drafting-compass',
      title: 'Free Site Visit & Design',
      description: 'Our designer visits your home/office, takes measurements, and creates a 3D design — absolutely free.',
    },
    {
      num: '03',
      icon: 'fa-file-invoice-dollar',
      title: 'Approve Transparent Quote',
      description: 'Get a detailed quote with itemized pricing. No hidden costs. Pay only 30% to confirm.',
    },
    {
      num: '04',
      icon: 'fa-truck-loading',
      title: 'We Build & Install',
      description: 'Our in-house factory builds your furniture. We install at your site in 15-30 days. 5-year warranty.',
    },
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <h1 className="heading">How It <span>Works</span></h1>
      <p className="how-it-works-subtitle">
        From your first call to a fully furnished home — in 4 simple steps
      </p>
      <div className="how-it-works-grid">
        {steps.map((step, idx) => (
          <div key={step.num} className="how-step">
            <div className="how-step-number">{step.num}</div>
            <div className="how-step-icon">
              <i className={`fas ${step.icon}`}></i>
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            {idx < steps.length - 1 && <div className="how-step-arrow"><i className="fas fa-arrow-right"></i></div>}
          </div>
        ))}
      </div>
    </section>
  );
}
