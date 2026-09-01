'use client';
import { useState, useEffect } from 'react';
import { openQuoteWhatsApp } from '@/lib/quote-whatsapp';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', projectType: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const projectTypes = [
    'Living Room Furniture',
    'Bedroom Furniture',
    'Modular Kitchen',
    'Office Furniture',
    'Kids Room Furniture',
    'Dining Room Furniture',
    'Storage Solutions',
    'Custom Wardrobes',
    'TV Units & Cabinets',
    'Doors & Windows',
    'False Ceiling',
    'Interior Design',
    'Other',
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setForm({ ...form, phone: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.projectType || !form.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (form.phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    const submittedData = { ...form };
    const projectTypeLabel =
      projectTypes.find(
        (type) => type.toLowerCase().replace(/\s+/g, '-') === submittedData.projectType
      ) || submittedData.projectType;

    setSubmitting(true);

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittedData),
      });

      if (!res.ok) {
        alert('Could not save your request. Please try again.');
        return;
      }

      // DB save confirmed — open WhatsApp with the exact submitted details
      openQuoteWhatsApp({
        name: submittedData.name.trim(),
        phone: submittedData.phone,
        email: submittedData.email.trim(),
        projectType: projectTypeLabel,
        message: submittedData.message.trim(),
      });

      setSubmitted(true);
      setForm({ name: '', phone: '', email: '', projectType: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Could not save your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="contact-section" id="contact" suppressHydrationWarning>
      {/* Decorative Elements */}
      <div className="contact-decor">
        <div className="decor-circle decor-circle-1"></div>
        <div className="decor-circle decor-circle-2"></div>
        <div className="decor-dots decor-dots-1"></div>
        <div className="decor-dots decor-dots-2"></div>
      </div>

      <div className="contact-container">
        {/* Left Side - Info */}
        <div className="contact-info">
          <div className="contact-info-bg">
            <div className="info-bg-pattern"></div>
          </div>

          <div className="contact-badge">
            <span className="badge-icon"><i className="fas fa-comments"></i></span>
            <span>Get In Touch</span>
          </div>

          <h2 className="contact-title">
            Let's Create Your <span className="highlight">Dream Furniture</span> Together
          </h2>

          <p className="contact-description">
            Have a furniture project in mind? Our expert craftsmen are ready to bring your vision to life with precision and care.
          </p>

          <div className="contact-stats">
            <div className="stat-item">
              <span className="stat-number">14+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>

          <div className="contact-details">
            <div className="contact-detail-card">
              <div className="detail-card-icon">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div className="detail-card-content">
                <span className="detail-label">Call Us</span>
                <span className="detail-value">+91 93218 12823</span>
              </div>
            </div>

            <div className="contact-detail-card">
              <div className="detail-card-icon">
                <i className="fas fa-envelope-open-text"></i>
              </div>
              <div className="detail-card-content">
                <span className="detail-label">Email Us</span>
                {mounted ? (
                  <a href="mailto:ananyahouseoffurniture@gmail.com" className="detail-value">ananyahouseoffurniture@gmail.com</a>
                ) : (
                  <span className="detail-value">ananyahouseoffurniture@gmail.com</span>
                )}
              </div>
            </div>

            <div className="contact-detail-card">
              <div className="detail-card-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="detail-card-content">
                <span className="detail-label">Visit Us</span>
                <span className="detail-value">Thane, Maharashtra, India</span>
              </div>
            </div>

            <div className="contact-detail-card">
              <div className="detail-card-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="detail-card-content">
                <span className="detail-label">Working Hours</span>
                <span className="detail-value">Mon - Sat: 9AM - 7PM</span>
              </div>
            </div>
          </div>

          <div className="contact-social-section">
            <span className="social-label">Follow Us</span>
            <div className="contact-social">
              <a href="https://www.instagram.com/ananyahouseoffurniture" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-instagram"></i>
                <span>Instagram</span>
              </a>
              <a href="https://www.facebook.com/share/18eDGjuM47/" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-facebook-f"></i>
                <span>Facebook</span>
              </a>
              <a href="https://wa.me/919321812823" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                <i className="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="contact-form-wrapper">
          <div className="contact-form-card">
            <div className="form-card-accent"></div>

            <div className="contact-form-header">
              <div className="header-icon">
                <i className="fas fa-pen-fancy"></i>
              </div>
              <h3>Send Us a Message</h3>
              <p>Fill in the form below and we'll get back to you within 24 hours.</p>
            </div>

            {submitted ? (
              <div className="contact-success-message">
                <div className="success-animation">
                  <div className="success-circle">
                    <i className="fas fa-check"></i>
                  </div>
                </div>
                <h4>Message Sent Successfully!</h4>
                <p>Thank you for reaching out. Our team will contact you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="reset-btn">
                  <i className="fas fa-plus"></i> Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-input-wrap">
                    <i className="fas fa-user"></i>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-input-wrap">
                    <i className="fas fa-phone-alt"></i>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-input-wrap">
                    <i className="fas fa-envelope"></i>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-input-wrap">
                    <i className="fas fa-cube"></i>
                    <select
                      value={form.projectType}
                      onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                      required
                    >
                      <option value="">What are you looking for?</option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-input-wrap textarea-wrap">
                  <i className="fas fa-comment-alt"></i>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your requirements, space dimensions, preferred materials, or any questions you have…"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-footer">
                  <div className="form-trust">
                    <i className="fas fa-shield-alt"></i>
                    <span>Your information is secure & confidential</span>
                  </div>

                  <button type="submit" className="contact-submit-btn" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="btn-loader"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span>Submit &amp; Open WhatsApp</span>
                        <i className="fab fa-whatsapp"></i>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
