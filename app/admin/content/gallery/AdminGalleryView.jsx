"use client";

// /admin/content/gallery — thin CRUD over `gallery_items` (pk `id`).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "../../_components/AdminTable";
import { TextField, SubmitButton } from "../../_components/fields";
import { getAdminGalleryItems, createAdminGalleryItem } from "../../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../../_lib/useAdminToken";

const PAGE_SIZE = 20;
const BLANK = { surface: "", imagePath: "", label: "", caption: "", sortOrder: "" };

const COLUMNS = [
  { key: "surface", label: "Surface" },
  { key: "label", label: "Label" },
  { key: "imagePath", label: "Image path" },
  { key: "sortOrder", label: "Sort" },
];

export default function AdminGalleryView() {
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
    getAdminGalleryItems({ page, pageSize: PAGE_SIZE }, token)
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load gallery items.");
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
      const created = await createAdminGalleryItem(
        { ...draft, sortOrder: draft.sortOrder === "" ? undefined : draft.sortOrder },
        token,
      );
      router.push(`/admin/content/gallery/${created.id}`);
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not create this item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Gallery</h1>
          <p>Images used across the site's gallery surfaces.</p>
        </div>
        <button className="ad-btn" type="button" onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancel" : "+ New item"}
        </button>
      </div>

      {showNew && (
        <div className="ad-section">
          <h2>New gallery item</h2>
          <form className="ad-form" onSubmit={onCreate}>
            <TextField label="Surface" value={draft.surface} onChange={set("surface")} required />
            <TextField label="Image path" value={draft.imagePath} onChange={set("imagePath")} required />
            <TextField label="Label" value={draft.label} onChange={set("label")} />
            <TextField label="Caption" value={draft.caption} onChange={set("caption")} />
            <TextField label="Sort order" type="number" value={draft.sortOrder} onChange={set("sortOrder")} />
            {hint && <div className="ad-hint error">{hint}</div>}
            <SubmitButton pending={saving}>Create item</SubmitButton>
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
        emptyMessage="No gallery items yet."
        getRowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/admin/content/gallery/${r.id}`)}
      />
    </>
  );
}
