import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminMedicationsPage() {
  const [meds, batches] = await Promise.all([
    db.execute({
      sql:  `SELECT medicationId, brandName, activeIngredient, presentation, currentStock, reorderPoint
            FROM   Medications
            ORDER  BY medicationId`,
      args: [],
    }),
    db.execute({
      sql: `SELECT b.batchId, b.medicationId, b.quantity, b.entryDate, b.expirationDate,
                   m.brandName
            FROM   Batches b
            JOIN   Medications m ON m.medicationId = b.medicationId
            ORDER  BY b.expirationDate, b.batchId`,
      args: [],
    }),
  ]);

  const medRows    = meds.rows as Record<string, unknown>[];
  const batchRows  = batches.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Medicamentos y lotes</h1>
        <p className="page-subtitle">Tablas <code className="text-slate-600">Medications</code> y <code className="text-slate-600">Batches</code></p>
      </div>
      <AdminDataTable
        title="Medications"
        rowKey={row => Number(row.medicationId)}
        columns={[
          { key: 'medicationId',     label: 'ID' },
          { key: 'brandName',        label: 'Nombre comercial' },
          { key: 'activeIngredient', label: 'Activo' },
          { key: 'presentation',     label: 'Presentación' },
          { key: 'currentStock',     label: 'Stock' },
          { key: 'reorderPoint',     label: 'Punto reposición' },
        ]}
        rows={medRows}
      />
      <AdminDataTable
        title="Batches"
        rowKey={row => Number(row.batchId)}
        columns={[
          { key: 'batchId',        label: 'ID lote' },
          { key: 'medicationId',   label: 'ID medicamento' },
          { key: 'brandName',      label: 'Medicamento' },
          { key: 'quantity',       label: 'Cantidad' },
          { key: 'entryDate',      label: 'Entrada' },
          { key: 'expirationDate', label: 'Caducidad' },
        ]}
        rows={batchRows}
      />
    </div>
  );
}
