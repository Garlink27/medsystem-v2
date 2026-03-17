'use client';

import { Bell } from 'lucide-react';
import { useSession } from './useSession';

const ROLE_AVATAR_BG: Record<string, string> = {
  Estudiante:    'bg-emerald-500',
  Doctor:        'bg-blue-500',
  Administrador: 'bg-purple-500',
  Nutriólogo:    'bg-orange-500',
  Entrenador:    'bg-cyan-500',
  'Jefe Médico': 'bg-indigo-500',
};

export default function Topbar({ pageTitle }: { pageTitle?: string }) {
  const session  = useSession();

  const fullName = session ? `${session.firstName} ${session.lastName}` : null;
  const initial  = session?.firstName?.charAt(0)?.toUpperCase() ?? '';
  const avatarBg = ROLE_AVATAR_BG[session?.roleName ?? ''] ?? 'bg-slate-400';

  const dateStr = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <p className="font-semibold text-slate-800">{pageTitle ?? 'MedSystem'}</p>
        <p className="text-xs text-slate-400 capitalize">{dateStr}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            placeholder="Buscar..."
            className="bg-transparent text-sm text-slate-600 outline-none w-36 placeholder:text-slate-400"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Avatar — skeleton while loading */}
        {session === null ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            <div className="hidden sm:block space-y-1.5">
              <div className="h-3 bg-slate-200 rounded animate-pulse w-24" />
              <div className="h-2.5 bg-slate-200 rounded animate-pulse w-32" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 ${avatarBg} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {initial}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-none">{fullName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{session.email}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}