"use client";

// Session plumbing shared by every /vendor page.
//
// A sibling of app/admin/_lib/useAdminToken.js rather than a shared module:
// the two differ in where an expired session is sent back to, and a route in
// this app owns its own lib the way it owns its own CSS. Keeping them apart
// means neither guard can be changed by accident while working on the other.

import { useEffect, useState } from "react";
import { clearSession, loadSession } from "../../../lib/session";

/**
 * The bearer token for the vendor API calls. localStorage is not readable
 * during the server render, so it starts `undefined` (not read yet) and flips
 * to the string or `null` on mount — wait for a non-undefined value before
 * firing a request.
 */
export function useVendorToken() {
  const [token, setToken] = useState(undefined);

  useEffect(() => {
    setToken(loadSession()?.accessToken ?? null);
  }, []);

  return token;
}

/**
 * A token that was good when the layout mounted can still expire. Run an
 * ApiError through this first: true means the browser is already on its way
 * to sign in and the caller should stop.
 */
export function handleVendorAuthError(err) {
  if (err && err.status === 401) {
    clearSession();
    window.location.assign("/signin?next=/vendor");
    return true;
  }
  return false;
}
