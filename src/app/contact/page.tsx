'use client';
import CloseButton from '@/components/CloseButton';
import { useState, useEffect, useRef } from 'react';
import {
  handleTrackedPhoneClick,
  trackContactFormStart,
  trackContactFormSubmit,
  trackQuoteRequest,
  trackSiteVisitRequest,
  track3dDesignRequest,
} from '@/lib/analytics';
import { openQuoteWhatsApp } from '@/lib/quote-whatsapp';
import { trackMetaContact, trackMetaLead } from '@/components/MetaPixel';

const projectTypes = [
  'Modular Kitchen',
  'Wardrobe',
  'Custom Furniture',
  'PVC Furniture',
  'TV Unit',
  'Bedroom Furniture',
  'Office Furniture',
  'Complete Home Interior',
  'Other',
];

const locations = [
  'Mumbai',
  'Navi Mumbai',
  'Thane',
  'Ahmedabad',
  'Bopal',
  'Other',
];

const branches = [
  { id: 'mumbai', name: 'Mumbai / Thane (Head Office)' },
  { id: 'ahmedabad', name: 'Ahmedabad (Bopal)' },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    location: '',
    branch: '',
    projectType: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const formStarted = useRef(false);

  useEffect(() => {
    document.title = 'Get Free 3D Design & Site Visit | Ananya House of Furniture';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      const branch = params.get('branch');
      const location = params.get('location');
      if (type) {
        const match = projectTypes.find(
          (t) => t.toLowerCase() === type.toLowerCase() || t.toLowerCase().replace(/\s+/g, '-') === type.toLowerCase()
        );
        setForm((f) => ({
          ...f,
          projectType: match ? match.toLowerCase().replace(/[\s/]+/g, '-') : type.toLowerCase().replace(/[\s/]+/g, '-'),
        }));
      }
      if (branch) {
        setForm((f) => ({ ...f, branch }));
      }
      if (location) {
        setForm((f) => ({ ...f, location }));
      }
    }
  }, []);

  const markFormStart = () => {
    if (formStarted.current) return;
    formStarted.current = true;
    trackContactFormStart({ source: 'contact_page', cta_position: 'contact_form' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const formEl = e.target as HTMLFormElement;
    const honey = (formEl.elements.namedItem('company_url') as HTMLInputElement | null)?.value;
    if (honey) {
      setSubmitting(false);
      setSubmitted(true);
      return;
    }

    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!form.name.trim() || !form.email.trim() || !form.projectType || !form.location || !form.message.trim()) {
      setError(true);
      setSubmitting(false);
      return;
    }
    if (phoneDigits.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      setSubmitting(false);
      return;
    }

    const projectTypeLabel =
      projectTypes.find(
        (type) => type.toLowerCase().replace(/[\s/]+/g, '-') === form.projectType
      ) || form.projectType;

    const submittedData = {
      name: form.name.trim(),
      phone: phoneDigits,
      email: form.email.trim(),
      address: form.address.trim(),
      location: form.location,
      branch: form.branch || (form.location === 'Ahmedabad' || form.location === 'Bopal' ? 'ahmedabad' : 'mumbai'),
      projectType: form.projectType,
      message: `[Location: ${form.location}] ${form.message.trim()}`,
    };

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittedData),
      });

      if (!response.ok) {
        setError(true);
        return;
      }

      trackContactFormSubmit({
        source: 'contact_page',
        cta_position: 'contact_form',
        service: form.projectType,
        location: form.location,
        project_type: projectTypeLabel,
      });
      trackQuoteRequest({
        source: 'contact_page',
        service: form.projectType,
        location: form.location,
      });
      trackSiteVisitRequest({
        source: 'contact_page',
        service: form.projectType,
        location: form.location,
      });
      track3dDesignRequest({
        source: 'contact_page',
        service: form.projectType,
        location: form.location,
      });
      trackMetaLead();
      trackMetaContact();

      openQuoteWhatsApp(
        {
          ...submittedData,
          projectType: projectTypeLabel,
          location: form.location,
        },
        {
          source: 'contact_page',
          cta: 'contact_page_whatsapp',
          cta_position: 'contact_form',
          service: form.projectType,
          location: form.location,
        }
      );
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const isActive = (field: string) => focused === field || form[field as keyof typeof form];

  return (
    <div className="contact-page">
      <div className="contact-page-hero">
        <CloseButton href="/" />
        <h1>Contact <span>Us</span></h1>
        <p>Ready to create your dream space? Send us a message and let’s bring your vision to life.</p>
      </div>

      <div className="contact-page-layout-animated">
        {/* Decorative background */}
        <div className="contact-bg-decor">
          <div className="contact-bg-blob blob-1"></div>
          <div className="contact-bg-blob blob-2"></div>
        </div>

        <div className="contact-page-grid">
          {/* Left: Info card */}
          <div className="contact-info-card anim-fade-right" style={{ animationDelay: '0.2s' }}>
            <div className="info-card-pattern"></div>

            <div className="info-hero">
              <div className="info-hero-img">
                <img src="/images/contact.png" alt="Ananya House of Furniture showroom" />
                <div className="info-hero-overlay">
                  <span className="info-hero-badge"><i className="fas fa-star"></i> Since 2012</span>
                </div>
                <div className="info-hero-text">
                  <span className="info-hero-eyebrow">Ananya Furniture</span>
                  <span className="info-hero-tagline">Crafted With Care</span>
                </div>
              </div>
            </div>

            <h2 className="info-card-title">Crafting Your Dream Home</h2>
            <p className="info-card-text">From the first sketch to the final polish — we make custom furniture that fits your life.</p>

            <div className="info-stats">
              <div className="info-stat anim-fade-up" style={{ animationDelay: '0.3s' }}>
                <span className="info-stat-num">2012</span>
                <span className="info-stat-label">Established</span>
              </div>
              <div className="info-stat anim-fade-up" style={{ animationDelay: '0.4s' }}>
                <span className="info-stat-num">14+</span>
                <span className="info-stat-label">Years</span>
              </div>
              <div className="info-stat anim-fade-up" style={{ animationDelay: '0.5s' }}>
                <span className="info-stat-num">5yr</span>
                <span className="info-stat-label">Warranty</span>
              </div>
              <div className="info-stat anim-fade-up" style={{ animationDelay: '0.6s' }}>
                <span className="info-stat-num">Free</span>
                <span className="info-stat-label">3D Design</span>
              </div>
            </div>

            <div className="info-divider">
              <span>Visit Our Branches</span>
            </div>

            <div className="info-branches">
              <a href="https://maps.app.goo.gl/3wAw79stEiGNyeWa9" target="_blank" rel="noopener noreferrer" className="info-branch anim-fade-up" style={{ animationDelay: '0.65s' }}>
                <div className="info-branch-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="info-branch-text">
                  <strong>Mumbai HQ</strong>
                  <span>Khardipada, Diva-Shil Road</span>
                </div>
                <span className="info-branch-cta">Get directions <i className="fas fa-chevron-right"></i></span>
              </a>
              <a href="https://maps.google.com/?q=TRP+Mall+Bopal+Ahmedabad" target="_blank" rel="noopener noreferrer" className="info-branch anim-fade-up" style={{ animationDelay: '0.75s' }}>
                <div className="info-branch-icon info-branch-icon-gold">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="info-branch-text">
                  <strong>Ahmedabad</strong>
                  <span>TRP Mall, Bopal</span>
                </div>
                <span className="info-branch-cta">Get directions <i className="fas fa-chevron-right"></i></span>
              </a>
            </div>

            <a
              href="tel:+919321812823"
              className="info-cta-phone anim-fade-up"
              style={{ animationDelay: '0.85s' }}
              onClick={() =>
                handleTrackedPhoneClick({
                  branch: 'mumbai',
                  cta: 'contact_page_call',
                  source: 'contact_page',
                })
              }
            >
              <span className="info-cta-pulse"></span>
              <i className="fas fa-phone"></i>
              <div>
                <span>Or call us now</span>
                <strong>+91 93218 12823</strong>
              </div>
            </a>
          </div>

          {/* Right: Form Card */}
          <div className="contact-form-card anim-fade-left" style={{ animationDelay: '0.2s' }}>
            {submitted ? (
              <div className="contact-success">
                <div className="success-circle">
                  <svg viewBox="0 0 52 52" className="success-svg">
                    <circle className="success-circle-path" cx="26" cy="26" r="25" fill="none" stroke="#a27341" strokeWidth="2" />
                    <path className="success-check" fill="none" stroke="#a27341" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 27L22 35L38 19" />
                  </svg>
                </div>
                <h2 className="success-title">Message Sent!</h2>
                <p className="success-text">Thank you for reaching out. Our team will contact you within 24 hours.</p>
                <button className="cpf-submit success-btn" onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', address: '', location: '', branch: '', projectType: '', message: '' }); }}>
                  <i className="fas fa-paper-plane"></i> Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="contact-form-header anim-fade-up" style={{ animationDelay: '0.05s' }}>
                  <h1>Get Free 3D Design &amp; Site Visit</h1>
                  <p>Tell us your service and location — we respond within 24 hours.</p>
                </div>

                <form className="contact-page-form" onSubmit={handleSubmit} onFocus={markFormStart}>
                  <div className="hp-field" aria-hidden="true">
                    <label htmlFor="company_url">Company URL</label>
                    <input type="text" id="company_url" name="company_url" tabIndex={-1} autoComplete="off" defaultValue="" />
                  </div>
                  <div className="cpf-section-label anim-fade-up" style={{ animationDelay: '0.1s' }}>
                    <span>Personal Details</span>
                  </div>

                  <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.15s' }}>
                    <div className={`floating-field ${isActive('name') ? 'active' : ''}`}>
                      <input
                        type="text"
                        id="contact-name"
                        className="cpf-input"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        autoComplete="name"
                        required
                      />
                      <label className="floating-label" htmlFor="contact-name">Your Name</label>
                    </div>
                  </div>

                  <div className="cpf-row">
                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.22s' }}>
                      <div className={`floating-field ${isActive('phone') ? 'active' : ''}`}>
                        <input
                          type="tel"
                          id="contact-phone"
                          className="cpf-input"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          onFocus={() => setFocused('phone')}
                          onBlur={() => setFocused(null)}
                          pattern="[0-9]{10}"
                          maxLength={10}
                          inputMode="numeric"
                          autoComplete="tel"
                          required
                        />
                        <label className="floating-label" htmlFor="contact-phone">Mobile Number</label>
                      </div>
                    </div>

                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.29s' }}>
                      <div className={`floating-field ${isActive('email') ? 'active' : ''}`}>
                        <input
                          type="email"
                          id="contact-email"
                          className="cpf-input"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          onFocus={() => setFocused('email')}
                          onBlur={() => setFocused(null)}
                          autoComplete="email"
                          required
                        />
                        <label className="floating-label" htmlFor="contact-email">Email Address</label>
                      </div>
                    </div>
                  </div>

                  <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.36s' }}>
                    <div className={`floating-field ${isActive('address') ? 'active' : ''}`}>
                      <textarea
                        id="contact-address"
                        className="cpf-input cpf-textarea-short"
                        rows={2}
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        onFocus={() => setFocused('address')}
                        onBlur={() => setFocused(null)}
                      />
                      <label className="floating-label" htmlFor="contact-address">Your Address <span className="cpf-optional">(site location for visit)</span></label>
                    </div>
                  </div>

                  <div className="cpf-section-label anim-fade-up" style={{ animationDelay: '0.4s' }}>
                    <span>Project Information</span>
                  </div>

                  <div className="cpf-row">
                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.43s' }}>
                      <div className={`floating-field ${isActive('location') ? 'active' : ''}`}>
                        <select
                          id="contact-location"
                          className="cpf-input cpf-select"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          onFocus={() => setFocused('location')}
                          onBlur={() => setFocused(null)}
                          required
                        >
                          <option value=""></option>
                          {locations.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                        <label className="floating-label" htmlFor="contact-location">Your Location</label>
                      </div>
                    </div>

                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.46s' }}>
                      <div className={`floating-field ${isActive('branch') ? 'active' : ''}`}>
                        <select
                          id="contact-branch"
                          className="cpf-input cpf-select"
                          value={form.branch}
                          onChange={(e) => setForm({ ...form, branch: e.target.value })}
                          onFocus={() => setFocused('branch')}
                          onBlur={() => setFocused(null)}
                        >
                          <option value=""></option>
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                        <label className="floating-label" htmlFor="contact-branch">Preferred Branch</label>
                      </div>
                    </div>
                  </div>

                  <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.5s' }}>
                    <div className={`floating-field ${isActive('projectType') ? 'active' : ''}`}>
                      <select
                        id="contact-service"
                        className="cpf-input cpf-select"
                        value={form.projectType}
                        onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                        onFocus={() => setFocused('projectType')}
                        onBlur={() => setFocused(null)}
                        required
                      >
                        <option value=""></option>
                        {projectTypes.map((type) => (
                          <option key={type} value={type.toLowerCase().replace(/[\s/]+/g, '-')}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <label className="floating-label" htmlFor="contact-service">Service Needed</label>
                    </div>
                  </div>

                  <div className="cpf-section-label anim-fade-up" style={{ animationDelay: '0.54s' }}>
                    <span>Your Message</span>
                  </div>

                  <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.57s' }}>
                    <div className={`floating-field ${isActive('message') ? 'active' : ''}`}>
                      <textarea
                        id="contact-message"
                        className="cpf-input cpf-textarea"
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        onFocus={() => setFocused('message')}
                        onBlur={() => setFocused(null)}
                        required
                      />
                      <label className="floating-label floating-label-textarea" htmlFor="contact-message">Tell us about your requirements…</label>
                    </div>
                  </div>

                  {error && (
                    <div className="cpf-error anim-fade-up" role="alert">
                      <i className="fas fa-exclamation-circle"></i>
                      Please fill all required fields, or try again. You can also WhatsApp / call us directly.
                    </div>
                  )}

                  <button type="submit" className="cpf-submit anim-fade-up" style={{ animationDelay: '0.64s' }} disabled={submitting}>
                    <span className="submit-content">
                      {submitting ? (
                        <>
                          <span className="cpf-spinner"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <span>Submit &amp; Open WhatsApp</span>
                          <i className="fab fa-whatsapp submit-arrow"></i>
                        </>
                      )}
                    </span>
                  </button>

                  <div className="cpf-footer anim-fade-up" style={{ animationDelay: '0.71s' }}>
                    <span className="cpf-security">
                      <i className="fas fa-lock"></i> Your information is secure & confidential
                    </span>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
