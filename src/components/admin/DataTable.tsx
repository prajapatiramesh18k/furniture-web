import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, rowIndex: number) => ReactNode;
  accessor?: (row: T) => ReactNode;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
  minWidth?: number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  /** Enable row numbering (1, 2, 3...). Default: true */
  showRowNumbers?: boolean;
  /** Current page number (1-based) for pagination-aware numbering */
  page?: number;
  /** Page size for pagination-aware numbering */
  pageSize?: number;
  /** Custom header for the row number column */
  rowNumberHeader?: string;
  /** Custom render for row number cell */
  renderRowNumber?: (index: number, row: T) => ReactNode;
}

export default function DataTable<T extends object>({
  columns,
  rows,
  emptyText = 'No records found',
  minWidth,
  onRowClick,
  loading = false,
  showRowNumbers = true,
  page = 1,
  pageSize = 10,
  rowNumberHeader = '#',
  renderRowNumber,
}: DataTableProps<T>) {
  if (!rows || rows.length === 0) {
    if (loading) {
      return (
        <div className="ahf-tablewrap">
          <table className="ahf-table">
            <thead>
              <tr>
                {showRowNumbers && <th key="__rowNum__">{rowNumberHeader}</th>}
                {columns.map((c) => (
                  <th key={c.key}>{c.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {showRowNumbers && <td key="__rowNum__"><div className="ahf-skel" style={{ height: 18, borderRadius: 4, width: 30 }} /></td>}
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
  const startIndex = (page - 1) * pageSize;
  return (
    <div className="ahf-tablewrap">
      <table className="ahf-table" style={minWidth !== undefined ? { minWidth } : undefined}>
        <thead>
          <tr>
            {showRowNumbers && <th key="__rowNum__">{rowNumberHeader}</th>}
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const rowNumber = startIndex + i + 1;
            return (
              <tr
                key={keyOf(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {showRowNumbers && (
                  <td key="__rowNum__" style={{ textAlign: 'center', fontWeight: 600, color: '#6e4c22', width: 48, whiteSpace: 'nowrap' }}>
                    {renderRowNumber ? renderRowNumber(rowNumber, row) : rowNumber}
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row, rowNumber) : c.accessor ? c.accessor(row) : null}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
