'use client';
import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', projectType: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const projectTypes = [
    'Living Room Furniture',
    'Bedroom Furniture',
    'Office Furniture',
    'Outdoor Furniture',
    'Specialty Furniture',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('number', form.phone);
      formData.append('email', form.email);
      formData.append('project-type', form.projectType);
      formData.append('message', form.message);

      await fetch('https://script.google.com/macros/s/AKfycbzx8c0Uz_wWEjQTKsriT6HUw2amjdnMVTJDiLQMjXhNqFNE1GALPuQepEjoSGmN5bYaSA/exec', {
        method: 'POST',
        body: formData,
      });

      alert('Thank you! We will contact you within 24 hours.');
      setForm({ name: '', phone: '', email: '', projectType: '', message: '' });
    } catch (error) {
      alert('Thank you! We will contact you within 24 hours.');
    }
    setSubmitting(false);
  };

  return (
    <section className="contact" id="contact">
      <h1 className="heading"> <span>contact</span> us</h1>
      <div className="row">
        <div className="image">
          <img src="images/contact.png" alt="Contact" />
        </div>
        <form onSubmit={handleSubmit}>
          <h3>get in touch</h3>
          <span>Name</span>
          <input
            type="text"
            className="box"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <span>Phone Number</span>
          <input
            type="number"
            className="box"
            name="number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <span>Email</span>
          <input
            type="email"
            className="box"
            name="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <span>work type</span>
          <select
            className="box"
            name="project-type"
            id="project-type"
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
          <span>Message</span>
          <textarea
            className="box"
            name="message"
            cols={30}
            rows={10}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          ></textarea>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Sending...' : 'send message'}
          </button>
        </form>
      </div>
    </section>
  );
}
