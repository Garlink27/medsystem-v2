// app/admin/laboratory/page.tsx
import { db } from '@/lib/db/client';
import { FlaskConical, FileText } from 'lucide-react';

async function getClinicalFiles() {
  const result = await db.execute({
    sql: `SELECT f.*,
                 c.consultationDate, c.diagnosis,
                 up.firstName || ' ' || up.lastName AS patientName,
                 ud.firstName || ' ' || ud.lastName AS doctorName
          FROM   ClinicalFiles f
          JOIN   Consultations c ON c.consultationId = f.consultationId
          JOIN   Appointments a  ON a.appointmentId  = c.appointmentId
          JOIN   Users up        ON up.userId        = a.patientId
          JOIN   Users ud        ON ud.userId        = a.doctorId
          ORDER  BY c.consultationDate DESC`,
    args: [],
  });
  return result.rows;
}

async function getPrescriptions() {
  const result = await db.execute({
    sql: `SELECT p.*,
                 m.brandName, m.activeIngredient, m.presentation,
                 c.consultationDate, c.diagnosis,
                 up.firstName || ' ' || up.lastName AS patientName,
                 ud.firstName || ' ' || ud.lastName AS doctorName
          FROM   Prescriptions p
          JOIN   Medications m  ON m.medicationId    = p.medicationId
          JOIN   Consultations c ON c.consultationId = p.consultationId
          JOIN   Appointments a  ON a.appointmentId  = c.appointmentId
          JOIN   Users up        ON up.userId        = a.patientId
          JOIN   Users ud        ON ud.userId        = a.doctorId
          ORDER  BY c.consultationDate DESC
          LIMIT  50`,
    args: [],
  });
  return result.rows;
}

const FILE_ICON: Record<string, string> = {
  'Rayos X': '🫁', 'Resultados de Laboratorio': '🔬',
  'PDF Receta': '💊', 'PDF Plan Nutricional': '🥗', 'PDF Reporte Integral': '📋',
};
const FILE_BADGE: Record<string, string> = {
  'Rayos X': 'badge-info', 'Resultados de Laboratorio': 'badge-warning',
  'PDF Receta': 'badge-success', 'PDF Plan Nutricional': 'badge-purple', 'PDF Reporte Integral': 'badge-gray',
};

export default async function AdminLaboratory() {
  const [files, prescriptions] = await Promise.all([getClinicalFiles(), getPrescriptions()]);

  const filesByType = files.reduce<Record<string, number>>((acc, f) => {
    const t = String(f.fileType);
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  const labFiles = files.filter(f => f.fileType === 'Resultados de Laboratorio');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Laboratorio & Archivos Clínicos</h1>
        <p className="page-subtitle">{files.length} archivos clínicos · {prescriptions.length} prescripciones</p>
      </div>

      {/* File type summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(filesByType).map(([type, count]) => (
          <div key={type} className="stat-card text-center">
            <p className="text-2xl mb-1">{FILE_ICON[type] ?? '📄'}</p>
            <p className="text-2xl font-bold text-slate-900">{count}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{type}</p>
          </div>
        ))}
      </div>

      {/* Clinical files */}
      <div className="section-card overflow-hidden">
        <div className="section-card-header">
          <h3 className="section-card-title">Archivos Clínicos</h3>
          <span className="badge-info">{files.length}</span>
        </div>
        {files.length === 0 ? (
          <div className="p-12 text-center">
            <FlaskConical className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No hay archivos clínicos registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="table-header">
              <tr>
                {['Paciente', 'Doctor', 'Diagnóstico', 'Tipo de Archivo', 'Fecha', 'Archivo'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map(f => (
                <tr key={String(f.fileId)} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{String(f.patientName)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{String(f.doctorName)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 max-w-[180px] truncate">{String(f.diagnosis)}</td>
                  <td className="px-4 py-3">
                    <span className={FILE_BADGE[String(f.fileType)] ?? 'badge-gray'}>
                      {FILE_ICON[String(f.fileType)] ?? '📄'} {String(f.fileType)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{String(f.consultationDate)}</td>
                  <td className="px-4 py-3">
                    {f.fileUrl && !String(f.fileUrl).startsWith('data:text') ? (
                      <a href={String(f.fileUrl)} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline font-medium">Ver →</a>
                    ) : <span className="text-xs text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Prescriptions */}
      {prescriptions.length > 0 && (
        <div className="section-card overflow-hidden">
          <div className="section-card-header">
            <h3 className="section-card-title">Prescripciones Recientes</h3>
            <span className="badge-success">{prescriptions.length}</span>
          </div>
          <table className="w-full">
            <thead className="table-header">
              <tr>
                {['Paciente', 'Medicamento', 'Ingrediente Activo', 'Dosis', 'Frecuencia', 'Duración', 'Fecha'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescriptions.map(p => (
                <tr key={String(p.prescriptionId)} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{String(p.patientName)}</td>
                  <td className="px-4 py-3 text-sm text-slate-800 font-semibold">{String(p.brandName)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.activeIngredient ? String(p.activeIngredient) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{p.dosage ? String(p.dosage) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.frequency ? String(p.frequency) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.duration ? String(p.duration) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{String(p.consultationDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}