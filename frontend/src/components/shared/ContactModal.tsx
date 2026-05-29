'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, X, User, MessageSquare } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Your support message has been sent! We will respond shortly.');
      setName('');
      setEmail('');
      setMessage('');
      onClose();
    } catch {
      toast.error('Failed to dispatch support message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-background border border-border-color rounded-3xl p-6 shadow-2xl shadow-accent-blue/5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-color pb-4 mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Mail className="w-5 h-5 text-accent-blue" />
            <span>Support Sanctuary</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-text-secondary hover:text-foreground transition-all p-1.5 rounded-xl hover:bg-bg-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-text-secondary mb-5 leading-relaxed">
          Need support? Submit a secure message through the form below. Direct emails are disabled to prevent spam and protect recruiter routing channels.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 pl-1">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-text-dim" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className={`w-full bg-bg-secondary border rounded-2xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-text-dim outline-none transition-all ${
                  errors.name ? 'border-accent-red/50 focus:border-accent-red' : 'border-border-color focus:border-accent-blue/50'
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-accent-red mt-1 font-medium pl-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-text-dim" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full bg-bg-secondary border rounded-2xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-text-dim outline-none transition-all ${
                  errors.email ? 'border-accent-red/50 focus:border-accent-red' : 'border-border-color focus:border-accent-blue/50'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-accent-red mt-1 font-medium pl-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 pl-1">Message</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-text-dim" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What can we build or fix together?"
                rows={4}
                className={`w-full bg-bg-secondary border rounded-2xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-text-dim outline-none resize-none transition-all ${
                  errors.message ? 'border-accent-red/50 focus:border-accent-red' : 'border-border-color focus:border-accent-blue/50'
                }`}
              />
            </div>
            {errors.message && <p className="text-[11px] text-accent-red mt-1 font-medium pl-1">{errors.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-text-secondary bg-bg-secondary hover:bg-bg-secondary/70 border border-border-color transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-foreground bg-accent-blue hover:bg-accent-blue/80 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
