// app/admin/equipment/page.tsx
import { db } from '@/lib/db/client';
import { Wrench, AlertCircle } from 'lucide-react';

// Since the DB schema doesn't have a dedicated Equipment table,
// this page shows medication batches (medical supplies) as equipment inventory
async function getMedicalSupplies() {
  const result = await db.execute({
    sql: `SELECT b.*,
                 m.brandName, m.activeIngredient, m.presentation, m.currentStock, m.reorderPoint
          FROM   Batches b
          JOIN   Medications m ON m.medicationId = b.medicationId
          ORDER  BY b.expirationDate ASC`,
    args: [],
  });
  return result.rows;
}

async function getMedicationSummary() {
  const result = await db.execute({
    sql: `SELECT m.*,
                 COUNT(b.batchId) AS batchCount,
                 SUM(b.quantity)  AS totalBatchQty
          FROM   Medications m
          LEFT JOIN Batches b ON b.medicationId = m.medicationId
          GROUP  BY m.medicationId
          ORDER  BY m.brandName ASC`,
    args: [],
  });
  return result.rows;
}

export default async function AdminEquipment() {
  const [batches, medications] = await Promise.all([getMedicalSupplies(), getMedicationSummary()]);

  const expiringSoon = batches.filter(b => {
    if (!b.expirationDate) return false;
    const expiry = new Date(String(b.expirationDate));
    return (expiry.getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000 && expiry > new Date();
  });

  const expired = batches.filter(b => {
    if (!b.expirationDate) return false;
    return new Date(String(b.expirationDate)) < new Date();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Equipamiento e Inventario</h1>
        <p className="page-subtitle">
          {medications.length} medicamentos · {batches.length} lotes
          {(expiringSoon.length + expired.length) > 0 && (
            <> · <span className="text-amber-600">{expiringSoon.length + expired.length} con incidencias</span></>
          )}
        </p>
      </div>

      {/* Alerts */}
      {expired.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 text-sm font-semibold">{expired.length} lote(s) vencido(s)</p>
            <p className="text-red-700 text-sm mt-0.5">Retira estos lotes del inventario inmediatamente.</p>
          </div>
        </div>
      )}
      {expiringSoon.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 text-sm">
            {expiringSoon.length} lote(s) vencen en los próximos 90 días.
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Medicamentos', value: medications.length,    color: 'text-slate-800',   bg: 'bg-slate-50'   },
          { label: 'Total Lotes',         value: batches.length,        color: 'text-blue-700',    bg: 'bg-blue-50'    },
          { label: 'Próximos a Vencer',   value: expiringSoon.length,   color: 'text-amber-700',   bg: 'bg-amber-50'   },
          { label: 'Vencidos',            value: expired.length,        color: 'text-red-700',     bg: 'bg-red-50'     },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl p-4 ${bg}`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className={`text-sm font-medium mt-0.5 ${color} opacity-80`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Medications grid */}
      <div className="section-card overflow-hidden">
        <div className="section-card-header">
          <h3 className="section-card-title">Inventario de Medicamentos</h3>
        </div>
        {medications.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No hay medicamentos registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {medications.map(med => {
              const stock   = Number(med.currentStock);
              const reorder = Number(med.reorderPoint);
              const isLow   = stock <= reorder && reorder > 0;
              const isEmpty = stock === 0;
              return (
                <div
                  key={String(med.medicationId)}
                  className={`section-card ${isEmpty ? 'border-red-200' : isLow ? 'border-amber-200' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{String(med.brandName)}</h3>
                          <p className="text-xs text-slate-500">{med.activeIngredient ? String(med.activeIngredient) : 'Sin ingrediente'} · {med.presentation ? String(med.presentation) : '—'}</p>
                        </div>
                      </div>
                      <span className={isEmpty ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}>
                        {isEmpty ? 'Agotado' : isLow ? 'Stock Bajo' : 'En Stock'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'Stock Actual',   value: String(stock) },
                        { label: 'Punto Reorden',  value: reorder > 0 ? String(reorder) : '—' },
                        { label: 'Lotes',          value: String(med.batchCount ?? 0) },
                        { label: 'Total en Lotes', value: String(med.totalBatchQty ?? 0) },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 rounded-lg p-2">
                          <p className="text-slate-400 font-medium">{label}</p>
                          <p className="text-slate-700 font-semibold mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Batches table */}
      {batches.length > 0 && (
        <div className="section-card overflow-hidden">
          <div className="section-card-header">
            <h3 className="section-card-title">Detalle de Lotes</h3>
            <span className="badge-info">{batches.length}</span>
          </div>
          <table className="w-full">
            <thead className="table-header">
              <tr>
                {['Medicamento', 'Cantidad', 'Fecha Ingreso', 'Vencimiento', 'Estado'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map(b => {
                const expiry = b.expirationDate ? new Date(String(b.expirationDate)) : null;
                const isExp  = expiry && expiry < new Date();
                const isSoon = expiry && !isExp && (expiry.getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000;
                return (
                  <tr key={String(b.batchId)} className={`hover:bg-slate-50 transition-colors ${isExp ? 'bg-red-50/30' : isSoon ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{String(b.brandName)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{String(b.quantity ?? 0)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{b.entryDate ? String(b.entryDate) : '—'}</td>
                    <td className="px-4 py-3 text-xs">{b.expirationDate ? String(b.expirationDate) : '—'}</td>
                    <td className="px-4 py-3">
                      {isExp  ? <span className="badge-danger">Vencido</span>    :
                       isSoon ? <span className="badge-warning">Próximo vencer</span> :
                                <span className="badge-success">Vigente</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}