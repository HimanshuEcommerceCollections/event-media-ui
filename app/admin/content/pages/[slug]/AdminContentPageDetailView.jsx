"use client";

// /admin/content/pages/:slug — edit one content_pages row, including the
// hero/sections JSON blobs, with a delete action.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAdminContentPage,
  updateAdminContentPage,
  deleteAdminContentPage,
} from "../../../../../lib/api";
import { TextField, TextAreaField, JsonField, SubmitButton } from "../../../_components/fields";
import { handleAdminAuthError, useAdminToken } from "../../../_lib/useAdminToken";

export default function AdminContentPageDetailView({ slug }) {
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
    getAdminContentPage(slug, token)
      .then((data) => {
        if (live) setForm(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load this page.");
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
      const updated = await updateAdminContentPage(
        slug,
        { title: form.title, kicker: form.kicker, summary: form.summary, hero: form.hero, sections: form.sections },
        token,
      );
      setForm(updated);
      setHint("Saved.");
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not save this page.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete the "${slug}" page? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteAdminContentPage(slug, token);
      router.push("/admin/content/pages");
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not delete this page.");
      setDeleting(false);
    }
  };

  return (
    <>
      <Link className="ad-back" href="/admin/content/pages">
        ← Back to pages
      </Link>
      <div className="ad-head">
        <div>
          <h1>{form?.title || slug}</h1>
          <p>{slug}</p>
        </div>
        <button className="ad-btn danger" type="button" onClick={onDelete} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete page"}
        </button>
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
            <div className="ad-form">
              <TextField label="Title" value={form.title} onChange={set("title")} />
              <TextField label="Kicker" value={form.kicker} onChange={set("kicker")} />
              <TextAreaField label="Summary" value={form.summary} onChange={set("summary")} />
              <JsonField key={`hero-${slug}`} label="Hero (JSON)" value={form.hero} onChange={set("hero")} rows={8} />
              <JsonField
                key={`sections-${slug}`}
                label="Sections (JSON)"
                value={form.sections}
                onChange={set("sections")}
                rows={14}
              />
            </div>
          </div>
          {hint && <div className={`ad-hint${/could not/i.test(hint) ? " error" : ""}`}>{hint}</div>}
          <SubmitButton pending={saving}>Save page</SubmitButton>
        </form>
      )}
    </>
  );
}
