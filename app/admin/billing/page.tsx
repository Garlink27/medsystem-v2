// app/admin/billing/page.tsx
import { db } from '@/lib/db/client';
import { DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';

// ── Tipos ─────────────────────────────────────────────────────────────
interface BillingRow {
  appointmentId:     number;
  patientId:         number;
  doctorId:          number;
  dateTime:          string;
  status:            string;
  patientName:       string;
  doctorName:        string;
  doctorRole:        string;
  diagnosis:         string | null;
  prescriptionCount: number;
  fileCount:         number;
}

// ── Query ─────────────────────────────────────────────────────────────
async function getBillingData(): Promise<BillingRow[]> {
  const result = await db.execute({
    sql: `SELECT a.appointmentId, a.patientId, a.doctorId, a.dateTime, a.status,
                 up.firstName || ' ' || up.lastName AS patientName,
                 ud.firstName || ' ' || ud.lastName AS doctorName,
                 rd.roleName AS doctorRole,
                 c.diagnosis,
                 (SELECT COUNT(*) FROM Prescriptions p2
                    JOIN Consultations c2 ON c2.consultationId = p2.consultationId
                  WHERE c2.appointmentId = a.appointmentId) AS prescriptionCount,
                 (SELECT COUNT(*) FROM ClinicalFiles cf
                    JOIN Consultations c3 ON c3.consultationId = cf.consultationId
                  WHERE c3.appointmentId = a.appointmentId) AS fileCount
          FROM   Appointments a
          JOIN   Users up ON up.userId = a.patientId
          JOIN   Users ud ON ud.userId = a.doctorId
          JOIN   Roles rd ON rd.roleId = ud.roleId
          LEFT JOIN Consultations c ON c.appointmentId = a.appointmentId
          ORDER  BY a.dateTime DESC
          LIMIT  60`,
    args: [],
  });

  return result.rows.map(r => ({
    appointmentId:     Number(r.appointmentId),
    patientId:         Number(r.patientId),
    doctorId:          Number(r.doctorId),
    dateTime:          String(r.dateTime ?? ''),
    status:            String(r.status ?? ''),
    patientName:       String(r.patientName ?? ''),
    doctorName:        String(r.doctorName ?? ''),
    doctorRole:        String(r.doctorRole ?? ''),
    diagnosis:         r.diagnosis != null ? String(r.diagnosis) : null,
    prescriptionCount: Number(r.prescriptionCount ?? 0),
    fileCount:         Number(r.fileCount ?? 0),
  }));
}

// ── Helpers ───────────────────────────────────────────────────────────
const ROLE_PRICE: Record<string, number> = {
  Doctor:        500,
  'Jefe Médico': 800,
  Nutriólogo:    400,
  Entrenador:    300,
  Staff:         200,
};

function getBillingStatus(status: string): { label: string; badge: string } {
  if (status === 'Completada') return { label: 'Pagada',    badge: 'badge-success' };
  if (status === 'Aceptada')   return { label: 'Pendiente', badge: 'badge-warning' };
  if (status === 'Pendiente')  return { label: 'Por Cobrar',badge: 'badge-info'    };
  return                              { label: 'Cancelada', badge: 'badge-danger'  };
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function AdminBilling() {
  const appointments = await getBillingData();

  const rows = appointments.map(apt => {
    const base  = ROLE_PRICE[apt.doctorRole] ?? 400;
    const extra = apt.prescriptionCount * 50 + apt.fileCount * 100;
    const total = base + extra;
    const { label, badge } = getBillingStatus(apt.status);
    const paid  = apt.status === 'Completada' ? total : 0;
    return { ...apt, total, paid, label, badge };
  });

  const totalRevenue  = rows.reduce((s, r) => s + r.total, 0);
  const paidRevenue   = rows.reduce((s, r) => s + r.paid,  0);
  const pendingAmount = totalRevenue - paidRevenue;
  const paidCount     = rows.filter(r => r.paid > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Facturación</h1>
        <p className="page-subtitle">Control financiero del sistema</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Facturación Total', value: `$${totalRevenue.toLocaleString()}`,  icon: DollarSign,  color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Cobrado',           value: `$${paidRevenue.toLocaleString()}`,   icon: CheckCircle, color: 'text-emerald-600',bg: 'bg-emerald-50'},
          { label: 'Por Cobrar',        value: `$${pendingAmount.toLocaleString()}`, icon: Clock,       color: 'text-amber-600',  bg: 'bg-amber-50'  },
          { label: 'Citas Pagadas',     value: `${paidCount} / ${rows.length}`,      icon: XCircle,     color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">Nota:</span> Precios calculados por tipo de médico
          (Doctor: $500, Jefe Médico: $800, Nutriólogo: $400, Entrenador: $300)
          + $50 por prescripción + $100 por archivo clínico.
        </p>
      </div>

      {/* Table */}
      <div className="section-card overflow-hidden">
        <div className="section-card-header">
          <h3 className="section-card-title">Detalle de Facturación</h3>
          <span className="badge-info">{rows.length}</span>
        </div>
        <table className="w-full">
          <thead className="table-header">
            <tr>
              {['Paciente', 'Médico', 'Fecha', 'Diagnóstico', 'Total', 'Cobrado', 'Estado'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(row => {
              const d = new Date(row.dateTime);
              return (
                <tr key={row.appointmentId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{row.patientName}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700">{row.doctorName}</p>
                    <span className="badge-gray text-[10px]">{row.doctorRole}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-[140px] truncate">
                    {row.diagnosis ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                    ${row.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-emerald-700">
                    {row.paid > 0 ? `$${row.paid.toLocaleString()}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={row.badge}>{row.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}