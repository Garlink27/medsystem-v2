import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminUsersPage() {
  const result = await db.execute({
    sql: `SELECT u.userId, u.firstName, u.lastName, u.email, u.roleId, r.roleName
          FROM   Users u
          JOIN   Roles r ON r.roleId = u.roleId
          ORDER  BY u.userId`,
    args: [],
  });
  const rows = result.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Usuarios</h1>
        <p className="page-subtitle">Tabla <code className="text-slate-600">Users</code> unida a <code className="text-slate-600">Roles</code> (sin exponer contraseñas)</p>
      </div>
      <AdminDataTable
        title="Usuarios"
        rowKey={row => Number(row.userId)}
        columns={[
          { key: 'userId',    label: 'ID' },
          { key: 'firstName', label: 'Nombre' },
          { key: 'lastName',  label: 'Apellido' },
          { key: 'email',     label: 'Correo' },
          { key: 'roleId',    label: 'Rol ID' },
          { key: 'roleName',  label: 'Rol' },
        ]}
        rows={rows}
      />
    </div>
  );
}
