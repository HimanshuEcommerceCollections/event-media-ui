/**
 * Regenerates the offline copies of the API content.
 *
 *   node scripts/generate-fallbacks.mjs
 *
 * Every content route is prerendered, which means `next build` fetches it — and
 * a build must not need a running API, nor should a page blank out if the API
 * is down later. Each route therefore ships a fallback module it can render
 * from instead.
 *
 * These are generated rather than hand-written so they cannot drift from the
 * real payload. Run this after changing anything under backend/src/db/seed-data
 * with the API up, and commit the result.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Every fallback: where it lands, what it exports, and where it comes from. */
const TARGETS = [
  {
    file: "app/reviews/reviews-fallback.js",
    name: "REVIEWS_FALLBACK",
    path: "/api/v1/content/reviews",
    describes: "the reviews page",
  },
  {
    file: "app/legal/privacy/privacy-fallback.js",
    name: "PRIVACY_FALLBACK",
    path: "/api/v1/content/legal/privacy",
    describes: "the privacy policy",
  },
  {
    file: "app/legal/terms/terms-fallback.js",
    name: "TERMS_FALLBACK",
    path: "/api/v1/content/legal/terms",
    describes: "the terms of service",
  },
  ...[
    "party-rentals",
    "entertainers",
    "dj-music",
    "photo-video",
    "virtual-tours",
    "drone-video",
  ].map((slug) => ({
    file: `app/services/${slug}/${slug}-fallback.js`,
    name: `${slug.replaceAll("-", "_").toUpperCase()}_FALLBACK`,
    path: `/api/v1/content/services/${slug}`,
    describes: `the ${slug} service page`,
  })),
];

async function fetchData(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  const payload = await res.json();
  if (payload?.data === undefined) throw new Error(`GET ${path} returned no data envelope`);
  return payload.data;
}

function moduleSource({ name, path, describes }, data) {
  return `/**
 * Offline copy of ${describes}, in the exact shape the API returns.
 *
 * GENERATED — do not edit. Run \`node scripts/generate-fallbacks.mjs\` with the
 * API running to refresh it. Source: GET ${path}
 */
export const ${name} = ${JSON.stringify(data, null, 2)};
`;
}

let failed = 0;
for (const target of TARGETS) {
  try {
    const data = await fetchData(target.path);
    const out = join(ROOT, target.file);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, moduleSource(target, data), "utf8");
    console.log(`wrote ${target.file}`);
  } catch (err) {
    failed++;
    console.error(`failed ${target.file}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} of ${TARGETS.length} fallbacks could not be generated.`);
  console.error(`Is the API running on ${API_URL}?`);
  process.exitCode = 1;
}
