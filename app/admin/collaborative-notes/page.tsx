import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminCollaborativeNotesPage() {
  const result = await db.execute({
    sql: `SELECT n.noteId, n.patientId, n.authorId, n.noteContent, n.isAlert, n.alertTags, n.createdAt,
                 pu.firstName || ' ' || pu.lastName AS patientName,
                 au.firstName || ' ' || au.lastName AS authorName
          FROM   CollaborativeNotes n
          JOIN   Users pu ON pu.userId = n.patientId
          JOIN   Users au ON au.userId = n.authorId
          ORDER  BY n.noteId DESC`,
    args: [],
  });
  const rows = result.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Notas colaborativas</h1>
        <p className="page-subtitle">Tabla <code className="text-slate-600">CollaborativeNotes</code></p>
      </div>
      <AdminDataTable
        title="CollaborativeNotes"
        rowKey={row => Number(row.noteId)}
        columns={[
          { key: 'noteId',       label: 'ID' },
          { key: 'patientId',    label: 'ID paciente' },
          { key: 'patientName',  label: 'Paciente' },
          { key: 'authorId',     label: 'ID autor' },
          { key: 'authorName',   label: 'Autor' },
          { key: 'noteContent',  label: 'Contenido' },
          { key: 'isAlert',      label: 'Alerta (0/1)' },
          { key: 'alertTags',    label: 'Etiquetas alerta' },
          { key: 'createdAt',    label: 'Creado' },
        ]}
        rows={rows}
      />
    </div>
  );
}
