"use client";

// /vendor/jobs/:id — one offer, with the accept/decline controls.
//
// The customer's contact block is absent until the job is accepted. That is
// the server's rule, not this page's — GET /vendors/me/assignments/:id sends
// `booking.contact` as null before then — so the panel explains the gap
// instead of rendering empty fields the vendor might think are a bug.
//
// Answering can lose a race: an offer withdrawn while this page was open, or
// answered in another tab, comes back 409. The reply carries the status it is
// actually in, so the page reloads the job rather than insisting on what it
// last painted.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  completeVendorAssignment,
  getMyVendorAssignment,
  respondToVendorAssignment,
} from "../../../../lib/api";
import { handleVendorAuthError, useVendorToken } from "../../_lib/useVendorSession";

const stamp = (secs) => (typeof secs === "number" ? new Date(secs * 1000).toLocaleString() : "—");

export default function VendorJobDetailView({ id }) {
  const token = useVendorToken();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(null);
  const [hint, setHint] = useState("");

  const load = useCallback(
    (signal) => {
      if (token === undefined || token === null) return;
      setLoading(true);
      getMyVendorAssignment(id, token)
        .then((data) => {
          if (!signal?.cancelled) setJob(data);
        })
        .catch((err) => {
          if (signal?.cancelled || handleVendorAuthError(err)) return;
          setError(err.message || "Could not load this job.");
        })
        .finally(() => {
          if (!signal?.cancelled) setLoading(false);
        });
    },
    [token, id],
  );

  useEffect(() => {
    const signal = { cancelled: false };
    load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  const respond = async (action) => {
    setPending(action);
    setHint("");
    try {
      setJob(await respondToVendorAssignment(id, action, note.trim() || undefined, token));
      setNote("");
      setHint(action === "accept" ? "Accepted — the coordinator has been told." : "Declined.");
    } catch (err) {
      if (handleVendorAuthError(err)) return;
      setHint(err.message || "Could not send your answer.");
      // 409 means this offer moved while the page was open, so what is on
      // screen is out of date whatever the message says.
      if (err?.status === 409) load();
    } finally {
      setPending(null);
    }
  };

  const markComplete = async () => {
    setPending("complete");
    setHint("");
    try {
      setJob(await completeVendorAssignment(id, token));
      setHint("Marked complete.");
    } catch (err) {
      if (handleVendorAuthError(err)) return;
      setHint(err.message || "Could not mark this complete.");
    } finally {
      setPending(null);
    }
  };

  if (loading) {
    return (
      <>
        <Link className="vd-back" href="/vendor/jobs">
          ← Back to jobs
        </Link>
        <p className="vd-msg">Loading…</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Link className="vd-back" href="/vendor/jobs">
          ← Back to jobs
        </Link>
        <p className="vd-msg error">{error}</p>
      </>
    );
  }

  const booking = job.booking ?? {};
  const answerable = job.status === "offered";

  return (
    <>
      <Link className="vd-back" href="/vendor/jobs">
        ← Back to jobs
      </Link>

      <div className="vd-head">
        <div>
          <h1>{job.serviceLabel}</h1>
          <p>
            {booking.eventType} · {booking.eventDate || "date to confirm"} ·{" "}
            {booking.headcountBand} guests
          </p>
        </div>
        <span className={`vd-badge st-${job.status}`}>{job.status}</span>
      </div>

      {booking.largeEventFlag ? (
        <div className="vd-section" style={{ borderColor: "var(--gold)" }}>
          <h2>Large event</h2>
          <p style={{ color: "var(--tx2)", fontSize: "0.9rem", margin: 0 }}>
            A coordinator is shaping this package with the customer, so the brief may still move.
            Check with them before committing kit or crew.
          </p>
        </div>
      ) : null}

      <div className="vd-section">
        <h2>The job</h2>
        <dl className="vd-kv">
          <dt>Service</dt>
          <dd>{job.serviceLabel}</dd>
          <dt>Your payout</dt>
          <dd>{job.payoutLabel ?? "To be confirmed by your coordinator"}</dd>
          <dt>Event type</dt>
          <dd>{booking.eventType || "—"}</dd>
          <dt>Date</dt>
          <dd>{booking.eventDate || "To confirm"}</dd>
          <dt>Headcount</dt>
          <dd>{booking.headcountBand || "—"}</dd>
          <dt>Area</dt>
          <dd>{booking.eventZip ? `ZIP ${booking.eventZip}` : "—"}</dd>
          <dt>Reference</dt>
          <dd>{booking.requestId || "—"}</dd>
          <dt>Offered</dt>
          <dd>{stamp(job.offeredAt)}</dd>
          {job.respondedAt ? (
            <>
              <dt>You answered</dt>
              <dd>{stamp(job.respondedAt)}</dd>
            </>
          ) : null}
        </dl>
      </div>

      {job.requirements?.length ? (
        <div className="vd-section">
          <h2>What was asked for</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--tx2)", fontSize: "0.9rem" }}>
            {job.requirements.map((part, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {part.label}
                {part.detail ? ` — ${part.detail}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {job.note ? (
        <div className="vd-section">
          <h2>From your coordinator</h2>
          <p style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", margin: 0 }}>{job.note}</p>
        </div>
      ) : null}

      <div className="vd-section">
        <h2>Customer</h2>
        {booking.contact ? (
          <dl className="vd-kv">
            <dt>Name</dt>
            <dd>{booking.contact.fullName || "—"}</dd>
            <dt>Email</dt>
            <dd>{booking.contact.email || "—"}</dd>
            <dt>Phone</dt>
            <dd>{booking.contact.phone || "—"}</dd>
          </dl>
        ) : (
          <div className="vd-locked">
            Contact details unlock when you accept. Until then the event, the date and the area are
            everything you need to decide — and the customer is not handed out to vendors who have
            not taken the job.
          </div>
        )}
      </div>

      {answerable ? (
        <div className="vd-section">
          <h2>Your answer</h2>
          <div className="vd-form">
            <div className="vd-field">
              <label htmlFor="vd-note">Note for the coordinator (optional)</label>
              <textarea
                id="vd-note"
                value={note}
                placeholder="Anything they should know — kit you will bring, a clash, a question."
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            {hint ? <p className="vd-hint error">{hint}</p> : null}
            <div className="vd-actions">
              <button
                className="vd-btn"
                type="button"
                disabled={pending !== null}
                onClick={() => respond("accept")}
              >
                {pending === "accept" ? "Accepting…" : "Accept this job"}
              </button>
              <button
                className="vd-btn danger"
                type="button"
                disabled={pending !== null}
                onClick={() => respond("decline")}
              >
                {pending === "decline" ? "Declining…" : "Decline"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="vd-section">
          <h2>Where this stands</h2>
          {job.responseNote ? (
            <p style={{ fontSize: "0.9rem", color: "var(--tx2)", marginBottom: 12 }}>
              Your note: {job.responseNote}
            </p>
          ) : null}
          {job.status === "accepted" ? (
            <div className="vd-actions">
              <button
                className="vd-btn ghost"
                type="button"
                disabled={pending !== null}
                onClick={markComplete}
              >
                {pending === "complete" ? "Saving…" : "Mark complete"}
              </button>
              <span className="vd-hint">Do this once the event is done and delivered.</span>
            </div>
          ) : (
            <p className="vd-hint">
              {job.status === "withdrawn"
                ? "Your coordinator took this offer back."
                : job.status === "completed"
                  ? "Done and signed off."
                  : "You declined this one."}
            </p>
          )}
          {hint && job.status === "accepted" ? <p className="vd-hint error">{hint}</p> : null}
        </div>
      )}
    </>
  );
}
