// app/admin/emergency/page.tsx
import { db } from '@/lib/db/client';
import { AlertTriangle, Clock } from 'lucide-react';

async function getPendingAppointments() {
  const result = await db.execute({
    sql: `SELECT a.*,
                 up.firstName || ' ' || up.lastName AS patientName,
                 ud.firstName || ' ' || ud.lastName AS doctorName,
                 p.bloodType, p.allergies
          FROM   Appointments a
          JOIN   Users up ON up.userId = a.patientId
          JOIN   Users ud ON ud.userId = a.doctorId
          LEFT JOIN Patients p ON p.patientId = a.patientId
          WHERE  a.status IN ('Pendiente','Aceptada')
          ORDER  BY a.dateTime ASC`,
    args: [],
  });
  return result.rows;
}

async function getAlerts() {
  const result = await db.execute({
    sql: `SELECT n.*,
                 u.firstName || ' ' || u.lastName AS patientName,
                 ua.firstName || ' ' || ua.lastName AS authorName
          FROM   CollaborativeNotes n
          JOIN   Users u  ON u.userId  = n.patientId
          JOIN   Users ua ON ua.userId = n.authorId
          WHERE  n.isAlert = 1
          ORDER  BY n.createdAt DESC
          LIMIT  10`,
    args: [],
  });
  return result.rows;
}

export default async function AdminEmergency() {
  const [appointments, alerts] = await Promise.all([getPendingAppointments(), getAlerts()]);

  const now = new Date();
  const overdue  = appointments.filter(a => new Date(String(a.dateTime)) < now);
  const upcoming = appointments.filter(a => new Date(String(a.dateTime)) >= now);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" /> Urgencias y Alertas
          </h1>
          <p className="page-subtitle">
            {appointments.length} citas activas
            {overdue.length > 0 && (
              <> · <span className="text-red-600 font-medium">{overdue.length} vencidas</span></>
            )}
          </p>
        </div>
        {overdue.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-sm font-semibold">{overdue.length} cita(s) vencida(s)</span>
          </div>
        )}
      </div>

      {/* Collaborative alerts */}
      {alerts.length > 0 && (
        <div className="section-card overflow-hidden">
          <div className="section-card-header">
            <h3 className="section-card-title flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Alertas Clínicas
            </h3>
            <span className="badge-danger">{alerts.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {alerts.map(alert => (
              <div key={String(alert.noteId)} className="flex items-start gap-4 px-5 py-3.5 bg-red-50/30">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-slate-800">{String(alert.patientName)}</p>
                    <span className="badge-danger text-[10px]">⚠ Alerta</span>
                  </div>
                  <p className="text-sm text-slate-600">{String(alert.noteContent)}</p>
                  {alert.alertTags && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {String(alert.alertTags).split(',').map((t, i) => (
                        <span key={i} className="badge-warning text-[10px]">{t.trim()}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-1">Por {String(alert.authorName)} · {new Date(String(alert.createdAt)).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue appointments */}
      {overdue.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Citas Vencidas ({overdue.length})
          </h2>
          <div className="space-y-3">
            {overdue.map(apt => {
              const d = new Date(String(apt.dateTime));
              return (
                <div key={String(apt.appointmentId)} className="section-card border-l-4 border-red-400 overflow-hidden">
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{String(apt.patientName)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Médico: {String(apt.doctorName)}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })} · {d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {apt.allergies && (
                        <p className="text-xs text-amber-700 mt-1 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                          ⚠ Alergias: {String(apt.allergies)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="badge-danger">Vencida</span>
                      {apt.bloodType && (
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-bold">{String(apt.bloodType)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming active appointments */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Citas Activas Pendientes ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map(apt => {
              const d = new Date(String(apt.dateTime));
              return (
                <div key={String(apt.appointmentId)} className="section-card overflow-hidden">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{String(apt.patientName)}</p>
                      <p className="text-xs text-slate-500">Médico: {String(apt.doctorName)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })} · {d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={apt.status === 'Aceptada' ? 'badge-success' : 'badge-warning'}>
                      {String(apt.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {appointments.length === 0 && alerts.length === 0 && (
        <div className="section-card p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No hay urgencias ni alertas activas</p>
        </div>
      )}
    </div>
  );
}