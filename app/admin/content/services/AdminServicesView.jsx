"use client";

// /admin/content/services — GET /admin/services (no `blocks` on list rows,
// per the contract), plus an inline "new service" form. Editing — including
// the blocks editor — happens on the detail route.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "../../_components/AdminTable";
import { TextField, ToggleField, SubmitButton } from "../../_components/fields";
import { getAdminServices, createAdminService } from "../../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../../_lib/useAdminToken";

const PAGE_SIZE = 20;

const COLUMNS = [
  { key: "no", label: "No." },
  { key: "title", label: "Title" },
  { key: "priceLabel", label: "Price" },
  { key: "iconKey", label: "Icon" },
  { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
  { key: "sortOrder", label: "Sort" },
];

const BLANK = { slug: "", title: "", blurb: "", priceLabel: "", priceCents: "", priceUnit: "", isB2b: false, isActive: true };

export default function AdminServicesView() {
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
    getAdminServices({ page, pageSize: PAGE_SIZE }, token)
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load services.");
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
      const created = await createAdminService(
        { ...draft, priceCents: draft.priceCents === "" ? undefined : draft.priceCents },
        token,
      );
      router.push(`/admin/content/services/${created.slug}`);
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not create this service.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Services</h1>
          <p>The catalogue rendered across the site's service pages.</p>
        </div>
        <button className="ad-btn" type="button" onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancel" : "+ New service"}
        </button>
      </div>

      {showNew && (
        <div className="ad-section">
          <h2>New service</h2>
          <form className="ad-form" onSubmit={onCreate}>
            <TextField label="Slug" value={draft.slug} onChange={set("slug")} required />
            <TextField label="Title" value={draft.title} onChange={set("title")} required />
            <TextField label="Blurb" value={draft.blurb} onChange={set("blurb")} />
            <TextField label="Price label" value={draft.priceLabel} onChange={set("priceLabel")} />
            <TextField label="Price (cents)" type="number" value={draft.priceCents} onChange={set("priceCents")} />
            <TextField label="Price unit" value={draft.priceUnit} onChange={set("priceUnit")} />
            <ToggleField label="B2B" checked={draft.isB2b} onChange={set("isB2b")} />
            <ToggleField label="Active" checked={draft.isActive} onChange={set("isActive")} />
            {hint && <div className="ad-hint error">{hint}</div>}
            <SubmitButton pending={saving}>Create service</SubmitButton>
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
        emptyMessage="No services yet."
        getRowKey={(r) => r.slug}
        onRowClick={(r) => router.push(`/admin/content/services/${r.slug}`)}
      />
    </>
  );
}
