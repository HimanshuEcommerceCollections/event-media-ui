"use client";

// /admin/bookings/:id — full BookingDto readout plus a status <select> that
// calls PATCH /admin/bookings/:id/status.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminBooking, updateAdminBookingStatus } from "../../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../../_lib/useAdminToken";

const STATUSES = ["new", "confirmed", "in_progress", "completed", "cancelled"];

const money = (cents) =>
  typeof cents === "number" ? `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—";

const stamp = (secs) => (typeof secs === "number" ? new Date(secs * 1000).toLocaleString() : "—");

export default function AdminBookingDetailView({ id }) {
  const token = useAdminToken();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    getAdminBooking(id, token)
      .then((data) => {
        if (live) setBooking(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load this booking.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, id]);

  const onStatusChange = async (e) => {
    const next = e.target.value;
    const prev = booking.status;
    setBooking((b) => ({ ...b, status: next }));
    setSaving(true);
    setHint("");
    try {
      const updated = await updateAdminBookingStatus(id, next, token);
      setBooking(updated);
      setHint("Saved.");
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setBooking((b) => ({ ...b, status: prev }));
      setHint(err.message || "Could not update the status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Link className="ad-back" href="/admin/bookings">
        ← Back to bookings
      </Link>
      <div className="ad-head">
        <div>
          <h1>Booking {booking?.requestId || id}</h1>
          <p>{booking?.brand ? `${booking.brand} · ${booking.eventType || ""}` : " "}</p>
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
          <div className="ad-section">
            <h2>Status</h2>
            <select className="ad-select" value={booking.status} disabled={saving} onChange={onStatusChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            {hint && (
              <div className={`ad-hint${/could not/i.test(hint) ? " error" : ""}`} style={{ marginTop: 8 }}>
                {hint}
              </div>
            )}
          </div>

          <div className="ad-section">
            <h2>Event</h2>
            <dl className="ad-kv">
              <dt>Brand</dt>
              <dd>{booking.brand || "—"}</dd>
              <dt>Event type</dt>
              <dd>{booking.eventType || "—"}</dd>
              <dt>Event date</dt>
              <dd>{booking.eventDate || "—"}</dd>
              <dt>Headcount band</dt>
              <dd>{booking.headcountBand || "—"}</dd>
              <dt>Event ZIP</dt>
              <dd>{booking.eventZip || "—"}</dd>
              <dt>Large event</dt>
              <dd>{booking.largeEventFlag ? "Yes" : "No"}</dd>
              <dt>Budget band</dt>
              <dd>{booking.budgetBand || "—"}</dd>
              <dt>Package total</dt>
              <dd>{money(booking.packageTotal)}</dd>
              <dt>Source</dt>
              <dd>{booking.source || "—"}</dd>
              <dt>Created</dt>
              <dd>{stamp(booking.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{stamp(booking.updatedAt)}</dd>
            </dl>
          </div>

          <div className="ad-section">
            <h2>Contact</h2>
            <dl className="ad-kv">
              <dt>Full name</dt>
              <dd>{booking.contact?.fullName || "—"}</dd>
              <dt>Email</dt>
              <dd>{booking.contact?.email || "—"}</dd>
              <dt>Phone</dt>
              <dd>{booking.contact?.phone || "—"}</dd>
            </dl>
          </div>

          <div className="ad-section">
            <h2>Line items</h2>
            {Array.isArray(booking.lineItems) && booking.lineItems.length ? (
              <table className="ad-table" style={{ border: "none" }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.lineItems.map((item, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--fmono)", fontSize: 11.5 }}>
                          {typeof item === "string" ? item : JSON.stringify(item, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "var(--tx3)", fontSize: "0.85rem" }}>No line items.</p>
            )}
          </div>

          <div className="ad-section">
            <h2>Notes</h2>
            <p style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem" }}>{booking.notes || "—"}</p>
          </div>
        </>
      )}
    </>
  );
}
