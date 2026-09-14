"use client";

// /admin/vendors/accounts — the directory of vendors that approved
// applications became, as opposed to /admin/vendors, which is the
// applications themselves.
//
// "Include suspended" is off by default: the list is mostly read to answer
// "who can I offer this to", and a suspended vendor is not an answer to that.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "../../_components/AdminTable";
import { getAdminVendorAccounts } from "../../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../../_lib/useAdminToken";

const PAGE_SIZE = 20;

const COLUMNS = [
  { key: "businessName", label: "Business" },
  { key: "contactName", label: "Contact" },
  { key: "email", label: "Email" },
  {
    key: "serviceTypes",
    label: "Offered for",
    render: (r) => (Array.isArray(r.serviceTypes) && r.serviceTypes.length ? r.serviceTypes.join(", ") : "—"),
  },
  { key: "openOffers", label: "Open", render: (r) => r.openOffers ?? 0 },
  { key: "acceptedJobs", label: "Working", render: (r) => r.acceptedJobs ?? 0 },
  {
    key: "isActive",
    label: "Status",
    render: (r) => (
      <span className={`ad-badge st-${r.isActive ? "approved" : "rejected"}`}>
        {r.isActive ? "active" : "suspended"}
      </span>
    ),
  },
];

export default function AdminVendorAccountsView() {
  const token = useAdminToken();
  const router = useRouter();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token === undefined || token === null) return undefined;
    let live = true;
    setLoading(true);
    setError(null);
    getAdminVendorAccounts({ includeInactive, page, pageSize: PAGE_SIZE }, token)
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load the vendor directory.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, includeInactive, page]);

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Vendor accounts</h1>
          <p>Approved vendors, what they are offered work for, and what they are holding.</p>
        </div>
      </div>

      <div className="ad-toolbar">
        <label className="ad-toggle">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => {
              setIncludeInactive(e.target.checked);
              setPage(1);
            }}
          />
          <span className="ad-toggle-track">
            <span className="ad-toggle-thumb" />
          </span>
          <span className="ad-toggle-label">Include suspended</span>
        </label>
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
        emptyMessage="No vendor accounts yet — approve an application to create one."
        getRowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/admin/vendors/accounts/${r.id}`)}
      />
    </>
  );
}
