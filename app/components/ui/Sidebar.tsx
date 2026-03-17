'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, User, Calendar, FileText, Stethoscope,
  Users, AlertTriangle, ClipboardList, LogOut, Heart,
  Salad, Activity,
} from 'lucide-react';
import { useSession } from './useSession';

const PATIENT_LINKS = [
  { href: '/patient/dashboard',     icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/patient/profile',       icon: User,            label: 'Mi Perfil'  },
  { href: '/patient/appointments',  icon: Calendar,        label: 'Citas'      },
  { href: '/patient/consultations', icon: Stethoscope,     label: 'Consultas'  },
  { href: '/patient/reports',       icon: FileText,        label: 'Reportes'   },
];

const DOCTOR_LINKS = [
  { href: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard'     },
  { href: '/doctor/patients',  icon: Users,           label: 'Mis Pacientes' },
  { href: '/doctor/schedule',  icon: Calendar,        label: 'Mi Agenda'     },
  { href: '/doctor/records',   icon: ClipboardList,   label: 'Expedientes'   },
  { href: '/doctor/emergency', icon: AlertTriangle,   label: 'Urgencias'     },
  { href: '/doctor/reports',   icon: FileText,        label: 'Reportes'      },
  { href: '/doctor/physio',    icon: Activity,        label: 'Fisioterapia'  },
  { href: '/doctor/nutrition', icon: Salad,           label: 'Nutrición'     },
  { href: '/doctor/profile',   icon: User,            label: 'Mi Perfil'     },
];

const ROLE_AVATAR_BG: Record<string, string> = {
  Estudiante:    'bg-emerald-500',
  Doctor:        'bg-blue-500',
  Administrador: 'bg-purple-500',
  Nutriólogo:    'bg-orange-500',
  Entrenador:    'bg-cyan-500',
  'Jefe Médico': 'bg-indigo-500',
};

const ROLE_BADGE: Record<string, string> = {
  Estudiante:    'bg-emerald-500/20 text-emerald-400',
  Doctor:        'bg-blue-500/20    text-blue-400',
  Administrador: 'bg-purple-500/20  text-purple-400',
  Nutriólogo:    'bg-orange-500/20  text-orange-400',
  Entrenador:    'bg-cyan-500/20    text-cyan-400',
  'Jefe Médico': 'bg-indigo-500/20  text-indigo-400',
};

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const session  = useSession();

  const roleName = session?.roleName ?? '';
  const fullName = session ? `${session.firstName} ${session.lastName}` : null;
  const initial  = session?.firstName?.charAt(0)?.toUpperCase() ?? '';
  const avatarBg = ROLE_AVATAR_BG[roleName] ?? 'bg-slate-600';
  const badge    = ROLE_BADGE[roleName]     ?? 'bg-slate-600/20 text-slate-400';

  const isDoctor = ['Doctor', 'Jefe Médico', 'Nutriólogo'].includes(roleName);
  const links    = isDoctor ? DOCTOR_LINKS : PATIENT_LINKS;

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">MedSystem</h1>
            <p className="text-slate-500 text-[11px]">Hospital Management</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-slate-800">
        {session === null ? (
          // Skeleton while loading
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 animate-pulse flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-slate-700 rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-slate-700 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${avatarBg}`}>
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{fullName}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge}`}>
                {roleName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={() => {
            document.cookie = 'session=; path=/; max-age=0'; localStorage.removeItem('session');
            router.replace('/');
          }}
          className="sidebar-link w-full text-red-400 hover:!text-red-300 hover:!bg-red-500/10"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}