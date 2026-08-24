import HomeView from "./HomeView";
import { FALLBACK_CONTENT, mapHomeContent } from "./content-fallback";
import { getHomeContent } from "../lib/api";

export const metadata = {
  title: "Events & Media — one request, whole event covered",
  robots: { index: false, follow: false },
};

// Next 16 does not cache fetch by default, which would make this route render on
// every request. Caching it keeps the page prerendered — important because the
// content is above the fold, so a client-side fetch would flash an empty hero —
// while still picking up catalogue edits within the window.
export const revalidate = 60;

async function loadContent() {
  try {
    const data = await getHomeContent({ revalidate });
    return mapHomeContent(data);
  } catch (err) {
    // The API being down must not blank the landing page, and `next build`
    // prerenders this route whether or not the backend is running.
    console.warn(
      `[home] falling back to static content: ${err instanceof Error ? err.message : String(err)}`,
    );
    return FALLBACK_CONTENT;
  }
}

export default async function HomePage() {
  const content = await loadContent();
  return <HomeView content={content} />;
}
