import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminPrescriptionsPage() {
  const result = await db.execute({
    sql: `SELECT pr.prescriptionId, pr.consultationId, pr.medicationId,
                 pr.dosage, pr.frequency, pr.duration,
                 m.brandName, m.activeIngredient,
                 c.appointmentId
          FROM   Prescriptions pr
          JOIN   Medications m ON m.medicationId = pr.medicationId
          JOIN   Consultations c ON c.consultationId = pr.consultationId
          ORDER  BY pr.prescriptionId`,
    args: [],
  });
  const rows = result.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Recetas</h1>
        <p className="page-subtitle">Tabla <code className="text-slate-600">Prescriptions</code> con medicamento y consulta</p>
      </div>
      <AdminDataTable
        title="Prescriptions"
        rowKey={row => Number(row.prescriptionId)}
        columns={[
          { key: 'prescriptionId',   label: 'ID receta' },
          { key: 'consultationId',   label: 'ID consulta' },
          { key: 'appointmentId',    label: 'ID cita' },
          { key: 'medicationId',     label: 'ID medicamento' },
          { key: 'brandName',        label: 'Medicamento' },
          { key: 'activeIngredient', label: 'Activo' },
          { key: 'dosage',           label: 'Dosis' },
          { key: 'frequency',        label: 'Frecuencia' },
          { key: 'duration',         label: 'Duración' },
        ]}
        rows={rows}
      />
    </div>
  );
}
