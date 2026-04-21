import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminConsultationsPage() {
  const result = await db.execute({
    sql: `SELECT c.consultationId, c.appointmentId, c.diagnosis, c.symptoms, c.consultationDate,
                 a.patientId, a.doctorId, a.dateTime AS appointmentDateTime, a.status AS appointmentStatus
          FROM   Consultations c
          JOIN   Appointments a ON a.appointmentId = c.appointmentId
          ORDER  BY c.consultationId`,
    args: [],
  });
  const rows = result.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Consultas</h1>
        <p className="page-subtitle">Tabla <code className="text-slate-600">Consultations</code> con contexto de la cita (<code className="text-slate-600">Appointments</code>)</p>
      </div>
      <AdminDataTable
        title="Consultations"
        rowKey={row => Number(row.consultationId)}
        columns={[
          { key: 'consultationId',      label: 'ID consulta' },
          { key: 'appointmentId',       label: 'ID cita' },
          { key: 'patientId',           label: 'ID paciente' },
          { key: 'doctorId',            label: 'ID médico' },
          { key: 'appointmentDateTime', label: 'Cita (fecha/hora)' },
          { key: 'appointmentStatus',   label: 'Estado cita' },
          { key: 'consultationDate',    label: 'Fecha consulta' },
          { key: 'symptoms',            label: 'Síntomas' },
          { key: 'diagnosis',           label: 'Diagnóstico' },
        ]}
        rows={rows}
      />
    </div>
  );
}
