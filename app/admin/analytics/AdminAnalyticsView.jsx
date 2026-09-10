"use client";

// /admin/analytics — the full analyticsLast7d list from GET /admin/summary,
// as a plain name/count table. There is no dedicated analytics endpoint in
// the contract, so this reuses the summary call rather than inventing one.

import { useEffect, useState } from "react";
import { getAdminSummary } from "../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../_lib/useAdminToken";

export default function AdminAnalyticsView() {
  const token = useAdminToken();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    getAdminSummary(token)
      .then((data) => {
        if (live) setRows(Array.isArray(data?.analyticsLast7d) ? data.analyticsLast7d : []);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load analytics.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token]);

  const total = rows.reduce((sum, r) => sum + (r.count || 0), 0);

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Analytics</h1>
          <p>Event counts recorded over the last 7 days.</p>
        </div>
      </div>

      <div className="ad-table-wrap">
        <div className="ad-table-scroll">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Event name</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="ad-table-msg" colSpan={2}>
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="ad-table-msg ad-table-error" colSpan={2}>
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="ad-table-msg" colSpan={2}>
                    No analytics events recorded in the last 7 days.
                  </td>
                </tr>
              ) : (
                rows
                  .slice()
                  .sort((a, b) => b.count - a.count)
                  .map((r) => (
                    <tr key={r.name}>
                      <td>{r.name}</td>
                      <td>{r.count}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && rows.length > 0 && (
          <div className="ad-pager">
            <span>Total events: {total}</span>
          </div>
        )}
      </div>
    </>
  );
}
