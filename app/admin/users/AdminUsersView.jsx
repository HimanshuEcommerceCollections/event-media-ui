"use client";

// /admin/users — search (email or full name) + an inline role <select> per
// row. The signed-in admin's own row has its control disabled: the backend
// 400s a self-demotion attempt (PATCH /admin/users/:id/role), so the row just
// mirrors that guard instead of letting the click round-trip into an error.

import { useEffect, useState } from "react";
import AdminTable from "../_components/AdminTable";
import { getAdminUsers, updateAdminUserRole } from "../../../lib/api";
import { loadSession } from "../../../lib/session";
import { handleAdminAuthError, useAdminToken } from "../_lib/useAdminToken";

const ROLES = ["customer", "admin"];
const PAGE_SIZE = 20;

const stamp = (secs) => (typeof secs === "number" ? new Date(secs * 1000).toLocaleDateString() : "—");

export default function AdminUsersView() {
  const token = useAdminToken();
  const [selfId, setSelfId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], page: 1, pageSize: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [rowHint, setRowHint] = useState({});

  useEffect(() => {
    setSelfId(loadSession()?.user?.id ?? null);
  }, []);

  useEffect(() => {
    if (token === undefined || token === null) return;
    let live = true;
    setLoading(true);
    setError(null);
    getAdminUsers({ search: search || undefined, page, pageSize: PAGE_SIZE }, token)
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((err) => {
        if (!live || handleAdminAuthError(err)) return;
        setError(err.message || "Could not load users.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token, search, page]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const onRoleChange = async (user, nextRole) => {
    setSavingId(user.id);
    setRowHint((h) => ({ ...h, [user.id]: "" }));
    try {
      const updated = await updateAdminUserRole(user.id, nextRole, token);
      setResult((r) => ({ ...r, items: r.items.map((u) => (u.id === user.id ? updated : u)) }));
    } catch (err) {
      if (handleAdminAuthError(err)) return;
      setRowHint((h) => ({ ...h, [user.id]: err.message || "Could not change role." }));
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { key: "email", label: "Email" },
    { key: "fullName", label: "Name", render: (u) => u.fullName || "—" },
    {
      key: "role",
      label: "Role",
      render: (u) =>
        u.id === selfId ? (
          <span className={`ad-badge st-${u.role}`}>{u.role} (you)</span>
        ) : (
          <>
            <select
              className="ad-select"
              value={u.role}
              disabled={savingId === u.id}
              onChange={(e) => onRoleChange(u, e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {rowHint[u.id] && (
              <div className="ad-err" style={{ marginTop: 4 }}>
                {rowHint[u.id]}
              </div>
            )}
          </>
        ),
    },
    { key: "emailVerified", label: "Verified", render: (u) => (u.emailVerified ? "Yes" : "No") },
    { key: "createdAt", label: "Joined", render: (u) => stamp(u.createdAt) },
    { key: "lastSigninAt", label: "Last sign-in", render: (u) => stamp(u.lastSigninAt) },
  ];

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Users</h1>
          <p>Every account, searchable by email or name.</p>
        </div>
      </div>

      <form className="ad-toolbar" onSubmit={onSearchSubmit}>
        <input
          type="search"
          placeholder="Search email or name…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button className="ad-btn ghost" type="submit">
          Search
        </button>
        {search && (
          <button
            className="ad-btn ghost"
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
          >
            Clear
          </button>
        )}
      </form>

      <AdminTable
        columns={columns}
        rows={result.items}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        onPageChange={setPage}
        loading={loading}
        error={error}
        emptyMessage="No users match this search."
        getRowKey={(u) => u.id}
      />
    </>
  );
}
