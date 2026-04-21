import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminClinicalFilesPage() {
  const result = await db.execute({
    sql: `SELECT f.fileId, f.consultationId, f.fileType, f.fileUrl,
                 c.appointmentId, c.diagnosis
          FROM   ClinicalFiles f
          JOIN   Consultations c ON c.consultationId = f.consultationId
          ORDER  BY f.fileId`,
    args: [],
  });
  const rows = result.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Archivos clínicos</h1>
        <p className="page-subtitle">Tabla <code className="text-slate-600">ClinicalFiles</code></p>
      </div>
      <AdminDataTable
        title="ClinicalFiles"
        rowKey={row => Number(row.fileId)}
        columns={[
          { key: 'fileId',          label: 'ID archivo' },
          { key: 'consultationId',  label: 'ID consulta' },
          { key: 'appointmentId',   label: 'ID cita' },
          { key: 'diagnosis',       label: 'Diagnóstico (consulta)' },
          { key: 'fileType',        label: 'Tipo' },
          { key: 'fileUrl',         label: 'URL / ruta' },
        ]}
        rows={rows}
      />
    </div>
  );
}
