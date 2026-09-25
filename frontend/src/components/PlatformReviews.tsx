'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface Review {
  id: string;
  name: string;
  rating: number;
  feedback: string;
  profession?: string;
  createdAt?: string;
}

export function PlatformReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    profession: '',
    rating: 5,
    feedback: ''
  });

  useEffect(() => {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    fetch(`${apiBase}/api/public/reviews`).then(r => r.json()).then(data => setReviews(data.data || [])).catch(() => setReviews([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.feedback.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      const response = await fetch(`${apiBase}/api/public/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Review submission failed');
      setSubmitted(true);
    } catch {
      setErrorMsg('Review could not be submitted. Please try again.');
    }
        setSubmitted(true);
    setIsSubmitting(false);
    setForm({ name: '', profession: '', rating: 5, feedback: '' });
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#fff' }}>
          FlowSync <span style={{ color: '#38bdf8' }}>App Experience &amp; Reviews</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Share your experience using FlowSync for real-time Kanban and AI task orchestration.
        </p>
      </div>

      {/* Render Submitted Reviews */}
      {reviews.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ color: '#fbbf24', fontSize: '1rem' }}>{'★'.repeat(review.rating)}</div>
                {review.createdAt && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{review.createdAt}</span>}
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.5 }}>&ldquo;{review.feedback}&rdquo;</p>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{review.name} <span style={{ color: '#38bdf8', fontWeight: 400 }}>• {review.profession}</span></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.01)', border: '1px border-dashed rgba(255,255,255,0.08)', borderRadius: '1rem', marginBottom: '2.5rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No user reviews submitted yet. Be the first to share your experience with FlowSync below!</p>
        </div>
      )}

      {/* Review Submission Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ 
          background: 'rgba(15, 23, 42, 0.6)', 
          border: '1px solid rgba(56, 189, 248, 0.2)', 
          borderRadius: '1.25rem', 
          padding: '2rem',
          backdropFilter: 'blur(12px)',
          maxWidth: '650px',
          margin: '0 auto'
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '1.5rem', fontWeight: 'bold' }}>✓</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Review Submitted for Moderation</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>Your feedback is pending review and will appear publicly only after approval.</p>
            <button
              onClick={() => setSubmitted(false)}
              style={{ background: 'rgba(255,255,255,0.05)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Write Another Review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
              Submit FlowSync Usage Review
            </h3>

            {errorMsg && (
              <div style={{ color: '#f87171', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(248, 113, 113, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Your Name *</label>
                <input 
                  type="text" 
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Role / Profession</label>
                <input 
                  type="text"
                  maxLength={100}
                  value={form.profession}
                  onChange={(e) => setForm({ ...form, profession: e.target.value })}
                  placeholder="e.g. Project Lead"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>App Rating</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setForm({ ...form, rating: star })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: star <= form.rating ? '#fbbf24' : '#475569', padding: '0 0.2rem' }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>FlowSync App Experience *</label>
              <textarea 
                required
                rows={3}
                maxLength={1000}
                value={form.feedback}
                onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                placeholder="How was your experience with FlowSync's real-time Kanban and AI task features?"
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.2s' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Display Review'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
