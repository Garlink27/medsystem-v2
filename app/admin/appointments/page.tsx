// app/admin/appointments/page.tsx
import { db } from '@/lib/db/client';
import { Calendar } from 'lucide-react';

async function getAppointments() {
  const result = await db.execute({
    sql: `SELECT a.*,
                 up.firstName || ' ' || up.lastName AS patientName,
                 ud.firstName || ' ' || ud.lastName AS doctorName,
                 rd.roleName AS doctorRole
          FROM   Appointments a
          JOIN   Users up ON up.userId = a.patientId
          JOIN   Users ud ON ud.userId = a.doctorId
          JOIN   Roles rd ON rd.roleId = ud.roleId
          ORDER  BY a.dateTime DESC
          LIMIT  100`,
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

export default async function AdminAppointments() {
  const appointments = await getAppointments();

  const counts = {
    total:      appointments.length,
    pendiente:  appointments.filter(a => a.status === 'Pendiente').length,
    aceptada:   appointments.filter(a => a.status === 'Aceptada').length,
    completada: appointments.filter(a => a.status === 'Completada').length,
    cancelada:  appointments.filter(a => a.status === 'Cancelada').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Gestión de Citas</h1>
        <p className="page-subtitle">{appointments.length} citas registradas</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total',       value: counts.total,      color: 'text-slate-800',   bg: 'bg-slate-50'   },
          { label: 'Pendientes',  value: counts.pendiente,  color: 'text-amber-700',   bg: 'bg-amber-50'   },
          { label: 'Aceptadas',   value: counts.aceptada,   color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Completadas', value: counts.completada, color: 'text-blue-700',    bg: 'bg-blue-50'    },
          { label: 'Canceladas',  value: counts.cancelada,  color: 'text-red-700',     bg: 'bg-red-50'     },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl p-4 ${bg}`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className={`text-sm font-medium mt-0.5 ${color} opacity-80`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="section-card overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No hay citas registradas</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="table-header">
              <tr>
                {['Paciente', 'Médico', 'Rol', 'Fecha y Hora', 'Estado'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map(apt => {
                const d = new Date(String(apt.dateTime));
                return (
                  <tr key={String(apt.appointmentId)} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                          {String(apt.patientName)[0]}
                        </div>
                        <span className="text-sm font-medium text-slate-800">{String(apt.patientName)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{String(apt.doctorName)}</td>
                    <td className="px-4 py-3">
                      <span className="badge-gray text-xs">{String(apt.doctorRole)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-800">{d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs text-slate-400">{d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE[String(apt.status)] ?? 'badge-gray'}>{String(apt.status)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}