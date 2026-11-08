import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { Users, Shield, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Students & Users | Admin NotesBazaar',
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const users = await db.getAllUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Registered Students & Administrators
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Firebase authenticated user accounts synchronized with NotesBazaar
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-950">
            Total Accounts ({users.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">User Email</th>
                <th className="py-3 px-5">Display Name</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">{u.email}</td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {u.display_name || 'Engineering Student'}
                  </td>
                  <td className="py-3.5 px-5">
                    {u.role === 'admin' ? (
                      <span className="pill-badge pill-badge-yellow text-[10px]">
                        Admin
                      </span>
                    ) : (
                      <span className="pill-badge pill-badge-gray text-[10px]">
                        Student
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

