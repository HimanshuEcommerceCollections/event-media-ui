"use client";

// /admin/content/legal — thin CRUD over `legal_documents` (contract path
// /admin/legal-documents, pk `slug`).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "../../_components/AdminTable";
import { TextField, SubmitButton } from "../../_components/fields";
import { getAdminLegalDocuments, createAdminLegalDocument } from "../../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../../_lib/useAdminToken";

const PAGE_SIZE = 20;
const BLANK = { slug: "", title: "", kicker: "", summary: "", updatedLabel: "" };

const stamp = (secs) => (typeof secs === "number" ? new Date(secs * 1000).toLocaleDateString() : "—");

const COLUMNS = [
  { key: "slug", label: "Slug" },
  { key: "title", label: "Title" },
  { key: "updatedLabel", label: "Updated label" },
  { key: "updatedAt", label: "Updated", render: (r) => stamp(r.updatedAt) },
];

export default function AdminLegalView() {
  const token = useAdminToken();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    getAdminLegalDocuments({ page, pageSize: PAGE_SIZE }, token)
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load legal documents.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, page]);

  const set = (key) => (v) => setDraft((d) => ({ ...d, [key]: v }));

  const onCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setHint("");
    try {
      const created = await createAdminLegalDocument(draft, token);
      router.push(`/admin/content/legal/${created.slug}`);
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not create this document.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Legal documents</h1>
          <p>Terms, privacy policy and other structured legal pages.</p>
        </div>
        <button className="ad-btn" type="button" onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancel" : "+ New document"}
        </button>
      </div>

      {showNew && (
        <div className="ad-section">
          <h2>New document</h2>
          <form className="ad-form" onSubmit={onCreate}>
            <TextField label="Slug" value={draft.slug} onChange={set("slug")} required />
            <TextField label="Title" value={draft.title} onChange={set("title")} required />
            <TextField label="Kicker" value={draft.kicker} onChange={set("kicker")} />
            <TextField label="Summary" value={draft.summary} onChange={set("summary")} />
            <TextField label="Updated label" value={draft.updatedLabel} onChange={set("updatedLabel")} />
            {hint && <div className="ad-hint error">{hint}</div>}
            <SubmitButton pending={saving}>Create document</SubmitButton>
          </form>
        </div>
      )}

      <AdminTable
        columns={COLUMNS}
        rows={result.items}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        onPageChange={setPage}
        loading={loading}
        error={error}
        emptyMessage="No legal documents yet."
        getRowKey={(r) => r.slug}
        onRowClick={(r) => router.push(`/admin/content/legal/${r.slug}`)}
      />
    </>
  );
}
