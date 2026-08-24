/**
 * Client-side session storage.
 *
 * TRADEOFF: tokens live in localStorage, which is readable by any script that
 * gets injected into the page. httpOnly cookies would be the stronger choice,
 * but the API returns tokens in its JSON body and does not set cookies, so that
 * would need a backend change. Acceptable for this demo build; revisit before
 * anything real ships.
 */

const KEY = "em.session";

export function saveSession({ accessToken, refreshToken, user }) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ accessToken, refreshToken, user }));
  } catch {
    // Private browsing or a full quota: the session just will not persist.
  }
}

export function loadSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.accessToken === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
