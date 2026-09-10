"use client";

// /admin/content/bundles/:slug — GET /admin/bundles/:slug (includes `items`),
// a full BundleInput edit form, and a nested items editor. `items` is only
// sent on PATCH when it was actually touched, since sending it always
// replaces every bundle_items row for this bundle. No delete endpoint exists
// for bundles — use the Active toggle instead.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminBundle, updateAdminBundle } from "../../../../../lib/api";
import { TextField, TextAreaField, JsonField, ToggleField, SubmitButton } from "../../../_components/fields";
import { handleAdminAuthError, useAdminToken } from "../../../_lib/useAdminToken";

let itemKeySeed = 0;
const nextItemKey = () => `new-${(itemKeySeed += 1)}`;

export default function AdminBundleDetailView({ slug }) {
  const token = useAdminToken();
  const [form, setForm] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsDirty, setItemsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    getAdminBundle(slug, token)
      .then((data) => {
        if (!live) return;
        setForm(data);
        setItems((data.items ?? []).map((it) => ({ ...it, _key: it.id ?? nextItemKey() })));
        setItemsDirty(false);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load this bundle.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, slug]);

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));

  const addItem = () => {
    setItems((its) => [...its, { _key: nextItemKey(), serviceSlug: "", sortOrder: its.length, configuration: {} }]);
    setItemsDirty(true);
  };
  const removeItem = (key) => {
    setItems((its) => its.filter((it) => it._key !== key));
    setItemsDirty(true);
  };
  const setItemField = (key, field, value) => {
    setItems((its) => its.map((it) => (it._key === key ? { ...it, [field]: value } : it)));
    setItemsDirty(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setHint("");
    const input = {
      name: form.name,
      tagline: form.tagline,
      blurb: form.blurb,
      eventType: form.eventType,
      badge: form.badge,
      imagePath: form.imagePath,
      imageAlt: form.imageAlt,
      sortOrder: form.sortOrder === "" ? undefined : form.sortOrder,
      isActive: form.isActive,
    };
    if (itemsDirty) {
      input.items = items.map(({ _key, id, ...rest }) => ({ ...(typeof id === "number" ? { id } : {}), ...rest }));
    }
    try {
      const updated = await updateAdminBundle(slug, input, token);
      setForm(updated);
      setItems((updated.items ?? []).map((it) => ({ ...it, _key: it.id ?? nextItemKey() })));
      setItemsDirty(false);
      setHint("Saved.");
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not save this bundle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Link className="ad-back" href="/admin/content/bundles">
        ← Back to bundles
      </Link>
      <div className="ad-head">
        <div>
          <h1>{form?.name || slug}</h1>
          <p>{slug}</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--tx3)", fontFamily: "var(--fmono)", fontSize: 12 }}>Loading…</p>
      ) : error ? (
        <p className="ad-table-error" style={{ fontFamily: "var(--fmono)", fontSize: 12 }}>
          {error}
        </p>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="ad-section">
            <h2>Details</h2>
            <div className="ad-form">
              <TextField label="Name" value={form.name} onChange={set("name")} />
              <TextField label="Tagline" value={form.tagline} onChange={set("tagline")} />
              <TextAreaField label="Blurb" value={form.blurb} onChange={set("blurb")} />
              <TextField label="Event type" value={form.eventType} onChange={set("eventType")} />
              <TextField label="Badge" value={form.badge} onChange={set("badge")} />
              <TextField label="Image path" value={form.imagePath} onChange={set("imagePath")} />
              <TextField label="Image alt" value={form.imageAlt} onChange={set("imageAlt")} />
              <TextField label="Sort order" type="number" value={form.sortOrder} onChange={set("sortOrder")} />
              <ToggleField label="Active" checked={form.isActive} onChange={set("isActive")} />
            </div>
          </div>

          <div className="ad-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ marginBottom: 0 }}>Items</h2>
              <button className="ad-btn ghost" type="button" onClick={addItem}>
                + Add item
              </button>
            </div>
            {items.length === 0 && <p style={{ color: "var(--tx3)", fontSize: "0.85rem" }}>No items.</p>}
            {items.map((it) => (
              <div className="ad-block-card" key={it._key}>
                <div className="ad-block-head">
                  <b>Item {it.id ?? "new"}</b>
                  <button className="ad-btn danger" type="button" onClick={() => removeItem(it._key)}>
                    Remove
                  </button>
                </div>
                <div className="ad-form wide" style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12 }}>
                  <TextField
                    label="Service slug"
                    value={it.serviceSlug}
                    onChange={(v) => setItemField(it._key, "serviceSlug", v)}
                  />
                  <TextField
                    label="Sort order"
                    type="number"
                    value={it.sortOrder}
                    onChange={(v) => setItemField(it._key, "sortOrder", v)}
                  />
                </div>
                <JsonField
                  key={`config-${it._key}`}
                  label="Configuration (JSON)"
                  value={it.configuration}
                  onChange={(v) => setItemField(it._key, "configuration", v)}
                />
              </div>
            ))}
          </div>

          {hint && <div className={`ad-hint${/could not/i.test(hint) ? " error" : ""}`}>{hint}</div>}
          <SubmitButton pending={saving}>Save bundle</SubmitButton>
        </form>
      )}
    </>
  );
}
