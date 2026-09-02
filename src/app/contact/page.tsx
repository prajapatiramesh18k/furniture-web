'use client';
import CloseButton from '@/components/CloseButton';
import { useState, useEffect } from 'react';
import { handleTrackedPhoneClick } from '@/lib/analytics';
import { openQuoteWhatsApp } from '@/lib/quote-whatsapp';

const projectTypes = [
  '1 BHK',
  '2 BHK',
  '3 BHK',
  '4 BHK / Villa',
  'Office',
  'Shop / Retail',
  'Restaurant',
  'Showroom',
  'Modular Kitchen',
  'Pooja Unit',
  'Custom Furniture',
  'Other',
];

const branches = [
  { id: 'mumbai', name: 'Mumbai (Head Office)' },
  { id: 'ahmedabad', name: 'Ahmedabad' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', branch: '', projectType: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Send Us a Message | Ananya House of Furniture';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      const branch = params.get('branch');
      if (type) {
        setForm((f) => ({ ...f, projectType: type }));
      }
      if (branch) {
        setForm((f) => ({ ...f, branch }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!form.name.trim() || !form.email.trim() || !form.projectType || !form.message.trim()) {
      setError(true);
      setSubmitting(false);
      return;
    }
    if (phoneDigits.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      setSubmitting(false);
      return;
    }

    const submittedData = {
      name: form.name.trim(),
      phone: phoneDigits,
      email: form.email.trim(),
      address: form.address.trim(),
      branch: form.branch,
      projectType: form.projectType,
      message: form.message.trim(),
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

      // DB save confirmed — open WhatsApp with the exact submitted details
      openQuoteWhatsApp(submittedData, {
        source: 'contact_page',
        cta: 'contact_page_whatsapp',
      });
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
                <span className="info-stat-num">5000+</span>
                <span className="info-stat-label">Happy Homes</span>
              </div>
              <div className="info-stat anim-fade-up" style={{ animationDelay: '0.4s' }}>
                <span className="info-stat-num">14+</span>
                <span className="info-stat-label">Years</span>
              </div>
              <div className="info-stat anim-fade-up" style={{ animationDelay: '0.5s' }}>
                <span className="info-stat-num">5★</span>
                <span className="info-stat-label">Rated</span>
              </div>
              <div className="info-stat anim-fade-up" style={{ animationDelay: '0.6s' }}>
                <span className="info-stat-num">24h</span>
                <span className="info-stat-label">Response</span>
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
              href="tel:+918318727813"
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
                <strong>+91 83187 27813</strong>
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
                <button className="cpf-submit success-btn" onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', address: '', branch: '', projectType: '', message: '' }); }}>
                  <i className="fas fa-paper-plane"></i> Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="contact-form-header anim-fade-up" style={{ animationDelay: '0.05s' }}>
                  <h1>Send Us a Message</h1>
                  <p>Tell us about your project — our team will respond within 24 hours.</p>
                </div>

                <form className="contact-page-form" onSubmit={handleSubmit}>
                  <div className="cpf-section-label anim-fade-up" style={{ animationDelay: '0.1s' }}>
                    <span>Personal Details</span>
                  </div>

                  <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.15s' }}>
                    <div className={`floating-field ${isActive('name') ? 'active' : ''}`}>
                      <input
                        type="text"
                        className="cpf-input"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        required
                      />
                      <label className="floating-label">Your Name</label>
                    </div>
                  </div>

                  <div className="cpf-row">
                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.22s' }}>
                      <div className={`floating-field ${isActive('phone') ? 'active' : ''}`}>
                        <input
                          type="tel"
                          className="cpf-input"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          onFocus={() => setFocused('phone')}
                          onBlur={() => setFocused(null)}
                          pattern="[0-9]{10}"
                          maxLength={10}
                          required
                        />
                        <label className="floating-label">Mobile Number</label>
                      </div>
                    </div>

                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.29s' }}>
                      <div className={`floating-field ${isActive('email') ? 'active' : ''}`}>
                        <input
                          type="email"
                          className="cpf-input"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          onFocus={() => setFocused('email')}
                          onBlur={() => setFocused(null)}
                          required
                        />
                        <label className="floating-label">Email Address</label>
                      </div>
                    </div>
                  </div>

                  <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.36s' }}>
                    <div className={`floating-field ${isActive('address') ? 'active' : ''}`}>
                      <textarea
                        className="cpf-input cpf-textarea-short"
                        rows={2}
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        onFocus={() => setFocused('address')}
                        onBlur={() => setFocused(null)}
                      />
                      <label className="floating-label">Your Address <span className="cpf-optional">(site location for visit)</span></label>
                    </div>
                  </div>

                  <div className="cpf-section-label anim-fade-up" style={{ animationDelay: '0.4s' }}>
                    <span>Project Information</span>
                  </div>

                  <div className="cpf-row">
                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.43s' }}>
                      <div className={`floating-field ${isActive('branch') ? 'active' : ''}`}>
                        <select
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
                        <label className="floating-label">Preferred Branch</label>
                      </div>
                    </div>

                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.5s' }}>
                      <div className={`floating-field ${isActive('projectType') ? 'active' : ''}`}>
                        <select
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
                        <label className="floating-label">Project Type</label>
                      </div>
                    </div>
                  </div>

                  <div className="cpf-section-label anim-fade-up" style={{ animationDelay: '0.54s' }}>
                    <span>Your Message</span>
                  </div>

                  <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.57s' }}>
                    <div className={`floating-field ${isActive('message') ? 'active' : ''}`}>
                      <textarea
                        className="cpf-input cpf-textarea"
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        onFocus={() => setFocused('message')}
                        onBlur={() => setFocused(null)}
                        required
                      />
                      <label className="floating-label floating-label-textarea">Tell us about your requirements…</label>
                    </div>
                  </div>

                  {error && (
                    <div className="cpf-error anim-fade-up">
                      <i className="fas fa-exclamation-circle"></i>
                      Something went wrong. Please try again or contact us directly.
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
