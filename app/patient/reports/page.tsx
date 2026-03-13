import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';
import { FileText, Calendar, Download, FolderOpen } from 'lucide-react';
import type { ClinicalFileType } from '@/app/types';

interface Session { userId: number; }

async function getClinicalFiles(patientId: number) {
  const result = await db.execute({
    sql: `SELECT f.*,
                 c.consultationDate,
                 c.diagnosis,
                 u.firstName || ' ' || u.lastName AS doctorName
          FROM   ClinicalFiles f
          JOIN   Consultations c  ON c.consultationId = f.consultationId
          JOIN   Appointments a   ON a.appointmentId  = c.appointmentId
          JOIN   Users u          ON u.userId         = a.doctorId
          WHERE  a.patientId = ?
          ORDER  BY c.consultationDate DESC`,
    args: [patientId],
  });
  return result.rows;
}

const FILE_TYPE_CONFIG: Record<ClinicalFileType, { badge: string; icon: string }> = {
  'Rayos X':                   { badge: 'badge-info',    icon: '🫁' },
  'Resultados de Laboratorio': { badge: 'badge-warning', icon: '🔬' },
  'PDF Receta':                { badge: 'badge-success', icon: '💊' },
  'PDF Plan Nutricional':      { badge: 'badge-purple',  icon: '🥗' },
  'PDF Reporte Integral':      { badge: 'badge-gray',    icon: '📋' },
};

export default async function PatientReports() {
  const session: Session = JSON.parse(cookies().get('session')?.value ?? '{}');
  const files = await getClinicalFiles(session.userId);

  // Group by fileType
  const grouped = files.reduce<Record<string, typeof files>>((acc, f) => {
    const type = String(f.fileType);
    if (!acc[type]) acc[type] = [];
    acc[type].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mis Reportes</h1>
        <p className="page-subtitle">{files.length} archivos clínicos</p>
      </div>

      {/* Stats */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(FILE_TYPE_CONFIG).map(([type, cfg]) => {
            const count = (grouped[type] ?? []).length;
            return (
              <div key={type} className="stat-card text-center">
                <p className="text-2xl mb-1">{cfg.icon}</p>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{type}</p>
              </div>
            );
          })}
        </div>
      )}

      {files.length === 0 ? (
        <div className="section-card p-12 text-center">
          <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No tienes archivos clínicos registrados aún</p>
          <p className="text-slate-300 text-xs mt-1">Los archivos aparecerán aquí cuando tu médico los suba</p>
        </div>
      ) : (
        <div className="section-card overflow-hidden">
          <div className="section-card-header">
            <h3 className="section-card-title">Archivos Clínicos</h3>
            <span className="badge-info">{files.length}</span>
          </div>

          <div className="divide-y divide-slate-50">
            {files.map((f) => {
              const cfg = FILE_TYPE_CONFIG[f.fileType as ClinicalFileType] ?? { badge: 'badge-gray', icon: '📄' };
              return (
                <div key={String(f.fileId)} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">

                  {/* Icon */}
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {cfg.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800 truncate">{String(f.diagnosis)}</p>
                      <span className={cfg.badge}>{String(f.fileType)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{String(f.consultationDate)}
                      </span>
                      <span>{String(f.doctorName)}</span>
                    </div>
                  </div>

                  {/* Download */}
                  {f.fileUrl && (
                    <a
                      href={String(f.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                    >
                      <Download className="w-3 h-3" /> Ver
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}