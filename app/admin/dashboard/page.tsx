import Link from 'next/link';
import { db } from '@/lib/db/client';
import {
  Users, UserCircle, Calendar, Stethoscope, Pill, FileText, ClipboardList, Salad, Link2,
} from 'lucide-react';

function pickCount(row: Record<string, unknown> | undefined) {
  if (!row) return 0;
  const v = row.n ?? row['COUNT(*)'];
  return Number(v ?? 0);
}

async function count(sql: string) {
  const r = await db.execute({ sql, args: [] });
  return pickCount(r.rows[0] as Record<string, unknown> | undefined);
}

export default async function AdminDashboard() {
  const [
    roles, users, patients, coachLinks, appointments, consultations, clinicalFiles,
    medications, batches, prescriptions, profiles, plans, followUps, discharges, notes,
  ] = await Promise.all([
    count('SELECT COUNT(*) AS n FROM Roles'),
    count('SELECT COUNT(*) AS n FROM Users'),
    count('SELECT COUNT(*) AS n FROM Patients'),
    count('SELECT COUNT(*) AS n FROM Coach_Athlete'),
    count('SELECT COUNT(*) AS n FROM Appointments'),
    count('SELECT COUNT(*) AS n FROM Consultations'),
    count('SELECT COUNT(*) AS n FROM ClinicalFiles'),
    count('SELECT COUNT(*) AS n FROM Medications'),
    count('SELECT COUNT(*) AS n FROM Batches'),
    count('SELECT COUNT(*) AS n FROM Prescriptions'),
    count('SELECT COUNT(*) AS n FROM NutritionalProfiles'),
    count('SELECT COUNT(*) AS n FROM NutritionalPlans'),
    count('SELECT COUNT(*) AS n FROM NutritionalFollowUps'),
    count('SELECT COUNT(*) AS n FROM NutritionalDischarges'),
    count('SELECT COUNT(*) AS n FROM CollaborativeNotes'),
  ]);

  const cards = [
    { label: 'Roles',               value: roles,            icon: Users,         color: 'text-slate-600',  bg: 'bg-slate-100',  href: '/admin/roles' },
    { label: 'Usuarios',            value: users,            icon: Users,         color: 'text-blue-600',   bg: 'bg-blue-50',    href: '/admin/users' },
    { label: 'Pacientes',           value: patients,         icon: UserCircle,    color: 'text-emerald-600',bg: 'bg-emerald-50', href: '/admin/patients' },
    { label: 'Entrenador–Atleta',   value: coachLinks,       icon: Link2,         color: 'text-cyan-600',   bg: 'bg-cyan-50',    href: '/admin/coach-athletes' },
    { label: 'Citas',               value: appointments,     icon: Calendar,      color: 'text-indigo-600', bg: 'bg-indigo-50',  href: '/admin/appointments' },
    { label: 'Consultas',           value: consultations,    icon: Stethoscope,   color: 'text-violet-600', bg: 'bg-violet-50',  href: '/admin/consultations' },
    { label: 'Archivos clínicos',   value: clinicalFiles,    icon: FileText,      color: 'text-amber-600',  bg: 'bg-amber-50',   href: '/admin/clinical-files' },
    { label: 'Medicamentos',        value: medications,      icon: Pill,          color: 'text-rose-600',   bg: 'bg-rose-50',    href: '/admin/medications' },
    { label: 'Lotes',               value: batches,          icon: Pill,          color: 'text-orange-600', bg: 'bg-orange-50',  href: '/admin/medications' },
    { label: 'Recetas',             value: prescriptions,    icon: ClipboardList, color: 'text-teal-600',   bg: 'bg-teal-50',    href: '/admin/prescriptions' },
    { label: 'Perfiles nutrición',  value: profiles,         icon: Salad,         color: 'text-lime-600',   bg: 'bg-lime-50',    href: '/admin/nutrition' },
    { label: 'Planes nutrición',    value: plans,            icon: Salad,         color: 'text-green-600',  bg: 'bg-green-50',   href: '/admin/nutrition' },
    { label: 'Seguimientos nut.',   value: followUps,        icon: Salad,         color: 'text-green-700',  bg: 'bg-green-100',  href: '/admin/nutrition' },
    { label: 'Altas nutrición',     value: discharges,       icon: Salad,         color: 'text-stone-600',  bg: 'bg-stone-100',  href: '/admin/nutrition' },
    { label: 'Notas colaborativas', value: notes,            icon: ClipboardList, color: 'text-purple-600',bg: 'bg-purple-50',  href: '/admin/collaborative-notes' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Panel de administración</h1>
        <p className="page-subtitle">Resumen alineado con el esquema de base de datos (Turso / SQLite)</p>
      </div>

      <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold">Vista global del sistema</h2>
        <p className="text-purple-200 text-sm mt-1">
          Conteos por tabla. Use la barra lateral para listar y revisar registros.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="stat-card block hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600 leading-tight pr-2">{label}</p>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
