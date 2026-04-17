function cellText(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'bigint') return v.toString();
  const s = String(v);
  return s === '' ? '—' : s;
}

export interface AdminColumn {
  key:   string;
  label: string;
}

export default function AdminDataTable({
  title,
  columns,
  rows,
  rowKey,
}: {
  title:   string;
  columns: AdminColumn[];
  rows:    Record<string, unknown>[];
  rowKey?: (row: Record<string, unknown>, index: number) => string | number;
}) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h3 className="section-card-title">{title}</h3>
        <span className="badge-gray text-[11px]">{rows.length} filas</span>
      </div>
      {rows.length === 0 ? (
        <p className="section-card-body text-slate-400 text-sm">Sin registros en esta tabla.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr>
                {columns.map(c => (
                  <th key={c.key} className="whitespace-nowrap">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={rowKey ? rowKey(row, i) : i} className="hover:bg-slate-50/80">
                  {columns.map(c => {
                    const raw = row[c.key];
                    const text = cellText(raw);
                    return (
                      <td
                        key={c.key}
                        className="px-4 py-2.5 text-slate-700 align-top max-w-[18rem]"
                      >
                        <span className="line-clamp-3 break-words" title={text}>
                          {text}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
