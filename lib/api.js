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

/** The catalogue plus the nav and menu links every page paints. */
export const getServices = (opts) => request("/api/v1/content/services", opts);

/** One service page: hero, intro, pricing, add-ons, FAQs, gallery, nav. */
export const getService = (slug, opts) => request(`/api/v1/content/services/${slug}`, opts);

/** The review wall, its spotlight carousel, histogram, stats and marquee. */
export const getReviewsContent = (opts) => request("/api/v1/content/reviews", opts);

/** A legal document as structured sections — see backend seed-data/legal.ts. */
export const getLegalDocument = (slug, opts) => request(`/api/v1/content/legal/${slug}`, opts);

/** The star tapped at the foot of the reviews page. No account needed. */
export const sendRatingPulse = (stars, token) =>
  request("/api/v1/content/reviews/pulse", { method: "POST", body: { stars }, token });

/* --------------------------------------------------------------------- auth */

export const signup = (input) => request("/api/v1/auth/signup", { method: "POST", body: input });

export const signin = (input) => request("/api/v1/auth/signin", { method: "POST", body: input });

export const verifyOtp = (input) =>
  request("/api/v1/auth/otp/verify", { method: "POST", body: input });

export const resendOtp = (email) =>
  request("/api/v1/auth/otp/resend", { method: "POST", body: { email } });

export const forgotPassword = (email) =>
  request("/api/v1/auth/password/forgot", { method: "POST", body: { email } });

export const resetPassword = (input) =>
  request("/api/v1/auth/password/reset", { method: "POST", body: input });

export const getMe = (token) => request("/api/v1/auth/me", { token });

/** Trades a refresh token for a new pair. The old refresh token stops working. */
export const refreshSession = (refreshToken) =>
  request("/api/v1/auth/refresh", { method: "POST", body: { refreshToken } });

export const signout = (refreshToken, token) =>
  request("/api/v1/auth/signout", { method: "POST", body: { refreshToken }, token });

/* ------------------------------------------------------------------ vendors */

/** The services a vendor can apply for, and which of them ask for Part-107. */
export const getVendorServiceTypes = () => request("/api/v1/vendors/service-types");

/** "Become a vendor". Open to visitors — no account needed to apply. */
export const submitVendorApplication = (input, token) =>
  request("/api/v1/vendors/applications", { method: "POST", body: input, token });

/** Looked up by the EVV reference the applicant was given. Public. */
export const getVendorApplication = (reference) =>
  request(`/api/v1/vendors/applications/${encodeURIComponent(reference)}`);

/* ----------------------------------------------------------- vendor portal */
//
// Everything below needs a token whose account has a live vendor profile
// (403 otherwise). None of these calls takes a vendor id — the server
// resolves the caller's own profile — so there is no "whose?" to get wrong.

/** Profile plus the work summary the overview paints. */
export const getMyVendor = (token) => request("/api/v1/vendors/me", { token });

export const updateMyVendor = (input, token) =>
  request("/api/v1/vendors/me", { method: "PATCH", body: input, token });

export const getMyVendorAssignments = ({ status, page, pageSize } = {}, token) =>
  request(`/api/v1/vendors/me/assignments${qs({ status, page, pageSize })}`, { token });

export const getMyVendorAssignment = (id, token) =>
  request(`/api/v1/vendors/me/assignments/${id}`, { token });

/** `action` is "accept" or "decline". 409s if the offer already moved on. */
export const respondToVendorAssignment = (id, action, note, token) =>
  request(`/api/v1/vendors/me/assignments/${id}/respond`, {
    method: "POST",
    body: { action, ...(note ? { note } : {}) },
    token,
  });

export const completeVendorAssignment = (id, token) =>
  request(`/api/v1/vendors/me/assignments/${id}/complete`, { method: "POST", token });

/* -------------------------------------------------------------------- perks */

export const getMyPerk = (token) => request("/api/v1/perks/me", { token });

/** Called once the scratch card has been scratched through. */
export const revealMyPerk = (token) =>
  request("/api/v1/perks/me/reveal", { method: "POST", token });

/* ----------------------------------------------------------------- bookings */
//
// `quote_requests` and its /api/v1/requests routes were dropped when the
// builder replaced one-service enquiries with one request carrying N
// configured services; these call the endpoints that replaced them.

/**
 * Prices a package without storing anything, so the builder can call it on
 * every tile change and get exactly the figures a submission would record.
 */
export const quoteBooking = (input) =>
  request("/api/v1/bookings/quote", { method: "POST", body: input });

/**
 * The "one request, whole event covered" enquiry. The server recomputes the
 * total from the line items, so what the calculator displays is a preview, not
 * the price of record — send it as `clientTotal` and a 400 says it moved.
 */
export const submitBooking = (input, token) =>
  request("/api/v1/bookings", { method: "POST", body: input, token });

export const getMyBookings = (token) => request("/api/v1/bookings/mine", { token });

/** The success page, reloadable: references look like EVM-2026-0001. */
export const getBookingByReference = (reference) =>
  request(`/api/v1/bookings/${encodeURIComponent(reference)}`);

/* --------------------------------------------------------------- admin */
//
// Every route below lives under /api/v1/admin, requires a bearer token whose
// user has role "admin" (401/403 otherwise) and, for list endpoints, returns
// the { items, page, pageSize, total } envelope described in
// admin-api-contract.md. Functions keep the same explicit-params-plus-token
// shape as the rest of this file.

const ADMIN = "/api/v1/admin";

/** Builds a "?a=1&b=2" query string, dropping undefined/null/empty values. */
function qs(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export const getAdminSummary = (token) => request(`${ADMIN}/summary`, { token });

/* ---- bookings (event_booking_requests) ---- */

export const getAdminBookings = ({ status, page, pageSize } = {}, token) =>
  request(`${ADMIN}/bookings${qs({ status, page, pageSize })}`, { token });

export const getAdminBooking = (id, token) => request(`${ADMIN}/bookings/${id}`, { token });

export const updateAdminBookingStatus = (id, status, token) =>
  request(`${ADMIN}/bookings/${id}/status`, { method: "PATCH", body: { status }, token });

/* ---- vendors (vendor_applications) ---- */

export const getAdminVendors = ({ status, page, pageSize } = {}, token) =>
  request(`${ADMIN}/vendors${qs({ status, page, pageSize })}`, { token });

export const getAdminVendor = (id, token) => request(`${ADMIN}/vendors/${id}`, { token });

/**
 * Setting this to "approved" also provisions the vendor account and emails an
 * invite, so the reply carries `account: { vendorId, accountCreated, inviteSent }`
 * alongside the application. Idempotent — approving twice changes nothing.
 */
export const updateAdminVendorStatus = (id, status, token) =>
  request(`${ADMIN}/vendors/${id}/status`, { method: "PATCH", body: { status }, token });

/* ---- assignments (offering a booking line to a vendor) ---- */

/** Every offer on this booking, plus `serviceLines` — what it can be offered for. */
export const getAdminBookingAssignments = (bookingId, token) =>
  request(`${ADMIN}/bookings/${bookingId}/assignments`, { token });

/**
 * 400s when the booking has no such service line, or when the vendor is not
 * listed for it; 409s when that vendor already holds this line.
 */
export const createAdminBookingAssignment = (bookingId, input, token) =>
  request(`${ADMIN}/bookings/${bookingId}/assignments`, { method: "POST", body: input, token });

export const updateAdminAssignment = (id, input, token) =>
  request(`${ADMIN}/assignments/${id}`, { method: "PATCH", body: input, token });

/** Removes an offer made in error. To take back one the vendor has seen,
 *  PATCH it to "withdrawn" so it stays on their list with an explanation. */
export const deleteAdminAssignment = (id, token) =>
  request(`${ADMIN}/assignments/${id}`, { method: "DELETE", token });

/* ---- vendor accounts (the directory approved applications became) ---- */

export const getAdminVendorAccounts = ({ serviceType, includeInactive, page, pageSize } = {}, token) =>
  request(
    `${ADMIN}/vendors/accounts${qs({
      serviceType,
      includeInactive: includeInactive ? "true" : undefined,
      page,
      pageSize,
    })}`,
    { token },
  );

export const getAdminVendorAccount = (id, token) =>
  request(`${ADMIN}/vendors/accounts/${id}`, { token });

/** Service types and suspension are the coordinator's call, so they live here
 *  rather than on the vendor's own profile PATCH. */
export const updateAdminVendorAccount = (id, input, token) =>
  request(`${ADMIN}/vendors/accounts/${id}`, { method: "PATCH", body: input, token });

/* ---- users ---- */

export const getAdminUsers = ({ search, page, pageSize } = {}, token) =>
  request(`${ADMIN}/users${qs({ search, page, pageSize })}`, { token });

/** 400s if `id` is the caller's own id — the backend forbids self-demotion. */
export const updateAdminUserRole = (id, role, token) =>
  request(`${ADMIN}/users/${id}/role`, { method: "PATCH", body: { role }, token });

/* ---- generic content resources ---- */
//
// content-pages, legal-documents, gallery-items, featured-events, categories,
// stats, testimonials and reviews all follow the identical
// list/get/create/update/delete shape against /admin/<path>/:pk — only the
// path segment and the primary-key name differ (see admin-api-contract.md).
// This factory is a DRY internal helper only; every resource still gets its
// own named export below so call sites read exactly like every other
// function in this file.
function resourceApi(path) {
  return {
    list: ({ page, pageSize } = {}, token) =>
      request(`${ADMIN}/${path}${qs({ page, pageSize })}`, { token }),
    get: (pk, token) => request(`${ADMIN}/${path}/${pk}`, { token }),
    create: (input, token) => request(`${ADMIN}/${path}`, { method: "POST", body: input, token }),
    update: (pk, input, token) =>
      request(`${ADMIN}/${path}/${pk}`, { method: "PATCH", body: input, token }),
    remove: (pk, token) => request(`${ADMIN}/${path}/${pk}`, { method: "DELETE", token }),
  };
}

const contentPagesApi = resourceApi("content-pages");
export const getAdminContentPages = contentPagesApi.list;
export const getAdminContentPage = contentPagesApi.get;
export const createAdminContentPage = contentPagesApi.create;
export const updateAdminContentPage = contentPagesApi.update;
export const deleteAdminContentPage = contentPagesApi.remove;

const legalDocumentsApi = resourceApi("legal-documents");
export const getAdminLegalDocuments = legalDocumentsApi.list;
export const getAdminLegalDocument = legalDocumentsApi.get;
export const createAdminLegalDocument = legalDocumentsApi.create;
export const updateAdminLegalDocument = legalDocumentsApi.update;
export const deleteAdminLegalDocument = legalDocumentsApi.remove;

const galleryItemsApi = resourceApi("gallery-items");
export const getAdminGalleryItems = galleryItemsApi.list;
export const getAdminGalleryItem = galleryItemsApi.get;
export const createAdminGalleryItem = galleryItemsApi.create;
export const updateAdminGalleryItem = galleryItemsApi.update;
export const deleteAdminGalleryItem = galleryItemsApi.remove;

const featuredEventsApi = resourceApi("featured-events");
export const getAdminFeaturedEvents = featuredEventsApi.list;
export const getAdminFeaturedEvent = featuredEventsApi.get;
export const createAdminFeaturedEvent = featuredEventsApi.create;
export const updateAdminFeaturedEvent = featuredEventsApi.update;
export const deleteAdminFeaturedEvent = featuredEventsApi.remove;

const categoriesApi = resourceApi("categories");
export const getAdminCategories = categoriesApi.list;
export const getAdminCategory = categoriesApi.get;
export const createAdminCategory = categoriesApi.create;
export const updateAdminCategory = categoriesApi.update;
export const deleteAdminCategory = categoriesApi.remove;

const statsApi = resourceApi("stats");
export const getAdminStats = statsApi.list;
export const getAdminStat = statsApi.get;
export const createAdminStat = statsApi.create;
export const updateAdminStat = statsApi.update;
export const deleteAdminStat = statsApi.remove;

const testimonialsApi = resourceApi("testimonials");
export const getAdminTestimonials = testimonialsApi.list;
export const getAdminTestimonial = testimonialsApi.get;
export const createAdminTestimonial = testimonialsApi.create;
export const updateAdminTestimonial = testimonialsApi.update;
export const deleteAdminTestimonial = testimonialsApi.remove;

// Reviews are moderation-only: list + patch, no create, no delete.
const reviewsApi = resourceApi("reviews");
export const getAdminReviews = reviewsApi.list;
export const getAdminReview = reviewsApi.get;
export const updateAdminReview = reviewsApi.update;

/* ---- services (services + service_blocks) ---- */

const servicesResource = resourceApi("services");
export const getAdminServices = servicesResource.list;
/** Includes `blocks: ServiceBlockDto[]`, unlike the list rows. */
export const getAdminService = servicesResource.get;
export const createAdminService = servicesResource.create;
/**
 * `input` may include `blocks: ServiceBlockInput[]`, which replaces every
 * `service_blocks` row for this service in one transaction when present.
 */
export const updateAdminService = servicesResource.update;
// No delete endpoint — soft-disable with updateAdminService(slug, { isActive: false }, token).

/* ---- bundles (bundles + bundle_items) ---- */

const bundlesResource = resourceApi("bundles");
export const getAdminBundles = bundlesResource.list;
/** Includes `items: BundleItemDto[]`, unlike the list rows. */
export const getAdminBundle = bundlesResource.get;
export const createAdminBundle = bundlesResource.create;
/**
 * `input` may include `items: BundleItemInput[]`, which replaces every
 * `bundle_items` row for this bundle in one transaction when present.
 */
export const updateAdminBundle = bundlesResource.update;
// No delete endpoint — same convention as services.
