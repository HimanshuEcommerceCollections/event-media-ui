"use client";

// /vendor/profile — how the vendor describes itself.
//
// Only the fields PATCH /vendors/me accepts are on the form. Service types
// and whether the account is active are the coordinator's call and the
// endpoint has no way to set them, so they are shown as read-only facts
// rather than as disabled inputs pretending to be editable.

import { useEffect, useState } from "react";
import { ApiError, updateMyVendor } from "../../../lib/api";
import { handleVendorAuthError, useVendorToken } from "../_lib/useVendorSession";
import { useVendor } from "../layout";

// Held as "" so every input is controlled; "" is sent back as null, which the
// endpoint reads as "I do not have one".
const asText = (v) => v ?? "";

export default function VendorProfileView() {
  const token = useVendorToken();
  const { vendor, setData } = useVendor();

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [hint, setHint] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vendor) return;
    setForm({
      businessName: asText(vendor.businessName),
      contactName: asText(vendor.contactName),
      phone: asText(vendor.phone),
      website: asText(vendor.website),
      serviceArea: asText(vendor.serviceArea),
      yearsActive: vendor.yearsActive ?? "",
      hasInsurance: !!vendor.hasInsurance,
      portfolioUrl: asText(vendor.portfolioUrl),
      bio: asText(vendor.bio),
    });
  }, [vendor]);

  if (form === null) return <p className="vd-msg">Loading…</p>;

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.businessName.trim().length < 2) next.businessName = "Enter your business name.";
    if (form.contactName.trim().length < 2) next.contactName = "Enter a contact name.";
    setErrors(next);
    setHint("");
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const updated = await updateMyVendor(
        {
          businessName: form.businessName.trim(),
          contactName: form.contactName.trim(),
          phone: form.phone.trim(),
          website: form.website.trim(),
          serviceArea: form.serviceArea.trim(),
          yearsActive: form.yearsActive === "" ? null : Number(form.yearsActive),
          hasInsurance: form.hasInsurance,
          portfolioUrl: form.portfolioUrl.trim(),
          bio: form.bio.trim(),
        },
        token,
      );
      // The layout holds the profile the sidebar paints, so push the saved
      // version up rather than leaving the old business name in the corner.
      setData((prev) => (prev ? { ...prev, vendor: updated } : prev));
      setHint("Saved.");
    } catch (err) {
      if (handleVendorAuthError(err)) return;
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors());
        setHint(err.message);
      } else {
        setHint("Could not save your profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const field = (key, label, extra = {}) => (
    <div className={`vd-field${errors[key] ? " bad" : ""}`}>
      <label htmlFor={`vp-${key}`}>{label}</label>
      <input
        id={`vp-${key}`}
        type={extra.type ?? "text"}
        placeholder={extra.placeholder}
        value={form[key]}
        onChange={(e) => set(key)(e.target.value)}
      />
      {errors[key] ? <div className="vd-err">{errors[key]}</div> : null}
    </div>
  );

  return (
    <>
      <div className="vd-head">
        <div>
          <h1>Profile</h1>
          <p>How your business appears to the coordinators booking you.</p>
        </div>
      </div>

      <form className="vd-section" onSubmit={onSubmit}>
        <h2>Your details</h2>
        <div className="vd-form">
          {field("businessName", "Business name")}
          {field("contactName", "Contact name")}
          {field("phone", "Phone", { type: "tel" })}
          {field("website", "Website", { type: "url", placeholder: "https://" })}
          {field("portfolioUrl", "Portfolio", { type: "url", placeholder: "https://" })}
          {field("serviceArea", "Service area", { placeholder: "Cities or counties you cover" })}
          {field("yearsActive", "Years active", { type: "number" })}

          <label className="vd-check">
            <input
              type="checkbox"
              checked={form.hasInsurance}
              onChange={(e) => set("hasInsurance")(e.target.checked)}
            />
            I carry public liability insurance
          </label>

          <div className="vd-field">
            <label htmlFor="vp-bio">About your work</label>
            <textarea
              id="vp-bio"
              value={form.bio}
              placeholder="Kit you bring, the events you like, anything a coordinator should know."
              onChange={(e) => set("bio")(e.target.value)}
            />
          </div>

          {hint ? (
            <p className={`vd-hint${hint === "Saved." ? "" : " error"}`}>{hint}</p>
          ) : null}

          <div className="vd-actions">
            <button className="vd-btn" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </form>

      <div className="vd-section">
        <h2>Set by your coordinator</h2>
        <dl className="vd-kv">
          <dt>Offered work for</dt>
          <dd>{vendor.serviceTypes?.length ? vendor.serviceTypes.join(", ") : "Nothing yet"}</dd>
          <dt>Account</dt>
          <dd>{vendor.isActive ? "Active" : "Suspended"}</dd>
          <dt>Email</dt>
          <dd>{vendor.email}</dd>
        </dl>
        {/* These three are the coordinator's decision, so the page says who to
            ask rather than offering an input that would be refused. */}
        <p className="vd-hint" style={{ marginTop: 12 }}>
          To change what you are offered, or the address on the account, talk to your coordinator.
        </p>
      </div>
    </>
  );
}
