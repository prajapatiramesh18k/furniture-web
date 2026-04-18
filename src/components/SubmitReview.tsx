'use client';
import { useState } from 'react';

const propertyTypes = [
  { id: '1bhk', name: '1BHK' },
  { id: '2bhk', name: '2BHK' },
  { id: '3bhk', name: '3BHK' },
  { id: '4bhk', name: '4BHK+' },
  { id: 'villa', name: 'Villa' },
  { id: 'office', name: 'Office' },
];


const services = [
  'Modular Kitchen', 'Wardrobes', 'TV Units', 'Modular Bed',
  'False Ceiling', 'Pooja Unit', 'Shoe Rack', 'Crockery Unit',
  'Complete Interior',
];

interface SubmitReviewProps {
  onClose: () => void;
}

export default function SubmitReview({ onClose }: SubmitReviewProps) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    rating: 5,
    text: '',
    propertyType: '',
    completedDate: '',
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.text || !form.propertyType) {
      setError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          location: form.location || 'Belapur, Navi Mumbai',
          rating: form.rating,
          text: form.text,
          photo,
          date: new Date().toLocaleDateString(),
          approved: false,
          propertyType: form.propertyType,
          services: selectedServices,
          completedDate: form.completedDate || new Date().toLocaleDateString(),
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => onClose(), 2000);
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="service-modal active">
      <div className="service-modal-content" style={{ maxWidth: '60rem', width: '95vw' }}>
        <div className="modal-header">
          <h2>Share Your Experience</h2>
          <span className="modal-close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {success ? (
            <div className="review-success">
              <div className="review-success-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" stroke="#28a745" strokeWidth="4" strokeDasharray="240" strokeDashoffset="0" className="success-circle"/>
                  <path d="M24 40L35 51L56 30" stroke="#28a745" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="success-check"/>
                </svg>
              </div>
              <h3>Thank You!</h3>
              <p>Your review has been submitted successfully.</p>
              <span className="review-success-note">
                <i className="fas fa-info-circle"></i> Your review will be visible after admin approval.
              </span>
            </div>
          ) : (
            <form id="review-form" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. Belapur, Navi Mumbai"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              {/* Property Type */}
              <div className="form-group">
                <label>Property Type *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '0.5rem' }}>
                  {propertyTypes.map(pt => (
                    <button
                      key={pt.id}
                      type="button"
                      className={`btn ${form.propertyType === pt.id ? '' : 'btn-outline'}`}
                      style={form.propertyType === pt.id ? {
                        background: '#a27341',
                        color: '#fff',
                        border: '2px solid #a27341'
                      } : {
                        background: 'transparent',
                        color: '#a27341',
                        border: '2px solid #a27341',
                        padding: '0.6rem 1.2rem'
                      }}
                      onClick={() => setForm({ ...form, propertyType: pt.id })}
                    >
                      {pt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="form-group">
                <label>Furniture & Services Done</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {services.map(service => (
                    <button
                      key={service}
                      type="button"
                      style={selectedServices.includes(service) ? {
                        background: '#a27341',
                        color: '#fff',
                        border: '1px solid #a27341',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '1.1rem'
                      } : {
                        background: 'transparent',
                        color: '#666',
                        border: '1px solid #ddd',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '1.1rem'
                      }}
                      onClick={() => toggleService(service)}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div className="form-group">
                <label>Rating</label>
                <div className="star-rating" id="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fas fa-star ${star <= (hoverRating || form.rating) ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ fontSize: '2.4rem', cursor: 'pointer', color: star <= (hoverRating || form.rating) ? '#a27341' : '#ccc' }}
                    />
                  ))}
                </div>
              </div>

              {/* Review */}
              <div className="form-group">
                <label>Your Review *</label>
                <textarea
                  rows={4}
                  placeholder="Share your experience — what furniture did you get done? How was the quality and service?"
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  required
                />
              </div>

              {/* Photo Upload */}
              <div className="form-group">
                <label>Add Photo (optional)</label>
                {photo ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={photo} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                    <button
                      type="button"
                      onClick={() => { setPhoto(''); setPhotoFile(null); }}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer'
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: 'block',
                    padding: '2rem',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: '#666'
                  }}>
                    <i className="fas fa-camera" style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                    <p>Upload your photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>

              {error && (
                <p style={{ color: '#e74c3c', fontSize: '1.4rem', marginBottom: '1rem' }}>{error}</p>
              )}
              <button
                type="submit"
                className="btn"
                disabled={submitting || !form.propertyType}
                style={{ width: '100%', padding: '1.2rem', marginTop: '1rem' }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
