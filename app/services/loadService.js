/**
 * Fetches one service page's content, falling back to the generated offline
 * copy if the API cannot be reached.
 *
 * Shared by all six routes because they differ only in which slug they ask for
 * and which fallback they hand over.
 *
 * The catalogue changes rarely and every service page is above-the-fold
 * content, so the routes are prerendered on a 5-minute window rather than
 * rendered per request. Each route repeats that number as a literal in its own
 * `export const revalidate`: Next has to read a segment config statically, so
 * it cannot be an imported constant.
 */

import { getService } from "../../lib/api";

export async function loadService(slug, fallback, revalidate) {
  try {
    return await getService(slug, { revalidate });
  } catch (err) {
    // `next build` prerenders these routes whether or not the API is running,
    // and a pricing page must not blank out if it goes down later.
    console.warn(
      `[services/${slug}] falling back to static content: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    return fallback;
  }
}
