"use client";

// /admin/content/bundles — GET /admin/bundles (no `items` on list rows).
// Item editing happens on the detail route, same split as services/blocks.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "../../_components/AdminTable";
import { TextField, ToggleField, SubmitButton } from "../../_components/fields";
import { getAdminBundles, createAdminBundle } from "../../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../../_lib/useAdminToken";

const PAGE_SIZE = 20;
const BLANK = { slug: "", name: "", tagline: "", blurb: "", eventType: "", badge: "", isActive: true };

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "eventType", label: "Event type" },
  { key: "badge", label: "Badge" },
  { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
  { key: "sortOrder", label: "Sort" },
];

export default function AdminBundlesView() {
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
    getAdminBundles({ page, pageSize: PAGE_SIZE }, token)
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load bundles.");
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
      const created = await createAdminBundle(draft, token);
      router.push(`/admin/content/bundles/${created.slug}`);
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not create this bundle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Bundles</h1>
          <p>Packaged event bundles and the services inside each one.</p>
        </div>
        <button className="ad-btn" type="button" onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancel" : "+ New bundle"}
        </button>
      </div>

      {showNew && (
        <div className="ad-section">
          <h2>New bundle</h2>
          <form className="ad-form" onSubmit={onCreate}>
            <TextField label="Slug" value={draft.slug} onChange={set("slug")} required />
            <TextField label="Name" value={draft.name} onChange={set("name")} required />
            <TextField label="Tagline" value={draft.tagline} onChange={set("tagline")} />
            <TextField label="Blurb" value={draft.blurb} onChange={set("blurb")} />
            <TextField label="Event type" value={draft.eventType} onChange={set("eventType")} />
            <TextField label="Badge" value={draft.badge} onChange={set("badge")} />
            <ToggleField label="Active" checked={draft.isActive} onChange={set("isActive")} />
            {hint && <div className="ad-hint error">{hint}</div>}
            <SubmitButton pending={saving}>Create bundle</SubmitButton>
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
        emptyMessage="No bundles yet."
        getRowKey={(r) => r.slug}
        onRowClick={(r) => router.push(`/admin/content/bundles/${r.slug}`)}
      />
    </>
  );
}
