'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success('Your message has been received! Our support team will respond shortly.');
    }, 600);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-950">Message Dispatched!</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Thank you for contacting NotesBazaar. We have logged your request and our student support specialist will follow up via email within 24 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setMessage('');
          }}
          className="mt-2 text-xs font-bold text-amber-600 underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4"
    >
      <h2 className="text-base font-bold text-slate-950">Send an Inquiry</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1">Your Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Vinay"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="student@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-900 mb-1">Subject</label>
        <input
          type="text"
          required
          placeholder="e.g. Question regarding SE Computer TOC notes"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:border-amber-400"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-900 mb-1">Message</label>
        <textarea
          required
          rows={4}
          placeholder="Provide details about your query or order reference..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:border-amber-400 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-6 rounded-2xl bg-slate-950 hover:bg-[#FFE500] hover:text-slate-950 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <span>{submitting ? 'Sending...' : 'Send Message'}</span>
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}

