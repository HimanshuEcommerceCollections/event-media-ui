"use client";

// /admin/vendors/accounts/:id — one vendor, and the two levers the
// coordinator holds over them: what they can be offered, and whether they are
// active at all.
//
// The service-type checkboxes are built from the live catalogue rather than a
// hardcoded list, because the API rejects a slug that is not an active
// service and a stale list here would produce an error nobody could act on.
//
// "Has signed in" is the question worth surfacing: a vendor approved weeks
// ago who never took up the invite looks identical to an active one on every
// other field.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAdminServices,
  getAdminVendorAccount,
  updateAdminVendorAccount,
} from "../../../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../../../_lib/useAdminToken";

const stamp = (secs) => (typeof secs === "number" ? new Date(secs * 1000).toLocaleString() : "Never");

export default function AdminVendorAccountDetailView({ id }) {
  const token = useAdminToken();
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [picked, setPicked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (token === undefined || token === null) return undefined;
    let live = true;
    setLoading(true);
    Promise.all([
      getAdminVendorAccount(id, token),
      getAdminServices({ pageSize: 100 }, token).catch(() => ({ items: [] })),
    ])
      .then(([data, catalogue]) => {
        if (!live) return;
        setVendor(data);
        setPicked(data.serviceTypes ?? []);
        setServices((catalogue?.items ?? []).filter((s) => s.isActive));
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load this vendor.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, id]);

  const toggle = (slug) =>
    setPicked((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const save = async (body, successMessage) => {
    setSaving(true);
    setHint("");
    try {
      const updated = await updateAdminVendorAccount(id, body, token);
      setVendor(updated);
      setPicked(updated.serviceTypes ?? []);
      setHint(successMessage);
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Link className="ad-back" href="/admin/vendors/accounts">
          ← Back to vendor accounts
        </Link>
        <p className="ad-hint">Loading…</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Link className="ad-back" href="/admin/vendors/accounts">
          ← Back to vendor accounts
        </Link>
        <p className="ad-hint error">{error}</p>
      </>
    );
  }

  const work = vendor.work ?? {};
  const account = vendor.account ?? {};

  return (
    <>
      <Link className="ad-back" href="/admin/vendors/accounts">
        ← Back to vendor accounts
      </Link>

      <div className="ad-head">
        <div>
          <h1>{vendor.businessName}</h1>
          <p>{vendor.contactName}</p>
        </div>
        <span className={`ad-badge st-${vendor.isActive ? "approved" : "rejected"}`}>
          {vendor.isActive ? "active" : "suspended"}
        </span>
      </div>

      <div className="ad-cards">
        <div className="ad-card">
          <h3>Open offers</h3>
          <div className="n">{work.byStatus?.offered ?? 0}</div>
        </div>
        <div className="ad-card">
          <h3>Accepted</h3>
          <div className="n">{work.byStatus?.accepted ?? 0}</div>
        </div>
        <div className="ad-card">
          <h3>Completed</h3>
          <div className="n">{work.byStatus?.completed ?? 0}</div>
        </div>
        <div className="ad-card">
          <h3>Booked payout</h3>
          <div className="n">{work.payoutLabel ?? "$0"}</div>
        </div>
      </div>

      <div className="ad-section">
        <h2>Offered work for</h2>
        {services.length === 0 ? (
          <p className="ad-hint">Could not load the service catalogue.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            {services.map((s) => (
              <label key={s.slug} className="ad-toggle">
                <input
                  type="checkbox"
                  checked={picked.includes(s.slug)}
                  disabled={saving}
                  onChange={() => toggle(s.slug)}
                />
                <span className="ad-toggle-track">
                  <span className="ad-toggle-thumb" />
                </span>
                <span className="ad-toggle-label">{s.title}</span>
              </label>
            ))}
          </div>
        )}
        <button
          className="ad-btn"
          type="button"
          disabled={saving}
          onClick={() => save({ serviceTypes: picked }, "Saved.")}
        >
          {saving ? "Saving…" : "Save services"}
        </button>
        <p className="ad-hint" style={{ marginTop: 10 }}>
          A vendor can only be offered a line they are listed for, so this is what decides who
          appears in the picker on a booking.
        </p>
      </div>

      <div className="ad-section">
        <h2>Account</h2>
        <dl className="ad-kv">
          <dt>Email</dt>
          <dd>{account.email || vendor.email}</dd>
          <dt>Role</dt>
          <dd>{account.role || "—"}</dd>
          <dt>Invite taken up</dt>
          <dd>{account.hasSignedIn ? "Yes" : "Not yet — they have never signed in"}</dd>
          <dt>Last sign-in</dt>
          <dd>{stamp(account.lastSigninAt)}</dd>
          <dt>Phone</dt>
          <dd>{vendor.phone || "—"}</dd>
          <dt>Website</dt>
          <dd>{vendor.website || "—"}</dd>
          <dt>Portfolio</dt>
          <dd>{vendor.portfolioUrl || "—"}</dd>
          <dt>Service area</dt>
          <dd>{vendor.serviceArea || "—"}</dd>
          <dt>Years active</dt>
          <dd>{vendor.yearsActive ?? "—"}</dd>
          <dt>Insurance</dt>
          <dd>{vendor.hasInsurance ? "Claimed" : "Not claimed"}</dd>
          <dt>Created</dt>
          <dd>{stamp(vendor.createdAt)}</dd>
        </dl>
        {vendor.bio ? (
          <p style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem", marginTop: 14 }}>{vendor.bio}</p>
        ) : null}
      </div>

      <div className="ad-section">
        <h2>{vendor.isActive ? "Suspend" : "Reinstate"}</h2>
        <p style={{ color: "var(--tx2)", fontSize: "0.88rem", marginBottom: 12 }}>
          {vendor.isActive
            ? "A suspended vendor is offered nothing, cannot answer an open offer, and keeps every job already on their record."
            : "Reinstating puts this vendor back in the picker for the services above."}
        </p>
        {hint ? <div className={`ad-hint${/saved/i.test(hint) ? "" : " error"}`}>{hint}</div> : null}
        <button
          className={vendor.isActive ? "ad-btn danger" : "ad-btn"}
          type="button"
          disabled={saving}
          onClick={() =>
            save(
              { isActive: !vendor.isActive },
              vendor.isActive ? "Suspended." : "Reinstated.",
            )
          }
        >
          {vendor.isActive ? "Suspend vendor" : "Reinstate vendor"}
        </button>
      </div>
    </>
  );
}
