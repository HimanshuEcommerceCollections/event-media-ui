"use client";

// Generic list table shared by every admin screen. Callers hand it `columns`
// ({ key, label, render? }), the current page of `rows`, and the pagination
// numbers; it owns the loading/empty/error states and the prev/next pager so
// no list screen has to reimplement any of that.

export default function AdminTable({
  columns,
  rows,
  page = 1,
  pageSize = 20,
  total = 0,
  onPageChange,
  loading = false,
  error = null,
  emptyMessage = "Nothing here yet.",
  getRowKey,
  onRowClick,
}) {
  const pageCount = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const rowList = Array.isArray(rows) ? rows : [];

  return (
    <div className="ad-table-wrap">
      <div className="ad-table-scroll">
        <table className="ad-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="ad-table-msg" colSpan={columns.length}>
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="ad-table-msg ad-table-error" colSpan={columns.length}>
                  {error}
                </td>
              </tr>
            ) : rowList.length === 0 ? (
              <tr>
                <td className="ad-table-msg" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rowList.map((row, i) => (
                <tr
                  key={getRowKey ? getRowKey(row) : i}
                  className={onRowClick ? "ad-row-link" : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((c) => (
                    <td key={c.key} data-label={c.label}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {onPageChange && !loading && !error && (
        <div className="ad-pager">
          <span>
            Page {page} of {pageCount} · {total} total
          </span>
          <div className="ad-pager-btns">
            <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              ← Prev
            </button>
            <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
