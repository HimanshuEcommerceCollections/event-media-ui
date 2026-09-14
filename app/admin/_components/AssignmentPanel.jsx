"use client";

// The "who is doing what" panel on a booking's detail page.
//
// An offer is always about one service line, so the form picks a line first
// and then a vendor — and the vendor list is re-fetched per line, because
// GET /admin/vendors/accounts?serviceType= already answers "who can do this?"
// and filtering a full directory in the browser would only be a slower way to
// get a shorter answer.
//
// The payout is entered in dollars and sent in cents. It is deliberately not
// prefilled from what the customer was quoted for the line: those are two
// different numbers and defaulting one to the other invites the margin being
// given away by pressing enter.

import { useCallback, useEffect, useState } from "react";
import {
  createAdminBookingAssignment,
  deleteAdminAssignment,
  getAdminBookingAssignments,
  getAdminVendorAccounts,
  updateAdminAssignment,
} from "../../../lib/api";
import { handleAdminAuthError } from "../_lib/useAdminToken";

const STATUSES = ["offered", "accepted", "declined", "withdrawn", "completed"];

const money = (cents) =>
  typeof cents === "number" ? `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—";

const stamp = (secs) => (typeof secs === "number" ? new Date(secs * 1000).toLocaleDateString() : "—");

/** Dollars typed into the form → integer cents, or null for an empty box. */
function toCents(dollars) {
  if (dollars === "" || dollars === null || dollars === undefined) return null;
  const n = Number(dollars);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export default function AssignmentPanel({ bookingId, token }) {
  const [data, setData] = useState({ items: [], serviceLines: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [serviceType, setServiceType] = useState("");
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [payout, setPayout] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState("");
  const [rowHint, setRowHint] = useState({});

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getAdminBookingAssignments(bookingId, token)
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err) => {
        if (handleAdminAuthError(err)) return;
        setError(err.message || "Could not load the assignments.");
      })
      .finally(() => setLoading(false));
  }, [bookingId, token]);

  useEffect(() => {
    load();
  }, [load]);

  // Who can be offered the selected line. Cleared along with the selection so
  // a vendor picked for one service cannot be submitted against another.
  useEffect(() => {
    if (!token || serviceType === "") {
      setVendors([]);
      setVendorId("");
      return undefined;
    }
    let live = true;
    setVendorsLoading(true);
    setVendorId("");
    getAdminVendorAccounts({ serviceType, pageSize: 100 }, token)
      .then((payload) => {
        if (live) setVendors(payload?.items ?? []);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setHint(err.message || "Could not load the vendor list.");
      })
      .finally(() => {
        if (live) setVendorsLoading(false);
      });
    return () => {
      live = false;
    };
  }, [serviceType, token]);

  const onOffer = async (e) => {
    e.preventDefault();
    setHint("");
    if (!serviceType || !vendorId) {
      setHint("Pick a service line and a vendor.");
      return;
    }
    setSaving(true);
    try {
      await createAdminBookingAssignment(
        bookingId,
        {
          vendorId,
          serviceType,
          payoutCents: toCents(payout),
          note: note.trim() || null,
        },
        token,
      );
      setServiceType("");
      setVendorId("");
      setPayout("");
      setNote("");
      load();
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not make that offer.");
    } finally {
      setSaving(false);
    }
  };

  const patchRow = async (row, body) => {
    setRowHint((h) => ({ ...h, [row.id]: "" }));
    try {
      const updated = await updateAdminAssignment(row.id, body, token);
      setData((d) => ({ ...d, items: d.items.map((it) => (it.id === row.id ? updated : it)) }));
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setRowHint((h) => ({ ...h, [row.id]: err.message || "Could not save." }));
    }
  };

  const removeRow = async (row) => {
    if (
      !window.confirm(
        `Remove the offer to ${row.vendorName}? Use "withdrawn" instead if they have already seen it — that leaves it on their list with an explanation.`,
      )
    ) {
      return;
    }
    try {
      await deleteAdminAssignment(row.id, token);
      load();
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setRowHint((h) => ({ ...h, [row.id]: err.message || "Could not remove." }));
    }
  };

  const lines = data.serviceLines ?? [];
  const rows = data.items ?? [];

  return (
    <div className="ad-section">
      <h2>Vendors on this booking</h2>

      {loading ? (
        <p className="ad-hint">Loading…</p>
      ) : error ? (
        <p className="ad-hint error">{error}</p>
      ) : (
        <>
          <div className="ad-table-scroll">
            <table className="ad-table" style={{ border: "none" }}>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Service</th>
                  <th>Payout</th>
                  <th>Status</th>
                  <th>Offered</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="ad-table-msg" colSpan={6}>
                      Nobody has been offered this booking yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <b>{row.vendorName}</b>
                        <div style={{ color: "var(--tx3)", fontFamily: "var(--fmono)", fontSize: 11 }}>
                          {row.vendorEmail}
                        </div>
                        {row.responseNote ? (
                          <div style={{ color: "var(--tx2)", fontSize: "0.8rem", marginTop: 6 }}>
                            “{row.responseNote}”
                          </div>
                        ) : null}
                        {rowHint[row.id] ? <div className="ad-err">{rowHint[row.id]}</div> : null}
                      </td>
                      <td>{row.serviceType}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{money(row.payoutCents)}</td>
                      <td>
                        <select
                          className="ad-select"
                          value={row.status}
                          onChange={(e) => patchRow(row, { status: e.target.value })}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{stamp(row.offeredAt)}</td>
                      <td>
                        <button className="ad-btn danger" type="button" onClick={() => removeRow(row)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <form className="ad-form" style={{ marginTop: 18 }} onSubmit={onOffer}>
            <div className="ad-field">
              <label>Service line</label>
              <select
                className="ad-select"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option value="">Choose a line from this booking…</option>
                {lines.map((line) => (
                  <option key={line.serviceType} value={line.serviceType}>
                    {line.label} · customer pays {line.customerLabel}
                  </option>
                ))}
              </select>
            </div>

            <div className="ad-field">
              <label>Vendor</label>
              <select
                className="ad-select"
                value={vendorId}
                disabled={serviceType === "" || vendorsLoading}
                onChange={(e) => setVendorId(e.target.value)}
              >
                <option value="">
                  {serviceType === ""
                    ? "Pick a service line first"
                    : vendorsLoading
                      ? "Loading vendors…"
                      : vendors.length === 0
                        ? "No active vendor is listed for this service"
                        : "Choose a vendor…"}
                </option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.businessName}
                    {v.openOffers ? ` · ${v.openOffers} open` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="ad-field">
              <label>Vendor payout (dollars)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="What the vendor keeps — not what the customer paid"
                value={payout}
                onChange={(e) => setPayout(e.target.value)}
              />
            </div>

            <div className="ad-field">
              <label>Note for the vendor</label>
              <textarea
                rows={3}
                value={note}
                placeholder="The brief: load-in time, contact on the day, anything unusual."
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {hint ? <div className="ad-hint error">{hint}</div> : null}

            <button className="ad-submit" type="submit" disabled={saving}>
              <span className="ad-sp" />
              <span className="ad-txt">{saving ? "Offering…" : "Offer this line"}</span>
            </button>
          </form>
        </>
      )}
    </div>
  );
}
