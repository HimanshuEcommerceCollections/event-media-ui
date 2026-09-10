"use client";

// Every admin route below app/admin/layout.jsx already had its session and
// role validated once by the layout guard, so child pages do not repeat that
// getMe() round trip — they just need the bearer token to call the admin API
// functions in lib/api.js. localStorage is not readable during the server
// render, so the token starts `undefined` (not yet read) and flips to the
// string or `null` on mount; callers should wait for a non-undefined value
// before firing their first request.

import { useEffect, useState } from "react";
import { clearSession, loadSession } from "../../../lib/session";

export function useAdminToken() {
  const [token, setToken] = useState(undefined);

  useEffect(() => {
    setToken(loadSession()?.accessToken ?? null);
  }, []);

  return token;
}

/**
 * A token that was good when the layout mounted can still expire mid-session.
 * Any admin view's catch block should run its ApiError through this first —
 * true means it already sent the browser to sign in and the caller should
 * stop (no further setState/error-painting needed).
 */
export function handleAdminAuthError(err) {
  if (err && err.status === 401) {
    clearSession();
    window.location.assign("/signin?next=/admin");
    return true;
  }
  return false;
}
