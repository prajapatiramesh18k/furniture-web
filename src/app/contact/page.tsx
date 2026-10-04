'use client';
import CloseButton from '@/components/CloseButton';
import UIDropdown from '@/components/UIDropdown';
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
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    // Clear the top-level message once the user starts fixing the form
    setError(null);
  };

  // Phone rule: exactly 10 digits (Indian mobile). Accepts pasted
  // "+91 ...", "0...", spaces/dashes — normalizes to 10 digits, never 12.
  const sanitizePhoneInput = (raw: string) => {
    let digits = raw.replace(/\D/g, '');
    // Drop +91 / 91 prefix if user pastes it ("919348768901" -> "9348768901")
    if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
    // Drop trunk 0 prefix ("09876543210" -> "9876543210")
    else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits.slice(0, 10);
  };

  const normalizePhone = (raw: string) => sanitizePhoneInput(raw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const formEl = e.target as HTMLFormElement;
    const honey = (formEl.elements.namedItem('company_url') as HTMLInputElement | null)?.value;
    if (honey) {
      setSubmitting(false);
      setSubmitted(true);
      return;
    }

    // Field-by-field validation so the user sees exactly what is missing.
    const nextFieldErrors: Record<string, string> = {};
    const emailValue = form.email.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    const phoneDigits = normalizePhone(form.phone);

    if (!form.name.trim()) nextFieldErrors.name = 'Please enter your name.';
    if (!form.phone.trim()) {
      nextFieldErrors.phone = 'Please enter your mobile number.';
    } else if (phoneDigits.length !== 10) {
      nextFieldErrors.phone = 'Mobile number must be exactly 10 digits (without +91).';
    } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      nextFieldErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (!emailValue) {
      nextFieldErrors.email = 'Please enter your email address.';
    } else if (!emailValid) {
      nextFieldErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }
    if (!form.location) nextFieldErrors.location = 'Please select your location.';
    if (!form.projectType) nextFieldErrors.projectType = 'Please select a service.';
    if (!form.message.trim()) nextFieldErrors.message = 'Please tell us about your requirement.';

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      // Show the most actionable message at the top (email first if that is the problem).
      const priority = ['email', 'phone', 'name', 'location', 'projectType', 'message'];
      const firstKey = priority.find((k) => nextFieldErrors[k]) || Object.keys(nextFieldErrors)[0];
      setError(nextFieldErrors[firstKey]);
      setSubmitting(false);
      // Move focus to the first invalid field for quick correction.
      requestAnimationFrame(() => {
        const target = document.getElementById(
          firstKey === 'projectType'
            ? 'contact-service'
            : firstKey === 'name'
              ? 'contact-name'
              : firstKey === 'phone'
                ? 'contact-phone'
                : firstKey === 'email'
                  ? 'contact-email'
                  : firstKey === 'message'
                    ? 'contact-message'
                    : firstKey === 'location'
                      ? 'contact-location'
                      : ''
        );
        target?.focus?.();
      });
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
        const data = await response.json().catch(() => null);
        setError(
          (data as { error?: string } | null)?.error ||
            'Could not send your message. Please check the highlighted fields or WhatsApp / call us directly.'
        );
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
      setError('Something went wrong while sending. Please try again, or WhatsApp / call us directly.');
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
                <img src="/images/contact.png" alt="Ananya House of Furniture showroom" width={640} height={480} loading="lazy" decoding="async" />
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
                  <h2>Get Free 3D Design &amp; Site Visit</h2>
                  <p>Tell us your service and location — we respond within 24 hours.</p>
                </div>

                <form className="contact-page-form" onSubmit={handleSubmit} onFocus={markFormStart} noValidate>
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
                        className={`cpf-input${fieldErrors.name ? ' cpf-input-error' : ''}`}
                        value={form.name}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); clearFieldError('name'); }}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        autoComplete="name"
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                      />
                      <label className="floating-label" htmlFor="contact-name">Your Name *</label>
                    </div>
                    {fieldErrors.name && <p id="contact-name-error" className="cpf-field-error" role="alert">{fieldErrors.name}</p>}
                  </div>

                  <div className="cpf-row">
                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.22s' }}>
                      <div className={`floating-field cpf-phone-wrap ${isActive('phone') ? 'active' : ''}`}>
                        <span className="cpf-phone-prefix" aria-hidden="true">+91</span>
                        <input
                          type="tel"
                          id="contact-phone"
                          className={`cpf-input cpf-phone-input${fieldErrors.phone ? ' cpf-input-error' : ''}`}
                          value={form.phone}
                          onChange={(e) => { setForm({ ...form, phone: sanitizePhoneInput(e.target.value) }); clearFieldError('phone'); }}
                          onFocus={() => setFocused('phone')}
                          onBlur={() => setFocused(null)}
                          maxLength={10}
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder=" "
                          aria-invalid={!!fieldErrors.phone}
                          aria-describedby={fieldErrors.phone ? 'contact-phone-error' : 'contact-phone-hint'}
                        />
                        <label className="floating-label cpf-phone-label" htmlFor="contact-phone">Mobile Number *</label>
                      </div>
                      {fieldErrors.phone
                        ? <p id="contact-phone-error" className="cpf-field-error" role="alert">{fieldErrors.phone}</p>
                        : <p id="contact-phone-hint" className="cpf-field-hint">10 digits, without +91 — e.g. 98765 43210</p>}
                    </div>

                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.29s' }}>
                      <div className={`floating-field ${isActive('email') ? 'active' : ''}`}>
                        <input
                          type="email"
                          id="contact-email"
                          className={`cpf-input${fieldErrors.email ? ' cpf-input-error' : ''}`}
                          value={form.email}
                          onChange={(e) => { setForm({ ...form, email: e.target.value }); clearFieldError('email'); }}
                          onFocus={() => setFocused('email')}
                          onBlur={() => setFocused(null)}
                          autoComplete="email"
                          aria-invalid={!!fieldErrors.email}
                          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                        />
                        <label className="floating-label" htmlFor="contact-email">Email Address *</label>
                      </div>
                      {fieldErrors.email && <p id="contact-email-error" className="cpf-field-error" role="alert">{fieldErrors.email}</p>}
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
                        <UIDropdown
                          label="Your Location *"
                          variant="cpf"
                          value={form.location}
                          placeholder=""
                          options={locations}
                          onChange={(v) => { setForm({ ...form, location: v }); clearFieldError('location'); }}
                          onFocus={() => setFocused('location')}
                          onBlur={() => setFocused(null)}
                        />
                        <label className="floating-label">Your Location *</label>
                      </div>
                      {fieldErrors.location && <p className="cpf-field-error" role="alert">{fieldErrors.location}</p>}
                    </div>

                    <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.46s' }}>
                      <div className={`floating-field ${isActive('branch') ? 'active' : ''}`}>
                        <UIDropdown
                          label="Preferred Branch"
                          variant="cpf"
                          value={form.branch}
                          placeholder=""
                          options={branches.map((b) => ({ value: b.id, label: b.name }))}
                          onChange={(v) => setForm({ ...form, branch: v })}
                          onFocus={() => setFocused('branch')}
                          onBlur={() => setFocused(null)}
                        />
                        <label className="floating-label">Preferred Branch</label>
                      </div>
                    </div>
                  </div>

                  <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.5s' }}>
                      <div className={`floating-field ${isActive('projectType') ? 'active' : ''}`}>
                        <UIDropdown
                          label="Service Needed *"
                          variant="cpf"
                          value={projectTypes.some((t) => t.toLowerCase().replace(/[\s/]+/g, '-') === form.projectType) ? form.projectType : ''}
                          placeholder=""
                          options={projectTypes.map((type) => ({
                            value: type.toLowerCase().replace(/[\s/]+/g, '-'),
                            label: type,
                          }))}
                          onChange={(v) => { setForm({ ...form, projectType: v }); clearFieldError('projectType'); }}
                          onFocus={() => setFocused('projectType')}
                          onBlur={() => setFocused(null)}
                        />
                      <label className="floating-label" htmlFor="contact-service">Service Needed *</label>
                    </div>
                    {fieldErrors.projectType && <p className="cpf-field-error" role="alert">{fieldErrors.projectType}</p>}
                  </div>

                  <div className="cpf-section-label anim-fade-up" style={{ animationDelay: '0.54s' }}>
                    <span>Your Message</span>
                  </div>

                  <div className="cpf-field anim-fade-up" style={{ animationDelay: '0.57s' }}>
                    <div className={`floating-field ${isActive('message') ? 'active' : ''}`}>
                      <textarea
                        id="contact-message"
                        className={`cpf-input cpf-textarea${fieldErrors.message ? ' cpf-input-error' : ''}`}
                        rows={4}
                        value={form.message}
                        onChange={(e) => { setForm({ ...form, message: e.target.value }); clearFieldError('message'); }}
                        onFocus={() => setFocused('message')}
                        onBlur={() => setFocused(null)}
                        aria-invalid={!!fieldErrors.message}
                        aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                      />
                      <label className="floating-label floating-label-textarea" htmlFor="contact-message">Tell us about your requirements… *</label>
                    </div>
                    {fieldErrors.message && <p id="contact-message-error" className="cpf-field-error" role="alert">{fieldErrors.message}</p>}
                  </div>

                  {error && (
                    <div className="cpf-error anim-fade-up" role="alert">
                      <i className="fas fa-exclamation-circle"></i>
                      {error}
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
