import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';
import { User, Mail, Shield } from 'lucide-react';

interface Session { userId: number; firstName: string; lastName: string; email: string; roleName: string; }

export default async function DoctorProfile() {
  const session: Session = JSON.parse(cookies().get('session')?.value ?? '{}');

  const result = await db.execute({
    sql: `SELECT u.*, r.roleName,
                 (SELECT COUNT(*) FROM Appointments WHERE doctorId = u.userId) AS totalApts,
                 (SELECT COUNT(DISTINCT patientId) FROM Appointments WHERE doctorId = u.userId) AS totalPatients,
                 (SELECT COUNT(*) FROM Appointments WHERE doctorId = u.userId AND status = 'Completada') AS completed
          FROM Users u JOIN Roles r ON r.roleId = u.roleId
          WHERE u.userId = ?`,
    args: [session.userId],
  });
  const doc = result.rows[0];
  if (!doc) return <p className="text-slate-500">Perfil no encontrado.</p>;

  const initials = `${String(doc.firstName)[0]}${String(doc.lastName)[0]}`.toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title">Mi Perfil</h1>
        <p className="page-subtitle">Información de tu cuenta médica</p>
      </div>

      {/* Hero */}
      <div className="section-card">
        <div className="p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{String(doc.firstName)} {String(doc.lastName)}</h2>
            <p className="text-blue-600 font-medium">{String(doc.roleName)}</p>
            <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />{String(doc.email)}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge-success">Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Citas',    value: doc.totalApts },
          { label: 'Pacientes',      value: doc.totalPatients },
          { label: 'Completadas',    value: doc.completed },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card text-center">
            <p className="text-3xl font-bold text-slate-900">{String(value)}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="section-card">
        <div className="section-card-header">
          <h3 className="section-card-title flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" /> Información Profesional
          </h3>
        </div>
        <div className="section-card-body">
          {[
            { label: 'Nombre completo', value: `${String(doc.firstName)} ${String(doc.lastName)}` },
            { label: 'Correo',          value: String(doc.email) },
            { label: 'Rol',             value: String(doc.roleName) },
            { label: 'ID de usuario',   value: String(doc.userId) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500">{label}</span>
              <span className="text-sm font-medium text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
