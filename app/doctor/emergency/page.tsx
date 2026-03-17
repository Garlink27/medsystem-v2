import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';
import { AlertTriangle, Clock } from 'lucide-react';

interface Session { userId: number; }

export default async function DoctorEmergency() {
  const session: Session = JSON.parse(cookies().get('session')?.value ?? '{}');

  // Emergency = appointments with no set time (immediate) or overdue pending
  const result = await db.execute({
    sql: `SELECT a.*,
                 u.firstName || ' ' || u.lastName AS patientName
          FROM   Appointments a
          JOIN   Users u ON u.userId = a.patientId
          WHERE  a.doctorId = ? AND a.status = 'Pendiente'
          ORDER  BY a.dateTime ASC
          LIMIT  20`,
    args: [session.userId],
  });
  const cases = result.rows;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Urgencias</h1>
          <p className="page-subtitle">Citas pendientes que requieren atención</p>
        </div>
        {cases.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 border border-red-200 rounded-xl">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-red-700">{cases.length} pendientes</span>
          </div>
        )}
      </div>

      {cases.length === 0 ? (
        <div className="section-card p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No hay casos urgentes en este momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map(c => {
            const d    = new Date(String(c.dateTime));
            const past = d < new Date();
            return (
              <div key={String(c.appointmentId)} className={`section-card overflow-hidden ${past ? 'border-l-4 border-red-400' : ''}`}>
                <div className="flex items-center gap-4 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${past ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <AlertTriangle className={`w-5 h-5 ${past ? 'text-red-600' : 'text-amber-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{String(c.patientName)}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {d.toLocaleDateString('es-MX', { day:'numeric', month:'short' })} · {d.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {past
                      ? <span className="badge-danger">Vencida</span>
                      : <span className="badge-warning">Pendiente</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
