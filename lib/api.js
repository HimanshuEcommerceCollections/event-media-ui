/**
 * Thin client for the backend in ../backend.
 *
 * Every response is wrapped as { data } on success and
 * { error: { code, message, details? } } on failure, so this normalises both
 * into a thrown ApiError or the unwrapped payload.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details ?? null;
  }

  /**
   * Server-side field errors arrive as details: [{ field, message }].
   * Returns a { field: message } map for painting form state.
   */
  fieldErrors() {
    if (!Array.isArray(this.details)) return {};
    return this.details.reduce((acc, d) => {
      if (d && typeof d.field === "string") acc[d.field] = d.message;
      return acc;
    }, {});
  }
}

async function request(path, { method = "GET", body, token, signal, cache, revalidate } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(signal ? { signal } : {}),
      ...(cache ? { cache } : {}),
      ...(revalidate !== undefined ? { next: { revalidate } } : {}),
    });
  } catch (cause) {
    // Network-level failure: the API is down, or CORS blocked the request.
    const err = new ApiError(0, "network_error", "Could not reach the server.");
    err.cause = cause;
    throw err;
  }

  if (res.status === 204) return null;

  const text = await res.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(res.status, "bad_response", "Server sent a malformed response.");
  }

  if (!res.ok) {
    const err = payload?.error ?? {};
    throw new ApiError(
      res.status,
      err.code ?? "error",
      err.message ?? "Something went wrong.",
      err.details,
    );
  }

  return payload?.data ?? null;
}

/* ------------------------------------------------------------------ content */

/** Everything the landing page renders, in one round trip. */
export const getHomeContent = (opts) => request("/api/v1/content/home", opts);

/* --------------------------------------------------------------------- auth */

export const signup = (input) => request("/api/v1/auth/signup", { method: "POST", body: input });

export const signin = (input) => request("/api/v1/auth/signin", { method: "POST", body: input });

export const verifyOtp = (input) =>
  request("/api/v1/auth/otp/verify", { method: "POST", body: input });

export const resendOtp = (email) =>
  request("/api/v1/auth/otp/resend", { method: "POST", body: { email } });

export const forgotPassword = (email) =>
  request("/api/v1/auth/password/forgot", { method: "POST", body: { email } });

export const getMe = (token) => request("/api/v1/auth/me", { token });

/* -------------------------------------------------------------------- perks */

export const getMyPerk = (token) => request("/api/v1/perks/me", { token });

/** Called once the scratch card has been scratched through. */
export const revealMyPerk = (token) =>
  request("/api/v1/perks/me/reveal", { method: "POST", token });
