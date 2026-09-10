"use client";

// /admin/content/legal/:slug — edit or delete one legal_documents row,
// including its structured `sections` JSON.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAdminLegalDocument,
  updateAdminLegalDocument,
  deleteAdminLegalDocument,
} from "../../../../../lib/api";
import { TextField, TextAreaField, JsonField, SubmitButton } from "../../../_components/fields";
import { handleAdminAuthError, useAdminToken } from "../../../_lib/useAdminToken";

export default function AdminLegalDetailView({ slug }) {
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
    getAdminLegalDocument(slug, token)
      .then((data) => {
        if (live) setForm(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load this document.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, slug]);

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setHint("");
    try {
      const updated = await updateAdminLegalDocument(
        slug,
        { title: form.title, kicker: form.kicker, summary: form.summary, updatedLabel: form.updatedLabel, sections: form.sections },
        token,
      );
      setForm(updated);
      setHint("Saved.");
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not save this document.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete the "${slug}" document? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteAdminLegalDocument(slug, token);
      router.push("/admin/content/legal");
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not delete this document.");
      setDeleting(false);
    }
  };

  return (
    <>
      <Link className="ad-back" href="/admin/content/legal">
        ← Back to legal documents
      </Link>
      <div className="ad-head">
        <div>
          <h1>{form?.title || slug}</h1>
          <p>{slug}</p>
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
            <TextField label="Title" value={form.title} onChange={set("title")} />
            <TextField label="Kicker" value={form.kicker} onChange={set("kicker")} />
            <TextAreaField label="Summary" value={form.summary} onChange={set("summary")} />
            <TextField label="Updated label" value={form.updatedLabel} onChange={set("updatedLabel")} />
            <JsonField
              key={`sections-${slug}`}
              label="Sections (JSON)"
              value={form.sections}
              onChange={set("sections")}
              rows={14}
            />
          </div>
          {hint && <div className={`ad-hint${/could not/i.test(hint) ? " error" : ""}`}>{hint}</div>}
          <SubmitButton pending={saving}>Save document</SubmitButton>
        </form>
      )}
    </>
  );
}
