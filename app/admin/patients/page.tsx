// app/admin/patients/page.tsx
import { db } from '@/lib/db/client';
import { Users } from 'lucide-react';

async function getPatients() {
  const result = await db.execute({
    sql: `SELECT u.userId, u.firstName, u.lastName, u.email,
                 p.dateOfBirth, p.gender, p.bloodType, p.allergies,
                 p.weight, p.height, p.isAthlete, p.schoolLevel
          FROM   Users u
          JOIN   Patients p ON p.patientId = u.userId
          ORDER  BY u.firstName ASC`,
    args: [],
  });
  return result.rows;
}

function calcAge(dob: string) {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default async function AdminPatients() {
  const patients = await getPatients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Gestión de Pacientes</h1>
          <p className="page-subtitle">{patients.length} pacientes registrados</p>
        </div>
      </div>

      <div className="section-card overflow-hidden">
        <div className="section-card-header">
          <h3 className="section-card-title">Todos los Pacientes</h3>
          <span className="badge-info">{patients.length}</span>
        </div>
        {patients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No hay pacientes registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="table-header">
              <tr>
                {['Paciente', 'Edad / Género', 'Sangre', 'Escolar', 'Peso / Talla', 'Alergias', 'Atleta'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map(p => (
                <tr key={String(p.userId)} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {String(p.firstName)[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{String(p.firstName)} {String(p.lastName)}</p>
                        <p className="text-xs text-slate-400">{String(p.email)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {p.dateOfBirth ? calcAge(String(p.dateOfBirth)) : '—'}a · {String(p.gender) === 'F' ? 'Femenino' : String(p.gender) === 'M' ? 'Masculino' : 'Otro'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-bold">{String(p.bloodType ?? '—')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge-gray text-xs">{String(p.schoolLevel ?? '—')}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {p.weight ? `${p.weight} kg` : '—'} / {p.height ? `${p.height} m` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[140px] truncate">
                    {p.allergies ? (
                      <span className="badge-warning">{String(p.allergies).slice(0, 20)}{String(p.allergies).length > 20 ? '…' : ''}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {Number(p.isAthlete) === 1
                      ? <span className="badge-success">Sí</span>
                      : <span className="text-slate-300 text-xs">No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}