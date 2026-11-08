import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'University Disclaimer | NotesBazaar by AbhyasMitra',
  description:
    'Official independent resource and non-affiliation disclaimer regarding Savitribai Phule Pune University (SPPU).',
  alternates: {
    canonical: '/disclaimer',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div>
        <span className="pill-badge pill-badge-yellow mb-2">Legal Disclaimer</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          University & Academic Disclaimer
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">1. Independent Student Resource</h2>
          <p>
            <strong>NotesBazaar by AbhyasMitra</strong> is an independent academic resource platform operated by AbhyasMitra. NotesBazaar is <strong>NOT officially affiliated with, endorsed by, sponsored by, or in any way formally connected to Savitribai Phule Pune University (SPPU)</strong>, the Directorate of Technical Education (DTE) Maharashtra, the All India Council for Technical Education (AICTE), or any affiliated engineering institution.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">2. Reference to Syllabus & Trademarks</h2>
          <p>
            All references to &quot;SPPU,&quot; &quot;Pune University,&quot; &quot;SPPU 2024 Pattern,&quot; specific branch names, academic subject titles, and course codes are used strictly for <strong>descriptive identification, educational guidance, and syllabus mapping</strong> under fair dealing principles. All respective trademarks and institutional names remain the sole property of their respective trademark holders.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">3. Nature of Academic Notes</h2>
          <p>
            The study notes, summary sheets, and exam revision guides provided on NotesBazaar are supplementary learning aids developed to assist students with their personal exam preparation. They do not constitute official university question papers, answer keys, or confidential institutional evaluation documents.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-950">4. No Warranty of Exam Outcomes</h2>
          <p>
            While we strive for high academic rigor and syllabus fidelity, NotesBazaar makes no warranty that studying these materials guarantees any specific examination score, grade, or semester pass result. Students are strongly advised to consult their prescribed university textbooks, faculty lectures, and official academic notifications.
          </p>
        </section>
      </div>
    </div>
  );
}

