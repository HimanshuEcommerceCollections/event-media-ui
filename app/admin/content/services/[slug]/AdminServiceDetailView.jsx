"use client";

// /admin/content/services/:slug — GET /admin/services/:slug (this is the one
// call that includes `blocks`), a full ServiceInput edit form, and a
// per-block JSON payload editor. PATCH only sends `blocks` when the editor
// actually changed something, since including it always replaces every
// service_blocks row for this service.
//
// There is no delete endpoint for services — the contract says to PATCH
// { isActive: false } instead, so that toggle in the main form is the only
// "removal" available here.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminService, updateAdminService } from "../../../../../lib/api";
import { TextField, TextAreaField, JsonField, ToggleField, SubmitButton } from "../../../_components/fields";
import { handleAdminAuthError, useAdminToken } from "../../../_lib/useAdminToken";

let blockKeySeed = 0;
const nextBlockKey = () => `new-${(blockKeySeed += 1)}`;

export default function AdminServiceDetailView({ slug }) {
  const token = useAdminToken();
  const [service, setService] = useState(null);
  const [form, setForm] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [blocksDirty, setBlocksDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    getAdminService(slug, token)
      .then((data) => {
        if (!live) return;
        setService(data);
        setForm({
          title: data.title ?? "",
          blurb: data.blurb ?? "",
          priceLabel: data.priceLabel ?? "",
          priceCents: data.priceCents ?? "",
          priceUnit: data.priceUnit ?? "",
          isB2b: !!data.isB2b,
          imagePath: data.imagePath ?? "",
          imageAlt: data.imageAlt ?? "",
          iconKey: data.iconKey ?? "",
          sortOrder: data.sortOrder ?? "",
          isActive: !!data.isActive,
          hero: data.hero ?? null,
        });
        setBlocks((data.blocks ?? []).map((b) => ({ ...b, _key: b.id ?? nextBlockKey() })));
        setBlocksDirty(false);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load this service.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, slug]);

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));

  const addBlock = () => {
    setBlocks((bs) => [...bs, { _key: nextBlockKey(), kind: "", sortOrder: bs.length, payload: {} }]);
    setBlocksDirty(true);
  };
  const removeBlock = (key) => {
    setBlocks((bs) => bs.filter((b) => b._key !== key));
    setBlocksDirty(true);
  };
  const setBlockField = (key, field, value) => {
    setBlocks((bs) => bs.map((b) => (b._key === key ? { ...b, [field]: value } : b)));
    setBlocksDirty(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setHint("");
    const input = {
      ...form,
      priceCents: form.priceCents === "" ? undefined : form.priceCents,
      sortOrder: form.sortOrder === "" ? undefined : form.sortOrder,
    };
    if (blocksDirty) {
      input.blocks = blocks.map(({ _key, id, ...rest }) => ({ ...(typeof id === "number" ? { id } : {}), ...rest }));
    }
    try {
      const updated = await updateAdminService(slug, input, token);
      setService(updated);
      setBlocks((updated.blocks ?? []).map((b) => ({ ...b, _key: b.id ?? nextBlockKey() })));
      setBlocksDirty(false);
      setHint("Saved.");
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not save this service.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Link className="ad-back" href="/admin/content/services">
        ← Back to services
      </Link>
      <div className="ad-head">
        <div>
          <h1>{service?.title || slug}</h1>
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
              <TextField label="Title" value={form.title} onChange={set("title")} />
              <TextAreaField label="Blurb" value={form.blurb} onChange={set("blurb")} />
              <TextField label="Price label" value={form.priceLabel} onChange={set("priceLabel")} />
              <TextField label="Price (cents)" type="number" value={form.priceCents} onChange={set("priceCents")} />
              <TextField label="Price unit" value={form.priceUnit} onChange={set("priceUnit")} />
              <TextField label="Image path" value={form.imagePath} onChange={set("imagePath")} />
              <TextField label="Image alt" value={form.imageAlt} onChange={set("imageAlt")} />
              <TextField label="Icon key" value={form.iconKey} onChange={set("iconKey")} />
              <TextField label="Sort order" type="number" value={form.sortOrder} onChange={set("sortOrder")} />
              <ToggleField label="B2B" checked={form.isB2b} onChange={set("isB2b")} />
              <ToggleField label="Active" checked={form.isActive} onChange={set("isActive")} />
              <JsonField key={`hero-${slug}`} label="Hero (JSON)" value={form.hero} onChange={set("hero")} />
            </div>
          </div>

          <div className="ad-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ marginBottom: 0 }}>Blocks</h2>
              <button className="ad-btn ghost" type="button" onClick={addBlock}>
                + Add block
              </button>
            </div>
            {blocks.length === 0 && <p style={{ color: "var(--tx3)", fontSize: "0.85rem" }}>No blocks.</p>}
            {blocks.map((b) => (
              <div className="ad-block-card" key={b._key}>
                <div className="ad-block-head">
                  <b>Block {b.id ?? "new"}</b>
                  <button className="ad-btn danger" type="button" onClick={() => removeBlock(b._key)}>
                    Remove
                  </button>
                </div>
                <div className="ad-form wide" style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12 }}>
                  <TextField
                    label="Kind"
                    value={b.kind}
                    onChange={(v) => setBlockField(b._key, "kind", v)}
                  />
                  <TextField
                    label="Sort order"
                    type="number"
                    value={b.sortOrder}
                    onChange={(v) => setBlockField(b._key, "sortOrder", v)}
                  />
                </div>
                <JsonField
                  key={`payload-${b._key}`}
                  label="Payload (JSON)"
                  value={b.payload}
                  onChange={(v) => setBlockField(b._key, "payload", v)}
                />
              </div>
            ))}
          </div>

          {hint && <div className={`ad-hint${/could not/i.test(hint) ? " error" : ""}`}>{hint}</div>}
          <SubmitButton pending={saving}>Save service</SubmitButton>
        </form>
      )}
    </>
  );
}
