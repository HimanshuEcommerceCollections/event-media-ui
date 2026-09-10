"use client";

// /admin/vendors — GET /admin/vendors?status=&page=&pageSize=, a status
// filter, and a click-through to /admin/vendors/:id.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "../_components/AdminTable";
import { getAdminVendors } from "../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../_lib/useAdminToken";

const STATUSES = ["new", "reviewing", "approved", "rejected"];
const PAGE_SIZE = 20;

const dateOf = (secs) => (typeof secs === "number" ? new Date(secs * 1000).toLocaleDateString() : "—");

const COLUMNS = [
  { key: "reference", label: "Reference", render: (r) => r.reference || r.id },
  { key: "businessName", label: "Business" },
  { key: "contactName", label: "Contact" },
  { key: "email", label: "Email" },
  {
    key: "serviceTypes",
    label: "Services",
    render: (r) => (Array.isArray(r.serviceTypes) ? r.serviceTypes.join(", ") : r.serviceTypes || "—"),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => <span className={`ad-badge st-${r.status}`}>{r.status}</span>,
  },
  { key: "createdAt", label: "Applied", render: (r) => dateOf(r.createdAt) },
];

export default function AdminVendorsView() {
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
    getAdminVendors({ status: status || undefined, page, pageSize: PAGE_SIZE }, token)
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load vendors.");
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
          <h1>Vendors</h1>
          <p>Vendor applications awaiting review.</p>
        </div>
      </div>

      <div className="ad-toolbar">
        <select value={status} onChange={onStatusChange}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
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
        emptyMessage="No vendor applications match this filter."
        getRowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/admin/vendors/${r.id}`)}
      />
    </>
  );
}
