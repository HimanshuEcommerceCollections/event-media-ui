"use client";

// The navbar's account control, shared by every route that paints the pill nav.
//
// Signed out it is a "Sign in" button; signed in it is the user's initials in a
// disc that opens a menu with Profile and Sign out. It reuses each route's own
// `.pn-drop` / `.pn-menu` classes so the menu inherits that page's dropdown
// styling — the Services menu next to it — and adds only the avatar and the
// name/email header as namespaced `.na-*` rules.
//
// The session lives in localStorage (see lib/session.js), which the server
// cannot read, so the first paint is always the signed-out button and the
// avatar appears on mount. Rendering nothing until mounted would avoid that
// swap but leave a hole in the nav on every page load, which is the more
// visible of the two.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getMe } from "../../lib/api";
import { signOut } from "../../lib/auth";
import { clearSession, loadSession } from "../../lib/session";
import "./nav-auth.css";

// Mirrors initialsOf() in the backend's auth.service.ts, for sessions stored
// before the server started sending `initials` and for the signup path, where
// the DTO is built from a name the user just typed.
function initialsOf(user) {
  if (user?.initials) return user.initials;
  const words = String(user?.fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return String(user?.email ?? "?").slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function NavAuth() {
  const [session, setSession] = useState(null);
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    setSession(loadSession());
    // Another tab signing in or out writes the same key, so mirror it here
    // rather than leaving this tab's nav stale.
    const onStorage = (e) => {
      if (e.key === null || e.key === "em.session") setSession(loadSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // A token that the server has expired or revoked should not keep showing an
  // avatar. Only a 401 clears it: a network error means the API is down, which
  // says nothing about whether the session is still good.
  useEffect(() => {
    if (!session?.accessToken) return;
    let live = true;
    getMe(session.accessToken)
      .then((user) => {
        if (live && user) setSession((s) => (s ? { ...s, user } : s));
      })
      .catch((err) => {
        if (!live) return;
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          setSession(null);
        }
      });
    return () => {
      live = false;
    };
  }, [session?.accessToken]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!dropRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSignOut = useCallback(
    async (e) => {
      e.preventDefault();
      if (leaving) return;
      setLeaving(true);
      await signOut(session);
      // A full navigation, not a router push: every route reads the session on
      // mount, so re-running that from scratch is what makes the whole page
      // agree that nobody is signed in.
      window.location.assign("/");
    },
    [leaving, session],
  );

  if (!session?.user) {
    return (
      <a className="pn-item na-signin" href="/signin" data-cursor="link">
        Sign in
      </a>
    );
  }

  const { user } = session;

  return (
    <div className={`pn-drop na-drop${open ? " open" : ""}`} ref={dropRef}>
      <a
        className="pn-item na-trigger"
        href="/dashboard"
        role="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account — ${user.fullName || user.email}`}
        data-cursor="link"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <span className="na-avatar" aria-hidden="true">
          {initialsOf(user)}
        </span>
      </a>
      <div className="pn-menu na-menu" role="menu">
        <span className="pn-menu-caret" aria-hidden="true" />
        <span className="na-who">
          <b>{user.fullName || "Your account"}</b>
          <i>{user.email}</i>
        </span>
        <a href="/dashboard" role="menuitem" onClick={() => setOpen(false)}>
          Profile
        </a>
        <a href="/signin" role="menuitem" onClick={handleSignOut} aria-disabled={leaving}>
          {leaving ? "Signing out…" : "Sign out"}
        </a>
      </div>
    </div>
  );
}
