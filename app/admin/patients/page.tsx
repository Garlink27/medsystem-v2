import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminPatientsPage() {
  const result = await db.execute({
    sql: `SELECT p.patientId, u.firstName, u.lastName, u.email,
                 p.dateOfBirth, p.gender, p.bloodType, p.allergies,
                 p.weight, p.height, p.isAthlete, p.schoolLevel
          FROM   Patients p
          JOIN   Users u ON u.userId = p.patientId
          ORDER  BY p.patientId`,
    args: [],
  });
  const rows = result.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Pacientes</h1>
        <p className="page-subtitle">Tabla <code className="text-slate-600">Patients</code> con datos de identidad desde <code className="text-slate-600">Users</code></p>
      </div>
      <AdminDataTable
        title="Pacientes"
        rowKey={row => Number(row.patientId)}
        columns={[
          { key: 'patientId',   label: 'ID paciente' },
          { key: 'firstName',   label: 'Nombre' },
          { key: 'lastName',    label: 'Apellido' },
          { key: 'email',       label: 'Correo' },
          { key: 'dateOfBirth', label: 'Nacimiento' },
          { key: 'gender',      label: 'Género' },
          { key: 'bloodType',   label: 'Tipo sangre' },
          { key: 'allergies',   label: 'Alergias' },
          { key: 'weight',      label: 'Peso (kg)' },
          { key: 'height',      label: 'Altura (m)' },
          { key: 'isAthlete',   label: 'Atleta (0/1)' },
          { key: 'schoolLevel', label: 'Escolaridad' },
        ]}
        rows={rows}
      />
    </div>
  );
}
