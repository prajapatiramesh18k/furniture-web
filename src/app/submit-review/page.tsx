'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitReviewPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', location: '', rating: 5, text: '' });
  const [photo, setPhoto] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

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
    if (!form.name || !form.text) return;
    setLoading(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          location: form.location || 'India',
          rating: form.rating,
          text: form.text,
          photo,
          date: new Date().toLocaleDateString(),
          approved: false,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <div className="sr-grain" />
        <div className="sr-success">
          <div className="sr-success-check">
            <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="26" cy="26" r="25" stroke="#a27341" strokeWidth="2"/>
              <path className="sr-check-path" d="M14 27L22 35L38 19" stroke="#a27341" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="sr-success-label">Thank you</span>
          <h2>Your review has been submitted</h2>
          <p>It will appear on the website after our team reviews and approves it.</p>
          <button className="sr-btn-primary" onClick={() => router.push('/')}>
            Back to Home
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="sr-grain" />

      <div className="sr-layout">
        {/* Left panel */}
        <div className="sr-left">
          <a href="/" className="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </a>

          <div className="sr-left-content">
            <div className="sr-brand-mark">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="6" fill="#a27341"/>
                <path d="M8 20V10L14 7l6 3v10" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M11 20v-5h6v5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span>Ananya House of Furniture</span>
            </div>

            <div className="sr-headline-block">
              <h1>Share your<br />experience</h1>
              <p>Your words help other families discover furniture crafted with care. Every review is a story of a home being made.</p>
            </div>

            <div className="sr-testimonial-preview">
              <div className="sr-tp-quote">
                <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                  <path d="M0 20V12.267C0 5.333 4.267 1.333 12.8 0l1.067 2.133C10.133 3.067 8 5.067 7.733 7.733H9.6V20H0ZM14.4 20V12.267c0-6.934 4.267-10.934 12.8-12.267L28.267 4C23.467 5.067 21.333 7.067 21.067 9.733H22.933V20H14.4Z" fill="#a27341" fillOpacity="0.15"/>
                </svg>
                <p>The quality of their pooja unit exceeded our expectations. Truly a piece of art.</p>
              </div>
              <div className="sr-tp-author">
                <div className="sr-tp-avatar">PS</div>
                <div>
                  <strong>Priya S.</strong>
                  <span>Mumbai</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Form */}
        <div className="sr-right">
          <form className="sr-form" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="sr-field">
              <label className="sr-label">Your Name</label>
              <input
                type="text"
                className="sr-input"
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Location */}
            <div className="sr-field">
              <label className="sr-label">Location <span className="sr-optional">(optional)</span></label>
              <input
                type="text"
                className="sr-input"
                placeholder="e.g. Thane, Mumbai"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>

            {/* Star Rating */}
            <div className="sr-field">
              <label className="sr-label">Your Rating</label>
              <div className="sr-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`sr-star ${star <= (hoverRating || form.rating) ? 'active' : ''}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setForm({ ...form, rating: star })}
                    aria-label={`Rate ${star} stars`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={star <= (hoverRating || form.rating) ? '#a27341' : 'none'}
                        stroke={star <= (hoverRating || form.rating) ? '#a27341' : '#c4b5a0'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ))}
                <span className="sr-star-text">
                  {form.rating === 5 ? 'Excellent' : form.rating === 4 ? 'Very Good' : form.rating === 3 ? 'Good' : form.rating === 2 ? 'Fair' : 'Poor'}
                </span>
              </div>
            </div>

            {/* Review */}
            <div className="sr-field">
              <label className="sr-label">Your Review</label>
              <textarea
                className="sr-textarea"
                placeholder="Tell us about your experience — what you loved, how it fits your home, the quality of craftsmanship..."
                rows={5}
                value={form.text}
                onChange={e => setForm({ ...form, text: e.target.value })}
                required
              />
              <span className="sr-char-count">{form.text.length} characters</span>
            </div>

            {/* Photo Upload */}
            <div className="sr-field">
              <label className="sr-label">Add a Photo <span className="sr-optional">(optional)</span></label>
              {photo ? (
                <div className="sr-photo-preview">
                  <img src={photo} alt="Preview" />
                  <button type="button" className="sr-photo-remove" onClick={() => { setPhoto(''); setPhotoFile(null); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="sr-photo-upload">
                  <div className="sr-photo-upload-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a27341" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="3" strokeDasharray="4 2"/>
                      <circle cx="8.5" cy="8.5" r="1.5" fill="#a27341"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                  <span>Click to upload a photo of your furniture</span>
                  <span className="sr-photo-hint">JPG, PNG up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="sr-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="sr-spinner" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Review
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
