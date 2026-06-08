'use client';
import CloseButton from '@/components/CloseButton';
import { useState, useEffect } from 'react';

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

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', projectType: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

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
        setForm((f) => ({ ...f, message: `Interested in ${branch} branch. ` + f.message }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          projectType: form.projectType,
          message: form.message,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="contact-page">
      <div className="contact-page-hero">
        <CloseButton href="/" />
      </div>

      <div className="contact-page-layout-simple">
        <div className="contact-page-form-wrap-simple">
          {submitted ? (
            <div className="contact-success">
              <div className="contact-success-icon">
                <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="26" cy="26" r="25" stroke="#a27341" strokeWidth="2"/>
                  <path d="M14 27L22 35L38 19" stroke="#a27341" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>Message Sent!</h2>
              <p>Thank you for reaching out. Our team will contact you within 24 hours.</p>
              <button className="btn" onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', address: '', projectType: '', message: '' }); }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h1>Send Us a Message</h1>
              <p className="contact-form-subtitle">Fill in the form below and we'll get back to you within 24 hours.</p>

              <form className="contact-page-form" onSubmit={handleSubmit}>
                <div className="cpf-field">
                  <input
                    type="text"
                    className="cpf-input"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="cpf-field">
                  <input
                    type="tel"
                    className="cpf-input"
                    placeholder="Enter 10-digit mobile number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="cpf-field">
                  <input
                    type="email"
                    className="cpf-input"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="cpf-field">
                  <textarea
                    className="cpf-textarea cpf-textarea-short"
                    placeholder="Enter your address (site location for visit)"
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                <div className="cpf-field">
                  <label className="cpf-label">What are you looking for?</label>
                  <select
                    className="cpf-select"
                    value={form.projectType}
                    onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                    required
                  >
                    <option value="">Select a project type...</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type.toLowerCase().replace(/[\s/]+/g, '-')}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cpf-field">
                  <textarea
                    className="cpf-textarea"
                    placeholder="Tell us about your requirements, space dimensions, preferred materials, or any questions you have…"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                {error && (
                  <div className="cpf-error">
                    <i className="fas fa-exclamation-circle"></i>
                    Something went wrong. Please try again or contact us directly.
                  </div>
                )}

                <button type="submit" className="cpf-submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="cpf-spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </button>

                <p className="cpf-security">
                  <i className="fas fa-lock"></i> Your information is secure & confidential
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
