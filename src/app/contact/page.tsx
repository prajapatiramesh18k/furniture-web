'use client';
import CloseButton from '@/components/CloseButton';
import { useState, useEffect } from 'react';

const contactInfo = {
  phone: '+91-9321812823',
  phone2: '+91-8318727813',
  email: 'contact@ananyahouseoffurniture.com',
  address: 'Diva-Shil Road, Khardipada, Thane, Maharashtra, India - 400612',
  mapLink: 'https://maps.app.goo.gl/3wAw79stEiGNyeWa9',
  hours: 'Mon - Sat: 10:00 AM - 8:00 PM',
};

const projectTypes = [
  'Living Room Furniture',
  'Bedroom Furniture',
  'Dining Room Furniture',
  'Office Furniture',
  'Outdoor Furniture',
  'Pooja Unit',
  'Modular Kitchen',
  'Custom Furniture',
  'Repair & Restoration',
  'Other',
];

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Ananya House of Furniture | Contact';
  }, []);

  const [form, setForm] = useState({ name: '', phone: '', email: '', projectType: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

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
        <h1>Contact <span>Us</span></h1>
        <p>Have a question or want to start a project? We would love to hear from you.</p>
      </div>

      <div className="contact-page-layout">
        {/* Left - Image + Info */}
        <div className="contact-page-left">
          <div className="contact-page-img-wrap">
            <img src="/images/contact.png" alt="Contact Ananya House of Furniture" />
            <div className="contact-page-img-overlay">
              <div className="contact-overlay-content">
                <h2>Ananya House of Furniture</h2>
                <p>Crafting homes, one piece at a time since 2012.</p>
              </div>
            </div>
          </div>

          <div className="contact-page-info">
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <h4>Visit Us</h4>
                <p>{contactInfo.address}</p>
                <a href={contactInfo.mapLink} target="_blank" rel="noopener noreferrer">Get Directions</a>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fas fa-phone"></i>
              </div>
              <div>
                <h4>Call Us</h4>
                <p><a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a></p>
                <p><a href={`tel:${contactInfo.phone2}`}>{contactInfo.phone2}</a></p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <h4>Email Us</h4>
                <p><a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div>
                <h4>Working Hours</h4>
                <p>{contactInfo.hours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="contact-page-right">
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
              <button className="btn" onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', projectType: '', message: '' }); }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="contact-page-form-wrap">
              <h2>Get in Touch</h2>
              <p className="contact-form-subtitle">Fill out the form below and we will get back to you shortly.</p>

              <form className="contact-page-form" onSubmit={handleSubmit}>
                <div className="cpf-row">
                  <div className="cpf-field">
                    <label>Your Name</label>
                    <input
                      type="text"
                      className="cpf-input"
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cpf-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className="cpf-input"
                      placeholder="e.g. +91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="cpf-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="cpf-input"
                    placeholder="e.g. rahul@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="cpf-field">
                  <label>What are you looking for?</label>
                  <select
                    className="cpf-select"
                    value={form.projectType}
                    onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                    required
                  >
                    <option value="">Select a service...</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cpf-field">
                  <label>Your Message</label>
                  <textarea
                    className="cpf-textarea"
                    placeholder="Tell us about your requirements, space dimensions, preferred materials, or any questions you have..."
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
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
