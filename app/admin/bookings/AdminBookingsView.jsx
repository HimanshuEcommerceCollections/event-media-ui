"use client";

// /admin/bookings — GET /admin/bookings?status=&page=&pageSize=, a status
// filter, and a click-through to /admin/bookings/:id for the full readout +
// the status-change control.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "../_components/AdminTable";
import { getAdminBookings } from "../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../_lib/useAdminToken";

const STATUSES = ["new", "confirmed", "in_progress", "completed", "cancelled"];
const PAGE_SIZE = 20;

const money = (cents) =>
  typeof cents === "number" ? `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}` : "—";

const dateOf = (secs) => (typeof secs === "number" ? new Date(secs * 1000).toLocaleDateString() : "—");

const COLUMNS = [
  { key: "requestId", label: "Request", render: (r) => r.requestId || r.id },
  { key: "brand", label: "Brand" },
  { key: "eventType", label: "Event type" },
  { key: "eventDate", label: "Event date", render: (r) => r.eventDate || "—" },
  {
    key: "status",
    label: "Status",
    render: (r) => <span className={`ad-badge st-${r.status}`}>{String(r.status).replace("_", " ")}</span>,
  },
  { key: "packageTotal", label: "Total", render: (r) => money(r.packageTotal) },
  { key: "createdAt", label: "Created", render: (r) => dateOf(r.createdAt) },
];

export default function AdminBookingsView() {
  const token = useAdminToken();
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    setError(null);
    getAdminBookings({ status: status || undefined, page, pageSize: PAGE_SIZE }, token)
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load bookings.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, status, page]);

  const onStatusChange = useCallback((e) => {
    setStatus(e.target.value);
    setPage(1);
  }, []);

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Bookings</h1>
          <p>Event booking requests, one row per request.</p>
        </div>
      </div>

      <div className="ad-toolbar">
        <select value={status} onChange={onStatusChange}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <AdminTable
        columns={COLUMNS}
        rows={result.items}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        onPageChange={setPage}
        loading={loading}
        error={error}
        emptyMessage="No bookings match this filter."
        getRowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/admin/bookings/${r.id}`)}
      />
    </>
  );
}
