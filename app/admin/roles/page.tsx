import { db } from '@/lib/db/client';
import AdminDataTable from '@/app/admin/components/AdminDataTable';

export default async function AdminRolesPage() {
  const result = await db.execute({
    sql:  'SELECT roleId, roleName FROM Roles ORDER BY roleId',
    args: [],
  });
  const rows = result.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Roles</h1>
        <p className="page-subtitle">Tabla <code className="text-slate-600">Roles</code> — catálogo de perfiles del sistema</p>
      </div>
      <AdminDataTable
        title="Roles"
        rowKey={row => Number(row.roleId)}
        columns={[
          { key: 'roleId',   label: 'ID' },
          { key: 'roleName', label: 'Nombre del rol' },
        ]}
        rows={rows}
      />
    </div>
  );
}
