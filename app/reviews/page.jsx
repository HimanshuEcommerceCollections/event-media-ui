import ReviewsView from "./ReviewsView";
import { REVIEWS_FALLBACK } from "./reviews-fallback";
import { getReviewsContent } from "../../lib/api";

export const metadata = {
  title: "Reviews — Events & Media",
  robots: { index: false, follow: false },
};

// The wall, its histogram and the spotlight all sit above the fold, so the
// route is prerendered and refreshed on a window rather than fetched from the
// client — a client-side fetch would flash an empty page. 60s is short enough
// that a newly published review shows up quickly.
export const revalidate = 60;

async function loadContent() {
  try {
    return await getReviewsContent({ revalidate });
  } catch (err) {
    // `next build` prerenders this route whether or not the API is running,
    // and the page should not blank out if it is down.
    console.warn(
      `[reviews] falling back to static content: ${err instanceof Error ? err.message : String(err)}`,
    );
    return REVIEWS_FALLBACK;
  }
}

export default async function ReviewsPage() {
  const content = await loadContent();
  return <ReviewsView content={content} />;
}
