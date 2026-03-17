import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';
import { Users, Calendar, ClipboardList, AlertTriangle } from 'lucide-react';

interface Session { userId: number; firstName: string; lastName: string; }

async function getDoctorStats(doctorId: number) {
  const [aptsRes, patientsRes, emergencyRes] = await Promise.all([
    db.execute({ sql: `SELECT * FROM Appointments WHERE doctorId = ? ORDER BY dateTime DESC`, args: [doctorId] }),
    db.execute({ sql: `SELECT DISTINCT patientId FROM Appointments WHERE doctorId = ?`, args: [doctorId] }),
    db.execute({ sql: `SELECT * FROM Appointments WHERE doctorId = ? AND status = 'Pendiente' ORDER BY dateTime ASC LIMIT 10`, args: [doctorId] }),
  ]);
  return { appointments: aptsRes.rows, patients: patientsRes.rows, pending: emergencyRes.rows };
}

const STATUS_BADGE: Record<string, string> = {
  Pendiente:  'badge-warning',
  Aceptada:   'badge-success',
  Completada: 'badge-info',
  Cancelada:  'badge-danger',
  Denegada:   'badge-purple',
};

export default async function DoctorDashboard() {
  const session: Session = JSON.parse(cookies().get('session')?.value ?? '{}');
  const { appointments, patients, pending } = await getDoctorStats(session.userId);

  const today = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => String(a.dateTime).startsWith(today));
  const completed = appointments.filter(a => a.status === 'Completada').length;

  const stats = [
    { label: 'Mis Pacientes',    value: patients.length,    icon: Users,         color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Citas Hoy',        value: todayApts.length,   icon: Calendar,      color: 'text-emerald-600',bg: 'bg-emerald-50'},
    { label: 'Completadas',      value: completed,           icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pendientes',       value: pending.length,     icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50'  },
  ];

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">¡Buenos días, {session.firstName}! 🩺</h2>
            <p className="text-blue-200 text-sm mt-1">Panel médico — {new Date().toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' })}</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="badge-info text-xs">Doctor activo</span>
            <p className="text-blue-200 text-xs">ID: {session.userId}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's appointments */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">Citas de Hoy</h3>
            <span className="badge-info">{todayApts.length}</span>
          </div>
          {todayApts.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-sm">Sin citas programadas para hoy</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {todayApts.map(apt => {
                const d = new Date(String(apt.dateTime));
                return (
                  <div key={String(apt.appointmentId)} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{String(apt.patientName)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={STATUS_BADGE[apt.status as string] ?? 'badge-gray'}>{String(apt.status)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending appointments to accept/deny */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">Citas Pendientes de Revisión</h3>
            <span className="badge-warning">{pending.length}</span>
          </div>
          {pending.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-sm">No hay citas pendientes</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {pending.slice(0, 6).map(apt => {
                const d = new Date(String(apt.dateTime));
                return (
                  <div key={String(apt.appointmentId)} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{String(apt.patientName)}</p>
                      <p className="text-xs text-slate-400">
                        {d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} · {d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <a href="/doctor/schedule" className="text-xs text-blue-600 font-medium hover:underline">Ver agenda →</a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
