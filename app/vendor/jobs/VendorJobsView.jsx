"use client";

// /vendor/jobs — every offer on the account, filtered by status.
//
// The filter is client-side state driving a server-side query, the same shape
// the admin lists use. "All" is the default because a vendor arriving here
// from the sidebar pip usually wants the open ones, but the ones they have
// already answered are the other half of the answer to "where does this job
// stand".

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyVendorAssignments } from "../../../lib/api";
import { handleVendorAuthError, useVendorToken } from "../_lib/useVendorSession";

const FILTERS = [
  { key: "", label: "All" },
  { key: "offered", label: "Waiting on you" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
  { key: "declined", label: "Declined" },
  { key: "withdrawn", label: "Withdrawn" },
];

const PAGE_SIZE = 20;

export default function VendorJobsView() {
  const token = useVendorToken();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token === undefined || token === null) return undefined;
    let live = true;
    setLoading(true);
    setError(null);
    getMyVendorAssignments({ status: status || undefined, page, pageSize: PAGE_SIZE }, token)
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((err) => {
        if (!live || handleVendorAuthError(err)) return;
        setError(err.message || "Could not load your jobs.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, status, page]);

  const pageCount = Math.max(1, Math.ceil((result.total || 0) / (result.pageSize || PAGE_SIZE)));

  return (
    <>
      <div className="vd-head">
        <div>
          <h1>Jobs</h1>
          <p>Work you have been offered, and where each one stands.</p>
        </div>
      </div>

      <div className="vd-toolbar">
        {FILTERS.map((f) => (
          <button
            key={f.key || "all"}
            type="button"
            className={status === f.key ? "on" : undefined}
            onClick={() => {
              setStatus(f.key);
              setPage(1);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="vd-msg">Loading…</p>
      ) : error ? (
        <p className="vd-msg error">{error}</p>
      ) : result.items.length === 0 ? (
        <div className="vd-empty">
          {status
            ? "Nothing in this list yet."
            : "No jobs yet. A coordinator offers you work from a booking that includes one of your services."}
        </div>
      ) : (
        <div className="vd-jobs">
          {result.items.map((job) => (
            <Link className="vd-job" key={job.id} href={`/vendor/jobs/${job.id}`}>
              <div className="top">
                <span className="title">{job.serviceLabel}</span>
                <span className={`vd-badge st-${job.status}`}>{job.status}</span>
              </div>
              <div className="meta">
                <span>{job.booking?.eventType}</span>
                <span>{job.booking?.eventDate || "Date to confirm"}</span>
                <span>{job.booking?.headcountBand} guests</span>
                {job.booking?.eventZip ? <span>ZIP {job.booking.eventZip}</span> : null}
                <span className="pay">{job.payoutLabel ?? "Payout to confirm"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && result.total > result.pageSize && (
        <div className="vd-pager">
          <span>
            Page {result.page} of {pageCount} · {result.total} total
          </span>
          <span style={{ display: "flex", gap: 8 }}>
            <button type="button" disabled={result.page <= 1} onClick={() => setPage(result.page - 1)}>
              ← Prev
            </button>
            <button
              type="button"
              disabled={result.page >= pageCount}
              onClick={() => setPage(result.page + 1)}
            >
              Next →
            </button>
          </span>
        </div>
      )}
    </>
  );
}
