import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#0080FF] border-t-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-[#FFE500] border-b-transparent animate-spin [animation-duration:1.4s]"></div>
      </div>
      <p className="text-xs font-semibold text-slate-400 animate-pulse tracking-wider uppercase">
        Loading...
      </p>
    </div>
  );
}
