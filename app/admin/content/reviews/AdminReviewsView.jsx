"use client";

// /admin/content/reviews — moderation only: the contract gives reviews no
// create and no delete, just GET list and PATCH. isPublished/isSpotlight are
// inline toggles that PATCH the moment they change; there is no detail page.

import { useEffect, useState } from "react";
import AdminTable from "../../_components/AdminTable";
import { ToggleField } from "../../_components/fields";
import { getAdminReviews, updateAdminReview } from "../../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../../_lib/useAdminToken";

const PAGE_SIZE = 20;

export default function AdminReviewsView() {
  const token = useAdminToken();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [rowHint, setRowHint] = useState({});

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    getAdminReviews({ page, pageSize: PAGE_SIZE }, token)
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load reviews.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, page]);

  const patch = async (review, patchBody) => {
    setSavingId(review.id);
    setRowHint((h) => ({ ...h, [review.id]: "" }));
    try {
      const updated = await updateAdminReview(review.id, patchBody, token);
      setResult((r) => ({ ...r, items: r.items.map((it) => (it.id === review.id ? updated : it)) }));
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setRowHint((h) => ({ ...h, [review.id]: err.message || "Could not save." }));
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { key: "authorName", label: "Author" },
    { key: "serviceLabel", label: "Service" },
    { key: "stars", label: "Stars" },
    { key: "body", label: "Review", render: (r) => <span title={r.body}>{(r.body || "").slice(0, 80)}{(r.body || "").length > 80 ? "…" : ""}</span> },
    {
      key: "isPublished",
      label: "Published",
      render: (r) => (
        <ToggleField
          label=""
          checked={r.isPublished}
          disabled={savingId === r.id}
          onChange={(v) => patch(r, { isPublished: v })}
        />
      ),
    },
    {
      key: "isSpotlight",
      label: "Spotlight",
      render: (r) => (
        <ToggleField
          label=""
          checked={r.isSpotlight}
          disabled={savingId === r.id}
          onChange={(v) => patch(r, { isSpotlight: v })}
        />
      ),
    },
  ];

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Reviews</h1>
          <p>Moderate published reviews and pick the spotlight carousel.</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        rows={result.items}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        onPageChange={setPage}
        loading={loading}
        error={error}
        emptyMessage="No reviews yet."
        getRowKey={(r) => r.id}
      />
      {Object.values(rowHint).some(Boolean) && (
        <p className="ad-err" style={{ marginTop: 10 }}>
          {Object.values(rowHint).find(Boolean)}
        </p>
      )}
    </>
  );
}
