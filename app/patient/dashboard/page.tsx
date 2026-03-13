import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';
import { Calendar, FileText, Stethoscope, AlertCircle } from 'lucide-react';

interface Session { userId: number; firstName: string; lastName: string; }

async function getDashboardData(patientId: number) {
  const [apts, cons] = await Promise.all([
    db.execute({
      sql: `SELECT a.*, u.firstName || ' ' || u.lastName AS doctorName
            FROM Appointments a JOIN Users u ON u.userId = a.doctorId
            WHERE a.patientId = ? ORDER BY a.dateTime DESC LIMIT 10`,
      args: [patientId],
    }),
    db.execute({
      sql: `SELECT c.* FROM Consultations c
            JOIN Appointments a ON a.appointmentId = c.appointmentId
            WHERE a.patientId = ? ORDER BY c.consultationDate DESC LIMIT 3`,
      args: [patientId],
    }),
  ]);
  return { appointments: apts.rows, consultations: cons.rows };
}

const STATUS_BADGE: Record<string, string> = {
  Pendiente:  'badge-warning',
  Aceptada:   'badge-success',
  Completada: 'badge-info',
  Cancelada:  'badge-danger',
  Denegada:   'badge-purple',
};

export default async function PatientDashboard() {
  const session: Session = JSON.parse(cookies().get('session')?.value ?? '{}');
  const { appointments, consultations } = await getDashboardData(session.userId);

  const upcoming  = appointments.filter((a) => a.status === 'Pendiente' || a.status === 'Aceptada');
  const completed = appointments.filter((a) => a.status === 'Completada').length;

  const stats = [
    { label: 'Próximas Citas',   value: upcoming.length,        icon: Calendar,    color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Consultas',        value: consultations.length,   icon: Stethoscope, color: 'text-emerald-600',bg: 'bg-emerald-50'},
    { label: 'Citas Completadas',value: completed,              icon: FileText,    color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Citas',      value: appointments.length,    icon: AlertCircle, color: 'text-slate-600',  bg: 'bg-slate-50'  },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Bienvenido, {session.firstName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Upcoming appointments */}
      <div className="section-card">
        <div className="section-card-header">
          <h3 className="section-card-title">Próximas Citas</h3>
          <a href="/patient/appointments" className="text-blue-600 text-sm font-medium hover:underline">Ver todas</a>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No tienes citas próximas</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {upcoming.slice(0, 5).map((apt) => {
              const d = new Date(apt.dateTime as string);
              return (
                <div key={String(apt.appointmentId)} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  {/* Date pill */}
                  <div className="w-12 flex-shrink-0 text-center bg-blue-50 rounded-lg py-1.5">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">
                      {d.toLocaleString('es-MX', { month: 'short' })}
                    </p>
                    <p className="text-xl font-bold text-slate-900 leading-none">{d.getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{String(apt.doctorName)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={STATUS_BADGE[apt.status as string] ?? 'badge-gray'}>
                    {String(apt.status)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent consultations */}
      {consultations.length > 0 && (
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">Últimas Consultas</h3>
            <a href="/patient/consultations" className="text-blue-600 text-sm font-medium hover:underline">Ver todas</a>
          </div>
          <div className="divide-y divide-slate-50">
            {consultations.map((con) => (
              <div key={String(con.consultationId)} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{String(con.diagnosis)}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{String(con.symptoms)}</p>
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0">{String(con.consultationDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
