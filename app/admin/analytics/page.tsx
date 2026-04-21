// app/admin/analytics/page.tsx
import { db } from '@/lib/db/client';
import { BarChart2, TrendingUp, Users, Calendar } from 'lucide-react';

async function getAnalyticsData() {
  const [
    totalPatients, totalDoctors, totalApts, completedApts,
    aptsByStatus, consultationsByMonth, nutritionalDiags, roleDistrib,
  ] = await Promise.all([
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Patients`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Users u JOIN Roles r ON r.roleId = u.roleId WHERE r.roleName IN ('Doctor','Jefe Médico','Nutriólogo')`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Appointments`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS total FROM Appointments WHERE status = 'Completada'`, args: [] }),
    db.execute({
      sql: `SELECT status, COUNT(*) AS count FROM Appointments GROUP BY status`,
      args: [],
    }),
    db.execute({
      sql: `SELECT substr(consultationDate, 1, 7) AS month, COUNT(*) AS count
            FROM   Consultations
            WHERE  consultationDate IS NOT NULL
            GROUP  BY month
            ORDER  BY month DESC
            LIMIT  6`,
      args: [],
    }),
    db.execute({
      sql: `SELECT nutritionalDiagnosis AS diagnosis, COUNT(*) AS count
            FROM   NutritionalProfiles
            WHERE  nutritionalDiagnosis IS NOT NULL
            GROUP  BY nutritionalDiagnosis`,
      args: [],
    }),
    db.execute({
      sql: `SELECT r.roleName, COUNT(*) AS count
            FROM   Users u
            JOIN   Roles r ON r.roleId = u.roleId
            GROUP  BY r.roleName`,
      args: [],
    }),
  ]);

  return {
    totalPatients: Number(totalPatients.rows[0]?.total ?? 0),
    totalDoctors:  Number(totalDoctors.rows[0]?.total ?? 0),
    totalApts:     Number(totalApts.rows[0]?.total ?? 0),
    completedApts: Number(completedApts.rows[0]?.total ?? 0),
    aptsByStatus:  aptsByStatus.rows,
    consultationsByMonth: consultationsByMonth.rows.reverse(),
    nutritionalDiags: nutritionalDiags.rows,
    roleDistrib:   roleDistrib.rows,
  };
}

const DIAG_BADGE: Record<string, string> = {
  Normal:      'badge-success',
  Sobrepeso:   'badge-warning',
  Obesidad:    'badge-danger',
  'Bajo peso': 'badge-purple',
};

const STATUS_COLORS: Record<string, string> = {
  Pendiente:  'bg-amber-400',
  Aceptada:   'bg-emerald-400',
  Completada: 'bg-blue-400',
  Cancelada:  'bg-red-400',
  Denegada:   'bg-purple-400',
};

export default async function AdminAnalytics() {
  const data = await getAnalyticsData();

  const completionRate = data.totalApts > 0
    ? Math.round((data.completedApts / data.totalApts) * 100)
    : 0;

  const maxConsultations = Math.max(...data.consultationsByMonth.map(r => Number(r.count)), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Analíticas del Sistema</h1>
        <p className="page-subtitle">Métricas y tendencias del hospital</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pacientes Registrados', value: data.totalPatients, icon: Users,    color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Médicos Activos',        value: data.totalDoctors,  icon: Users,    color: 'text-emerald-600',bg: 'bg-emerald-50'},
          { label: 'Total de Citas',         value: data.totalApts,     icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Tasa de Completación',   value: `${completionRate}%`,icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Appointments by status */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">Citas por Estado</h3>
          </div>
          <div className="p-5 space-y-3">
            {data.aptsByStatus.map(row => {
              const status = String(row.status);
              const count  = Number(row.count);
              const pct    = data.totalApts > 0 ? Math.round((count / data.totalApts) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600 font-medium">{status}</span>
                    <span className="font-bold text-slate-800">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_COLORS[status] ?? 'bg-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {data.aptsByStatus.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">Sin datos disponibles</p>
            )}
          </div>
        </div>

        {/* Consultations trend */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">Tendencia de Consultas (Últimos 6 meses)</h3>
          </div>
          <div className="p-5">
            {data.consultationsByMonth.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Sin datos disponibles</p>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {data.consultationsByMonth.map(row => {
                  const month = String(row.month);
                  const count = Number(row.count);
                  const height = Math.round((count / maxConsultations) * 100);
                  const [y, m] = month.split('-');
                  const label = new Date(Number(y), Number(m) - 1).toLocaleDateString('es-MX', { month: 'short' });
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-slate-700">{count}</span>
                      <div className="w-full flex items-end" style={{ height: 100 }}>
                        <div
                          className="w-full bg-blue-500 rounded-t-md transition-all hover:bg-blue-600"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 capitalize">{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Nutritional diagnoses */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">Diagnósticos Nutricionales</h3>
          </div>
          <div className="p-5">
            {data.nutritionalDiags.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Sin perfiles nutricionales registrados</p>
            ) : (
              <div className="space-y-3">
                {data.nutritionalDiags.map(row => {
                  const diag  = String(row.diagnosis);
                  const count = Number(row.count);
                  const total = data.nutritionalDiags.reduce((s, r) => s + Number(r.count), 0);
                  const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={diag} className="flex items-center gap-3">
                      <span className={`${DIAG_BADGE[diag] ?? 'badge-gray'} w-24 justify-center flex-shrink-0`}>{diag}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-bold text-slate-700 w-16 text-right">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* User role distribution */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">Distribución de Roles</h3>
          </div>
          <div className="p-5 space-y-0">
            {data.roleDistrib.map(row => (
              <div key={String(row.roleName)} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600">{String(row.roleName)}</span>
                <span className="text-sm font-bold text-slate-900">{String(row.count)}</span>
              </div>
            ))}
            {data.roleDistrib.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">Sin datos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}