import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';
import { FileText, Download, FolderOpen } from 'lucide-react';
import type { ClinicalFileType } from '@/app/types';

interface Session { userId: number; }

const FILE_ICONS: Record<string, string> = {
  'Rayos X': '🫁', 'Resultados de Laboratorio': '🔬',
  'PDF Receta': '💊', 'PDF Plan Nutricional': '🥗', 'PDF Reporte Integral': '📋',
};
const FILE_BADGE: Record<string, string> = {
  'Rayos X': 'badge-info', 'Resultados de Laboratorio': 'badge-warning',
  'PDF Receta': 'badge-success', 'PDF Plan Nutricional': 'badge-purple', 'PDF Reporte Integral': 'badge-gray',
};

export default async function DoctorReports() {
  const session: Session = JSON.parse(cookies().get('session')?.value ?? '{}');

  const result = await db.execute({
    sql: `SELECT f.*,
                 c.consultationDate, c.diagnosis,
                 u.firstName || ' ' || u.lastName AS patientName
          FROM   ClinicalFiles f
          JOIN   Consultations c ON c.consultationId = f.consultationId
          JOIN   Appointments a  ON a.appointmentId  = c.appointmentId
          JOIN   Users u         ON u.userId         = a.patientId
          WHERE  a.doctorId = ?
          ORDER  BY c.consultationDate DESC`,
    args: [session.userId],
  });
  const files = result.rows;

  const stats: Record<string, number> = {};
  files.forEach(f => { const t = String(f.fileType); stats[t] = (stats[t] ?? 0) + 1; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Reportes Médicos</h1>
        <p className="page-subtitle">{files.length} archivos emitidos</p>
      </div>

      {Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(stats).map(([type, count]) => (
            <div key={type} className="stat-card text-center">
              <p className="text-2xl mb-1">{FILE_ICONS[type] ?? '📄'}</p>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{type}</p>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 ? (
        <div className="section-card p-12 text-center">
          <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No has emitido reportes aún</p>
        </div>
      ) : (
        <div className="section-card overflow-hidden">
          <div className="section-card-header">
            <h3 className="section-card-title">Archivos Emitidos</h3>
            <span className="badge-info">{files.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {files.map(f => (
              <div key={String(f.fileId)} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {FILE_ICONS[String(f.fileType)] ?? '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 truncate">{String(f.diagnosis)}</p>
                    <span className={FILE_BADGE[String(f.fileType)] ?? 'badge-gray'}>{String(f.fileType)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{String(f.patientName)} · {String(f.consultationDate)}</p>
                </div>
                {f.fileUrl && (
                  <a href={String(f.fileUrl)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0">
                    <Download className="w-3 h-3" /> Ver
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
