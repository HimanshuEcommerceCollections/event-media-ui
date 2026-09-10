"use client";

// /admin/content/site-settings — small homepage-config resources
// (featured_events, categories, stats) as plain state-toggled tabs, no
// routing, per the task brief. Testimonials is folded in as a fourth tab: the
// contract exposes the exact same generic CRUD shape for it and it is the
// same kind of small homepage list as the other three, so it gets the same
// treatment rather than being left with no admin UI at all — a judgment call
// beyond the brief's explicit tab list.
//
// Each tab is the same generic list+inline-form widget, parameterised by a
// field schema and the resource's own api functions.

import { useEffect, useState } from "react";
import AdminTable from "../../_components/AdminTable";
import { TextField, ToggleField, SubmitButton } from "../../_components/fields";
import {
  getAdminFeaturedEvents,
  createAdminFeaturedEvent,
  updateAdminFeaturedEvent,
  deleteAdminFeaturedEvent,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminStats,
  createAdminStat,
  updateAdminStat,
  deleteAdminStat,
  getAdminTestimonials,
  createAdminTestimonial,
  updateAdminTestimonial,
  deleteAdminTestimonial,
} from "../../../../lib/api";
import { handleAdminAuthError, useAdminToken } from "../../_lib/useAdminToken";

const PAGE_SIZE = 50;

const TABS = [
  {
    key: "featured_events",
    label: "Featured events",
    pk: "slug",
    api: { list: getAdminFeaturedEvents, create: createAdminFeaturedEvent, update: updateAdminFeaturedEvent, remove: deleteAdminFeaturedEvent },
    schema: [
      { key: "slug", label: "Slug", type: "text" },
      { key: "name", label: "Name", type: "text" },
      { key: "year", label: "Year", type: "number" },
      { key: "totalCents", label: "Total (cents)", type: "number" },
      { key: "totalLabel", label: "Total label", type: "text" },
      { key: "imagePath", label: "Image path", type: "text" },
      { key: "imageAlt", label: "Image alt", type: "text" },
      { key: "sortOrder", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    pk: "key",
    api: { list: getAdminCategories, create: createAdminCategory, update: updateAdminCategory, remove: deleteAdminCategory },
    schema: [
      { key: "key", label: "Key", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "sortOrder", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "stats",
    label: "Stats",
    pk: "key",
    api: { list: getAdminStats, create: createAdminStat, update: updateAdminStat, remove: deleteAdminStat },
    schema: [
      { key: "key", label: "Key", type: "text" },
      { key: "value", label: "Value", type: "number" },
      { key: "decimals", label: "Decimals", type: "number" },
      { key: "prefix", label: "Prefix", type: "text" },
      { key: "suffix", label: "Suffix", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "surface", label: "Surface", type: "text" },
      { key: "sortOrder", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    pk: "id",
    api: { list: getAdminTestimonials, create: createAdminTestimonial, update: updateAdminTestimonial, remove: deleteAdminTestimonial },
    schema: [
      { key: "quote", label: "Quote", type: "text" },
      { key: "authorName", label: "Author name", type: "text" },
      { key: "authorRole", label: "Author role", type: "text" },
      { key: "initials", label: "Initials", type: "text" },
      { key: "surface", label: "Surface", type: "text" },
      { key: "sortOrder", label: "Sort order", type: "number" },
    ],
  },
];

function blankFrom(schema) {
  return schema.reduce((acc, f) => ({ ...acc, [f.key]: f.type === "toggle" ? false : "" }), {});
}

function SchemaFields({ schema, values, onChange, disabled }) {
  return (
    <>
      {schema.map((f) => {
        const value = values[f.key];
        const set = (v) => onChange(f.key, v);
        if (f.type === "toggle") {
          return <ToggleField key={f.key} label={f.label} checked={!!value} onChange={set} disabled={disabled} />;
        }
        return (
          <TextField
            key={f.key}
            label={f.label}
            type={f.type === "number" ? "number" : "text"}
            value={value}
            onChange={set}
            disabled={disabled}
          />
        );
      })}
    </>
  );
}

function TabResource({ tab, token }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState(() => blankFrom(tab.schema));
  const [editingPk, setEditingPk] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState("");

  const load = () => {
    setLoading(true);
    setError(null);
    tab.api
      .list({ page: 1, pageSize: PAGE_SIZE }, token)
      .then((data) => setRows(data.items ?? []))
      .catch((err) => {
        if (handleAdminAuthError(err)) return;
        setError(err.message || "Could not load this list.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token === undefined || token === null) return;
    load();
    setShowNew(false);
    setEditingPk(null);
    setDraft(blankFrom(tab.schema));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab.key]);

  const cleaned = (values) =>
    Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === "" ? undefined : v]));

  const onCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setHint("");
    try {
      await tab.api.create(cleaned(draft), token);
      setShowNew(false);
      setDraft(blankFrom(tab.schema));
      load();
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not create this row.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row) => {
    setEditingPk(row[tab.pk]);
    setEditDraft(tab.schema.reduce((acc, f) => ({ ...acc, [f.key]: row[f.key] ?? "" }), {}));
    setHint("");
  };

  const onSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setHint("");
    try {
      await tab.api.update(editingPk, cleaned(editDraft), token);
      setEditingPk(null);
      load();
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not save this row.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm("Delete this row? This cannot be undone.")) return;
    try {
      await tab.api.remove(row[tab.pk], token);
      load();
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setHint(err.message || "Could not delete this row.");
    }
  };

  const columns = [
    ...tab.schema.map((f) => ({ key: f.key, label: f.label })),
    {
      key: "__actions",
      label: "",
      render: (row) => (
        <span style={{ display: "flex", gap: 8 }}>
          <button className="ad-btn ghost" type="button" onClick={() => startEdit(row)}>
            Edit
          </button>
          <button className="ad-btn danger" type="button" onClick={() => onDelete(row)}>
            Delete
          </button>
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="ad-toolbar">
        <button className="ad-btn" type="button" onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancel" : `+ New ${tab.label.toLowerCase().replace(/s$/, "")}`}
        </button>
      </div>

      {showNew && (
        <div className="ad-section">
          <form className="ad-form" onSubmit={onCreate}>
            <SchemaFields schema={tab.schema} values={draft} onChange={(k, v) => setDraft((d) => ({ ...d, [k]: v }))} />
            {hint && <div className="ad-hint error">{hint}</div>}
            <SubmitButton pending={saving}>Create</SubmitButton>
          </form>
        </div>
      )}

      {editingPk !== null && (
        <div className="ad-section">
          <h2>Edit {String(editingPk)}</h2>
          <form className="ad-form" onSubmit={onSaveEdit}>
            <SchemaFields
              schema={tab.schema.filter((f) => f.key !== tab.pk)}
              values={editDraft}
              onChange={(k, v) => setEditDraft((d) => ({ ...d, [k]: v }))}
            />
            {hint && <div className="ad-hint error">{hint}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <SubmitButton pending={saving}>Save</SubmitButton>
              <button className="ad-btn ghost" type="button" onClick={() => setEditingPk(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        emptyMessage={`No ${tab.label.toLowerCase()} yet.`}
        getRowKey={(r) => r[tab.pk]}
      />
    </>
  );
}

export default function AdminSiteSettingsView() {
  const token = useAdminToken();
  const [active, setActive] = useState(TABS[0].key);
  const tab = TABS.find((t) => t.key === active);

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Site settings</h1>
          <p>Small homepage lists — featured events, categories, stats and testimonials.</p>
        </div>
      </div>

      <div className="ad-tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={active === t.key ? "on" : undefined} onClick={() => setActive(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <TabResource key={tab.key} tab={tab} token={token} />
    </>
  );
}
