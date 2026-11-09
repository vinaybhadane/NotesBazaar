import React from 'react';

export default function Loading() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
      <div className="h-8 bg-slate-100 rounded-2xl w-1/3"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-100 rounded-3xl"></div>
        <div className="h-64 bg-slate-100 rounded-3xl"></div>
        <div className="h-64 bg-slate-100 rounded-3xl"></div>
      </div>
    </div>
  );
}

