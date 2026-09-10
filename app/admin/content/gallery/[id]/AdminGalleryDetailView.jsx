"use client";

// /admin/content/gallery/:id — edit or delete one gallery_items row.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminGalleryItem, updateAdminGalleryItem, deleteAdminGalleryItem } from "../../../../../lib/api";
import { TextField, SubmitButton } from "../../../_components/fields";
import { handleAdminAuthError, useAdminToken } from "../../../_lib/useAdminToken";

export default function AdminGalleryDetailView({ id }) {
  const token = useAdminToken();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    getAdminGalleryItem(id, token)
      .then((data) => {
        if (live) setForm(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load this item.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, id]);

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setHint("");
    try {
      const updated = await updateAdminGalleryItem(
        id,
        { ...form, sortOrder: form.sortOrder === "" ? undefined : form.sortOrder },
        token,
      );
      setForm(updated);
      setHint("Saved.");
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not save this item.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this gallery item? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteAdminGalleryItem(id, token);
      router.push("/admin/content/gallery");
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not delete this item.");
      setDeleting(false);
    }
  };

  return (
    <>
      <Link className="ad-back" href="/admin/content/gallery">
        ← Back to gallery
      </Link>
      <div className="ad-head">
        <div>
          <h1>{form?.label || `Gallery item ${id}`}</h1>
          <p>{form?.surface || " "}</p>
        </div>
        <button className="ad-btn danger" type="button" onClick={onDelete} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--tx3)", fontFamily: "var(--fmono)", fontSize: 12 }}>Loading…</p>
      ) : error ? (
        <p className="ad-table-error" style={{ fontFamily: "var(--fmono)", fontSize: 12 }}>
          {error}
        </p>
      ) : (
        <form className="ad-section" onSubmit={onSubmit}>
          <div className="ad-form">
            <TextField label="Surface" value={form.surface} onChange={set("surface")} />
            <TextField label="Image path" value={form.imagePath} onChange={set("imagePath")} />
            <TextField label="Label" value={form.label} onChange={set("label")} />
            <TextField label="Caption" value={form.caption} onChange={set("caption")} />
            <TextField label="Sort order" type="number" value={form.sortOrder} onChange={set("sortOrder")} />
          </div>
          {hint && <div className={`ad-hint${/could not/i.test(hint) ? " error" : ""}`}>{hint}</div>}
          <SubmitButton pending={saving}>Save item</SubmitButton>
        </form>
      )}
    </>
  );
}
