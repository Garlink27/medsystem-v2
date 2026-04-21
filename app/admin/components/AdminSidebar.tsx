'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Shield, Users, UserCircle, Calendar, Stethoscope,
  Pill, FileText, ClipboardList, Salad, Link2, LogOut, Heart, MessageSquare,
} from 'lucide-react';
import { useSession } from '@/app/components/ui/useSession';

const ADMIN_LINKS = [
  { href: '/admin/dashboard',           icon: LayoutDashboard, label: 'Panel'              },
  { href: '/admin/roles',               icon: Shield,          label: 'Roles'              },
  { href: '/admin/users',               icon: Users,           label: 'Usuarios'           },
  { href: '/admin/patients',            icon: UserCircle,      label: 'Pacientes'          },
  { href: '/admin/coach-athletes',      icon: Link2,           label: 'Entrenador–Atleta'  },
  { href: '/admin/appointments',        icon: Calendar,        label: 'Citas'              },
  { href: '/admin/consultations',       icon: Stethoscope,     label: 'Consultas'          },
  { href: '/admin/clinical-files',      icon: FileText,        label: 'Archivos clínicos'  },
  { href: '/admin/medications',         icon: Pill,            label: 'Medicamentos'       },
  { href: '/admin/prescriptions',      icon: ClipboardList,   label: 'Recetas'            },
  { href: '/admin/nutrition',           icon: Salad,           label: 'Nutrición'          },
  { href: '/admin/collaborative-notes', icon: MessageSquare,   label: 'Notas colaborativas'},
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const session  = useSession();

  const fullName = session ? `${session.firstName} ${session.lastName}` : null;
  const initial  = session?.firstName?.charAt(0)?.toUpperCase() ?? '';

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col flex-shrink-0 border-r border-slate-800">
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">MedSystem</h1>
            <p className="text-slate-500 text-[11px]">Administración</p>
          </div>
        </div>
      </div>

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
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-purple-500">
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{fullName}</p>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                Administrador
              </span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {ADMIN_LINKS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
        <Link href="/" className="sidebar-link text-slate-400 hover:!text-white">
          <Heart className="w-4 h-4 flex-shrink-0" />
          Inicio / Login
        </Link>
        <button
          type="button"
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
