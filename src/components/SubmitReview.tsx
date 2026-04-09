'use client';
import { useState } from 'react';

interface SubmitReviewProps {
  onClose: () => void;
}

export default function SubmitReview({ onClose }: SubmitReviewProps) {
  const [form, setForm] = useState({ name: '', location: '', rating: 5, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      <div className="service-modal-content" style={{ maxWidth: '55rem', width: '95vw' }}>
        <div className="modal-header">
          <h2>Submit Your Review</h2>
          <span className="modal-close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
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
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. Thane, Mumbai"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rating</label>
                <div className="star-rating" id="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fas fa-star ${star <= form.rating ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, rating: star })}
                      style={{ fontSize: '2.4rem', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  rows={4}
                  placeholder="Share your experience with us..."
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  required
                />
              </div>
              {error && (
                <p style={{ color: '#e74c3c', fontSize: '1.4rem', marginBottom: '1rem' }}>{error}</p>
              )}
              <button type="submit" className="btn" disabled={submitting} style={{ width: '100%', padding: '1.2rem' }}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
