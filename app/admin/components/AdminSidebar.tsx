// app/admin/components/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Stethoscope, Calendar,
  FlaskConical, Pill, AlertTriangle, Wrench,
  BarChart2, DollarSign, LogOut, Shield,
} from 'lucide-react';
import { useSession } from '@/app/components/ui/useSession';

const ADMIN_LINKS = [
  { href: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
  { href: '/admin/patients',     icon: Users,           label: 'Pacientes'     },
  { href: '/admin/doctors',      icon: Stethoscope,     label: 'Doctores'      },
  { href: '/admin/appointments', icon: Calendar,        label: 'Citas'         },
  { href: '/admin/pharmacy',     icon: Pill,            label: 'Farmacia'      },
  { href: '/admin/laboratory',   icon: FlaskConical,    label: 'Laboratorio'   },
  { href: '/admin/emergency',    icon: AlertTriangle,   label: 'Urgencias'     },
  { href: '/admin/equipment',    icon: Wrench,          label: 'Equipamiento'  },
  { href: '/admin/analytics',    icon: BarChart2,       label: 'Analíticas'    },
  { href: '/admin/billing',      icon: DollarSign,      label: 'Facturación'   },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const session  = useSession();

  const fullName = session ? `${session.firstName} ${session.lastName}` : null;
  const initial  = session?.firstName?.charAt(0)?.toUpperCase() ?? '';

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">MedSystem</h1>
            <p className="text-slate-500 text-[11px]">Panel Administrador</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-slate-800">
        {session === null ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 animate-pulse flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-slate-700 rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-slate-700 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{fullName}</p>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                Administrador
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {ADMIN_LINKS.map(({ href, icon: Icon, label }) => {
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
            document.cookie = 'session=; path=/; max-age=0';
            localStorage.removeItem('session');
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