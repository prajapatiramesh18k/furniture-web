import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => ReactNode;
}

export default function DataTable<T extends object>({
  columns,
  rows,
  emptyText = 'No records found',
  minWidth,
  onRowClick,
  loading = false,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
  minWidth?: number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}) {
  if (!rows || rows.length === 0) {
    if (loading) {
      return (
        <div className="ahf-tablewrap">
          <table className="ahf-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key}><div className="ahf-skel" style={{ height: 18, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <p style={{ padding: 18, color: 'var(--ahf-muted)', fontSize: 13 }}>{emptyText}</p>;
  }
  const keyOf = (row: T, i: number) => {
    const r = row as { _id?: unknown; id?: unknown };
    return String(r._id ?? r.id ?? i);
  };
  return (
    <div className="ahf-tablewrap">
      <table className="ahf-table" style={minWidth !== undefined ? { minWidth } : undefined}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={keyOf(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
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
