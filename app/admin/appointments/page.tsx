import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminAppointmentsPage() {
  const result = await db.execute({
    sql: `SELECT a.appointmentId, a.patientId, a.doctorId, a.dateTime, a.status,
                 pu.firstName || ' ' || pu.lastName AS patientName,
                 du.firstName || ' ' || du.lastName AS doctorName
          FROM   Appointments a
          JOIN   Users pu ON pu.userId = a.patientId
          JOIN   Users du ON du.userId = a.doctorId
          ORDER  BY a.dateTime DESC`,
    args: [],
  });
  const rows = result.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Citas</h1>
        <p className="page-subtitle">Tabla <code className="text-slate-600">Appointments</code> con nombres de paciente y médico</p>
      </div>
      <AdminDataTable
        title="Appointments"
        rowKey={row => Number(row.appointmentId)}
        columns={[
          { key: 'appointmentId', label: 'ID cita' },
          { key: 'patientId',     label: 'ID paciente' },
          { key: 'patientName',   label: 'Paciente' },
          { key: 'doctorId',      label: 'ID médico' },
          { key: 'doctorName',    label: 'Médico' },
          { key: 'dateTime',      label: 'Fecha y hora' },
          { key: 'status',        label: 'Estado' },
        ]}
        rows={rows}
      />
    </div>
  );
}
