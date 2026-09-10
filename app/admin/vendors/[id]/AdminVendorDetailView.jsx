"use client";

// /admin/vendors/:id — full VendorDto readout plus a status <select> that
// calls PATCH /admin/vendors/:id/status.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminVendor, updateAdminVendorStatus } from "../../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../../_lib/useAdminToken";

const STATUSES = ["new", "reviewing", "approved", "rejected"];

const stamp = (secs) => (typeof secs === "number" ? new Date(secs * 1000).toLocaleString() : "—");

export default function AdminVendorDetailView({ id }) {
  const token = useAdminToken();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    getAdminVendor(id, token)
      .then((data) => {
        if (live) setVendor(data);
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

  const onStatusChange = async (e) => {
    const next = e.target.value;
    const prev = vendor.status;
    setVendor((v) => ({ ...v, status: next }));
    setSaving(true);
    setHint("");
    try {
      const updated = await updateAdminVendorStatus(id, next, token);
      setVendor(updated);
      setHint("Saved.");
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setVendor((v) => ({ ...v, status: prev }));
      setHint(err.message || "Could not update the status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Link className="ad-back" href="/admin/vendors">
        ← Back to vendors
      </Link>
      <div className="ad-head">
        <div>
          <h1>{vendor?.businessName || `Vendor ${id}`}</h1>
          <p>{vendor?.reference || " "}</p>
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
            <select className="ad-select" value={vendor.status} disabled={saving} onChange={onStatusChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
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
            <h2>Business</h2>
            <dl className="ad-kv">
              <dt>Business name</dt>
              <dd>{vendor.businessName || "—"}</dd>
              <dt>Contact name</dt>
              <dd>{vendor.contactName || "—"}</dd>
              <dt>Email</dt>
              <dd>{vendor.email || "—"}</dd>
              <dt>Phone</dt>
              <dd>{vendor.phone || "—"}</dd>
              <dt>Website</dt>
              <dd>{vendor.website || "—"}</dd>
              <dt>Service types</dt>
              <dd>{Array.isArray(vendor.serviceTypes) ? vendor.serviceTypes.join(", ") : vendor.serviceTypes || "—"}</dd>
              <dt>Years active</dt>
              <dd>{vendor.yearsActive ?? "—"}</dd>
              <dt>Service area</dt>
              <dd>{vendor.serviceArea || "—"}</dd>
              <dt>Has insurance</dt>
              <dd>{vendor.hasInsurance ? "Yes" : "No"}</dd>
              <dt>Part 107</dt>
              <dd>{vendor.part107 ? "Yes" : "No"}</dd>
              <dt>Portfolio</dt>
              <dd>{vendor.portfolioUrl || "—"}</dd>
              <dt>Applied</dt>
              <dd>{stamp(vendor.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{stamp(vendor.updatedAt)}</dd>
            </dl>
          </div>

          <div className="ad-section">
            <h2>Notes</h2>
            <p style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem" }}>{vendor.notes || "—"}</p>
          </div>
        </>
      )}
    </>
  );
}
