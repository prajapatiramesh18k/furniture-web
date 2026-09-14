import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => ReactNode;
}

export default function DataTable<T extends { _id?: string; id?: string | number }>({
  columns,
  rows,
  emptyText = 'No records found',
  minWidth,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
  minWidth?: number;
}) {
  if (!rows || rows.length === 0) {
    return <p style={{ padding: 18, color: 'var(--ahf-muted)', fontSize: 13 }}>{emptyText}</p>;
  }
  return (
    <div className="ahf-tablewrap">
      <table className="ahf-table" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={String(row._id ?? row.id ?? i)}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : c.accessor ? c.accessor(row) : null}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
