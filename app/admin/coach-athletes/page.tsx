import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminCoachAthletesPage() {
  const result = await db.execute({
    sql: `SELECT ca.coachId, ca.patientId,
                 uc.firstName || ' ' || uc.lastName AS coachName,
                 up.firstName || ' ' || up.lastName AS patientName
          FROM   Coach_Athlete ca
          JOIN   Users uc ON uc.userId = ca.coachId
          JOIN   Users up ON up.userId = ca.patientId
          ORDER  BY ca.coachId, ca.patientId`,
    args: [],
  });
  const rows = result.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Entrenador – Atleta</h1>
        <p className="page-subtitle">Tabla <code className="text-slate-600">Coach_Athlete</code> (relación muchos a muchos)</p>
      </div>
      <AdminDataTable
        title="Coach_Athlete"
        rowKey={(row, i) => `${row.coachId}-${row.patientId}-${i}`}
        columns={[
          { key: 'coachId',     label: 'ID entrenador' },
          { key: 'coachName',   label: 'Entrenador' },
          { key: 'patientId',   label: 'ID atleta (paciente)' },
          { key: 'patientName', label: 'Atleta / paciente' },
        ]}
        rows={rows}
      />
    </div>
  );
}
