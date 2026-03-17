import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';
import { Stethoscope, Calendar, FileText, Pill } from 'lucide-react';

interface Session { userId: number; firstName: string; }

async function getConsultations(patientId: number) {
  const result = await db.execute({
    sql: `SELECT c.*,
                 u.firstName || ' ' || u.lastName AS doctorName,
                 a.dateTime
          FROM   Consultations c
          JOIN   Appointments a ON a.appointmentId = c.appointmentId
          JOIN   Users u        ON u.userId = a.doctorId
          WHERE  a.patientId = ?
          ORDER  BY c.consultationDate DESC`,
    args: [patientId],
  });
  return result.rows;
}

async function getPrescriptions(patientId: number) {
  const result = await db.execute({
    sql: `SELECT p.*, m.brandName, m.activeIngredient, m.presentation
          FROM   Prescriptions p
          JOIN   Medications m       ON m.medicationId = p.medicationId
          JOIN   Consultations c     ON c.consultationId = p.consultationId
          JOIN   Appointments a      ON a.appointmentId = c.appointmentId
          WHERE  a.patientId = ?`,
    args: [patientId],
  });
  return result.rows;
}

export default async function PatientConsultations() {
  const session: Session = JSON.parse(cookies().get('session')?.value ?? '{}');
  const [consultations, prescriptions] = await Promise.all([
    getConsultations(session.userId),
    getPrescriptions(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mis Consultas</h1>
        <p className="page-subtitle">{consultations.length} consultas registradas</p>
      </div>

      {consultations.length === 0 ? (
        <div className="section-card p-12 text-center">
          <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No tienes consultas registradas aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((con) => {
            const rxForThis = prescriptions.filter(
              p => p.consultationId === con.consultationId
            );

            return (
              <div key={String(con.consultationId)} className="section-card overflow-hidden">
                <div className="h-0.5 bg-blue-500" />
                <div className="p-5">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{String(con.diagnosis)}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{String(con.doctorName)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      {String(con.consultationDate)}
                    </div>
                  </div>

                  {/* Symptoms */}
                  {con.symptoms && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Síntomas</p>
                      <div className="flex flex-wrap gap-2">
                        {String(con.symptoms).split(',').map((s, i) => (
                          <span key={i} className="badge-gray">{s.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prescriptions */}
                  {rxForThis.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5" /> Prescripción
                      </p>
                      <div className="space-y-2">
                        {rxForThis.map((rx) => (
                          <div key={String(rx.prescriptionId)} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {String(rx.brandName)}
                                <span className="text-slate-500 font-normal"> — {String(rx.dosage)}</span>
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {String(rx.frequency)} · {String(rx.duration)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
