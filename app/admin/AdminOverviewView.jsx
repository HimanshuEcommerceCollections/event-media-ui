"use client";

// /admin — summary cards from GET /admin/summary, plus a short peek at the
// last 7 days of analytics events (the full breakdown lives at /admin/analytics).

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminSummary } from "../../lib/api";
import { handleAdminAuthError, useAdminToken } from "./_lib/useAdminToken";

const BOOKING_STATUSES = ["new", "confirmed", "in_progress", "completed", "cancelled"];
const VENDOR_STATUSES = ["new", "reviewing", "approved", "rejected"];

function StatusBreakdown({ byStatus, statuses }) {
  return (
    <div className="breakdown">
      {statuses.map((s) => (
        <span key={s} className={`ad-badge st-${s}`}>
          {s.replace("_", " ")}: {byStatus?.[s] ?? 0}
        </span>
      ))}
    </div>
  );
}

export default function AdminOverviewView() {
  const token = useAdminToken();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    getAdminSummary(token)
      .then((data) => {
        if (live) setSummary(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load the summary.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token]);

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Dashboard</h1>
          <p>Bookings, vendor applications and accounts at a glance.</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--tx3)", fontFamily: "var(--fmono)", fontSize: 12 }}>Loading…</p>
      ) : error ? (
        <p className="ad-table-error" style={{ fontFamily: "var(--fmono)", fontSize: 12 }}>
          {error}
        </p>
      ) : (
        <>
          <div className="ad-cards">
            <div className="ad-card">
              <h3>Bookings</h3>
              <div className="n">{summary?.bookings?.total ?? 0}</div>
              <StatusBreakdown byStatus={summary?.bookings?.byStatus} statuses={BOOKING_STATUSES} />
            </div>
            <div className="ad-card">
              <h3>Vendor applications</h3>
              <div className="n">{summary?.vendors?.total ?? 0}</div>
              <StatusBreakdown byStatus={summary?.vendors?.byStatus} statuses={VENDOR_STATUSES} />
            </div>
            <div className="ad-card">
              <h3>Users</h3>
              <div className="n">{summary?.users?.total ?? 0}</div>
            </div>
          </div>

          <div className="ad-section">
            <h2>Analytics — last 7 days</h2>
            {summary?.analyticsLast7d?.length ? (
              <table className="ad-table" style={{ border: "none" }}>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.analyticsLast7d.slice(0, 8).map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "var(--tx3)", fontSize: "0.85rem" }}>No analytics events recorded yet.</p>
            )}
            {summary?.analyticsLast7d?.length > 8 && (
              <p style={{ marginTop: 10 }}>
                <Link href="/admin/analytics" style={{ color: "#3b6d11", fontSize: "0.85rem" }}>
                  View full breakdown →
                </Link>
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
