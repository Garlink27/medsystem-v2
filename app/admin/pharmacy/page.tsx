// app/admin/pharmacy/page.tsx
import { db } from '@/lib/db/client';
import { Pill, AlertTriangle } from 'lucide-react';

async function getMedications() {
  const result = await db.execute({
    sql: `SELECT m.*,
                 (SELECT COUNT(*) FROM Batches WHERE medicationId = m.medicationId) AS batchCount,
                 (SELECT MIN(expirationDate) FROM Batches WHERE medicationId = m.medicationId AND quantity > 0) AS nextExpiry
          FROM   Medications m
          ORDER  BY m.brandName ASC`,
    args: [],
  });
  return result.rows;
}

async function getBatches() {
  const result = await db.execute({
    sql: `SELECT b.*, m.brandName, m.activeIngredient
          FROM   Batches b
          JOIN   Medications m ON m.medicationId = b.medicationId
          ORDER  BY b.expirationDate ASC
          LIMIT  20`,
    args: [],
  });
  return result.rows;
}

function getStockStatus(stock: number, reorderPoint: number): { label: string; badge: string } {
  if (stock === 0)              return { label: 'Agotado',    badge: 'badge-danger'  };
  if (stock <= reorderPoint)    return { label: 'Stock Bajo', badge: 'badge-warning' };
  return                               { label: 'En Stock',   badge: 'badge-success' };
}

export default async function AdminPharmacy() {
  const [medications, batches] = await Promise.all([getMedications(), getBatches()]);

  const lowStock = medications.filter(m => Number(m.currentStock) <= Number(m.reorderPoint) && Number(m.reorderPoint) > 0);
  const outOfStock = medications.filter(m => Number(m.currentStock) === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Farmacia</h1>
        <p className="page-subtitle">
          {medications.length} medicamentos
          {lowStock.length > 0 && <> · <span className="text-amber-600 font-medium">{lowStock.length} alertas de stock</span></>}
        </p>
      </div>

      {/* Alert banner */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-semibold">Atención requerida en farmacia</p>
            <p className="text-amber-700 text-sm mt-0.5">
              {outOfStock.length > 0 && <>{outOfStock.length} agotados · </>}
              {lowStock.length > 0 && <>{lowStock.length} con stock bajo</>}
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Medicamentos', value: medications.length,    color: 'text-slate-800',   bg: 'bg-slate-50'   },
          { label: 'En Stock',           value: medications.filter(m => Number(m.currentStock) > Number(m.reorderPoint)).length, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Stock Bajo',         value: lowStock.length,        color: 'text-amber-700',   bg: 'bg-amber-50'   },
          { label: 'Agotados',           value: outOfStock.length,      color: 'text-red-700',     bg: 'bg-red-50'     },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl p-4 ${bg}`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className={`text-sm font-medium mt-0.5 ${color} opacity-80`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Medications table */}
      <div className="section-card overflow-hidden">
        <div className="section-card-header">
          <h3 className="section-card-title">Inventario de Medicamentos</h3>
          <span className="badge-info">{medications.length}</span>
        </div>
        {medications.length === 0 ? (
          <div className="p-12 text-center">
            <Pill className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No hay medicamentos registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="table-header">
              <tr>
                {['Medicamento', 'Ingrediente Activo', 'Presentación', 'Stock Actual', 'Punto Reorden', 'Lotes', 'Próx. Vencimiento', 'Estado'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medications.map(m => {
                const stock  = Number(m.currentStock);
                const reorder = Number(m.reorderPoint);
                const { label, badge } = getStockStatus(stock, reorder);
                return (
                  <tr
                    key={String(m.medicationId)}
                    className={`hover:bg-slate-50 transition-colors ${
                      stock === 0    ? 'bg-red-50/30'    :
                      stock <= reorder && reorder > 0 ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{String(m.brandName)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{String(m.activeIngredient ?? '—')}</td>
                    <td className="px-4 py-3">
                      <span className="badge-gray text-xs">{String(m.presentation ?? '—')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${
                        stock === 0        ? 'text-red-600'   :
                        stock <= reorder && reorder > 0 ? 'text-amber-600' : 'text-slate-800'
                      }`}>{stock}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{reorder > 0 ? reorder : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{String(m.batchCount)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{m.nextExpiry ? String(m.nextExpiry) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={badge}>{label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Batches table */}
      {batches.length > 0 && (
        <div className="section-card overflow-hidden">
          <div className="section-card-header">
            <h3 className="section-card-title">Lotes Próximos a Vencer</h3>
            <span className="badge-warning">{batches.length}</span>
          </div>
          <table className="w-full">
            <thead className="table-header">
              <tr>
                {['Medicamento', 'Cantidad', 'Fecha Ingreso', 'Vencimiento'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map(b => {
                const expiry = b.expirationDate ? new Date(String(b.expirationDate)) : null;
                const isExpiringSoon = expiry && (expiry.getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000;
                return (
                  <tr key={String(b.batchId)} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{String(b.brandName)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{String(b.quantity ?? 0)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{b.entryDate ? String(b.entryDate) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={isExpiringSoon ? 'badge-warning' : 'badge-gray'}>
                        {b.expirationDate ? String(b.expirationDate) : '—'}
                      </span>
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