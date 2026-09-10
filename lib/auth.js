/**
 * Sign-out, shared by the navbar avatar menu and the dashboard header.
 *
 * The local session is cleared whatever the server says. A failed revoke leaves
 * a refresh token alive on the backend until it expires, which is worse than
 * revoking it — but keeping the browser signed in because the network blipped
 * is worse still, and the user asked to leave. The backend already rejects
 * refresh tokens it has never heard of, so a stale one is harmless on its own.
 */

import { signout } from "./api";
import { clearSession, loadSession } from "./session";

export async function signOut(session = loadSession()) {
  try {
    if (session?.refreshToken) {
      await signout(session.refreshToken, session.accessToken);
    }
  } catch {
    // Offline, or the token was already revoked. Either way, drop it locally.
  } finally {
    clearSession();
  }
}
