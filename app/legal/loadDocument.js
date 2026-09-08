/**
 * Fetches a legal document for its route, falling back to the generated
 * offline copy if the API cannot be reached.
 *
 * Shared by both routes because they differ only in which slug they ask for.
 * Legal copy is the least volatile content in the app, so its revalidate
 * window is the longest — each route repeats that number as a literal in its
 * own `export const revalidate`, because Next has to read a segment config
 * statically and cannot follow an imported constant.
 */

import { getLegalDocument } from "../../lib/api";

export async function loadLegalDocument(slug, fallback, revalidate) {
  try {
    return await getLegalDocument(slug, { revalidate });
  } catch (err) {
    // `next build` prerenders both routes whether or not the API is running,
    // and a policy page going blank is worse than serving a slightly stale one.
    console.warn(
      `[legal/${slug}] falling back to static content: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    return fallback;
  }
}
