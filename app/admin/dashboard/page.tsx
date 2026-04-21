// app/admin/dashboard/page.tsx
import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';
import {
  Users, Stethoscope, Calendar, AlertTriangle,
  Pill, Activity, ClipboardList,
} from 'lucide-react';

interface Session { userId: number; firstName: string; }

async function getAdminStats() {
  const [
    patientsRes,
    doctorsRes,
    aptsRes,
    pendingAptsRes,
    completedAptsRes,
    medicationsRes,
    lowStockRes,
    consultationsRes,
    notesRes,
  ] = await Promise.all([
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Patients`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Users u JOIN Roles r ON r.roleId = u.roleId WHERE r.roleName IN ('Doctor','Jefe Médico','Nutriólogo')`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Appointments`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Appointments WHERE status = 'Pendiente'`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Appointments WHERE status = 'Completada'`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Medications`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Medications WHERE currentStock <= reorderPoint AND reorderPoint > 0`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Consultations`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM CollaborativeNotes WHERE isAlert = 1`, args: [] }),
  ]);

  return {
    totalPatients:    Number(patientsRes.rows[0]?.total ?? 0),
    totalDoctors:     Number(doctorsRes.rows[0]?.total ?? 0),
    totalApts:        Number(aptsRes.rows[0]?.total ?? 0),
    pendingApts:      Number(pendingAptsRes.rows[0]?.total ?? 0),
    completedApts:    Number(completedAptsRes.rows[0]?.total ?? 0),
    totalMedications: Number(medicationsRes.rows[0]?.total ?? 0),
    lowStockCount:    Number(lowStockRes.rows[0]?.total ?? 0),
    totalConsultations: Number(consultationsRes.rows[0]?.total ?? 0),
    activeAlerts:     Number(notesRes.rows[0]?.total ?? 0),
  };
}

async function getRecentAppointments() {
  const result = await db.execute({
    sql: `SELECT a.*,
                 up.firstName || ' ' || up.lastName AS patientName,
                 ud.firstName || ' ' || ud.lastName AS doctorName
          FROM   Appointments a
          JOIN   Users up ON up.userId = a.patientId
          JOIN   Users ud ON ud.userId = a.doctorId
          ORDER  BY a.dateTime DESC
          LIMIT  8`,
    args: [],
  });
  return result.rows;
}

async function getRecentConsultations() {
  const result = await db.execute({
    sql: `SELECT c.*,
                 up.firstName || ' ' || up.lastName AS patientName,
                 ud.firstName || ' ' || ud.lastName AS doctorName
          FROM   Consultations c
          JOIN   Appointments a ON a.appointmentId = c.appointmentId
          JOIN   Users up ON up.userId = a.patientId
          JOIN   Users ud ON ud.userId = a.doctorId
          ORDER  BY c.consultationDate DESC
          LIMIT  5`,
    args: [],
  });
  return result.rows;
}

const STATUS_BADGE: Record<string, string> = {
  Pendiente:  'badge-warning',
  Aceptada:   'badge-success',
  Completada: 'badge-info',
  Cancelada:  'badge-danger',
  Denegada:   'badge-purple',
};

export default async function AdminDashboard() {
  const session: Session = JSON.parse(cookies().get('session')?.value ?? '{}');
  const [stats, recentApts, recentCons] = await Promise.all([
    getAdminStats(),
    getRecentAppointments(),
    getRecentConsultations(),
  ]);

  const completionRate = stats.totalApts > 0
    ? Math.round((stats.completedApts / stats.totalApts) * 100)
    : 0;

  const kpiCards = [
    { label: 'Total Pacientes',   value: stats.totalPatients,    icon: Users,         color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-l-blue-500'   },
    { label: 'Médicos Activos',   value: stats.totalDoctors,     icon: Stethoscope,   color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-l-emerald-500'},
    { label: 'Total Citas',       value: stats.totalApts,        icon: Calendar,      color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-l-purple-500' },
    { label: 'Citas Pendientes',  value: stats.pendingApts,      icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-l-amber-500'  },
    { label: 'Consultas',         value: stats.totalConsultations,icon: ClipboardList,color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-l-indigo-500' },
    { label: 'Medicamentos',      value: stats.totalMedications, icon: Pill,          color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-l-teal-500'   },
    { label: 'Stock Bajo',        value: stats.lowStockCount,    icon: Pill,          color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-l-red-500'    },
    { label: 'Alertas Activas',   value: stats.activeAlerts,     icon: Activity,      color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-l-rose-500'   },
  ];

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Panel de Administración 🏥</h2>
            <p className="text-slate-400 text-sm mt-1">
              Bienvenido, {session.firstName} ·{' '}
              {new Date().toLocaleDateString('es-MX', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="badge-info text-xs">Sistema activo</span>
            <p className="text-slate-400 text-xs">Tasa de completación: {completionRate}%</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`stat-card border-l-4 ${border}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Appointments */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">Citas Recientes</h3>
            <a href="/admin/appointments" className="text-blue-600 text-sm font-medium hover:underline">Ver todas →</a>
          </div>
          {recentApts.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-sm">Sin citas registradas</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentApts.map(apt => {
                const d = new Date(String(apt.dateTime));
                return (
                  <div key={String(apt.appointmentId)} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                        {String(apt.patientName)[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{String(apt.patientName)}</p>
                        <p className="text-xs text-slate-400 truncate">{String(apt.doctorName)} · {d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <span className={`${STATUS_BADGE[String(apt.status)] ?? 'badge-gray'} flex-shrink-0 ml-2`}>
                      {String(apt.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Consultations */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">Consultas Recientes</h3>
            <a href="/admin/appointments" className="text-blue-600 text-sm font-medium hover:underline">Ver todas →</a>
          </div>
          {recentCons.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-sm">Sin consultas registradas</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentCons.map(con => (
                <div key={String(con.consultationId)} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{String(con.diagnosis)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{String(con.patientName)} · {String(con.doctorName)}</p>
                    </div>
                    <p className="text-xs text-slate-400 flex-shrink-0">{String(con.consultationDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="section-card p-5">
          <p className="text-sm text-slate-500 mb-1">Tasa de Completación</p>
          <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">{stats.completedApts} de {stats.totalApts} citas completadas</p>
        </div>
        <div className="section-card p-5">
          <p className="text-sm text-slate-500 mb-1">Citas Pendientes</p>
          <p className="text-3xl font-bold text-amber-600">{stats.pendingApts}</p>
          <p className="text-xs text-slate-400 mt-2">Requieren atención del médico</p>
          <a href="/admin/appointments" className="text-xs text-blue-600 font-medium hover:underline mt-2 block">Ver citas pendientes →</a>
        </div>
        <div className="section-card p-5">
          <p className="text-sm text-slate-500 mb-1">Alertas de Farmacia</p>
          <p className={`text-3xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{stats.lowStockCount}</p>
          <p className="text-xs text-slate-400 mt-2">Medicamentos con stock bajo o agotado</p>
          <a href="/admin/pharmacy" className="text-xs text-blue-600 font-medium hover:underline mt-2 block">Ver farmacia →</a>
        </div>
      </div>
    </div>
  );
}