import DjMusicView from "./DjMusicView";
import { DJ_MUSIC_FALLBACK } from "./dj-music-fallback";
import { loadService } from "../loadService";

export const metadata = {
  title: "DJ + music — Events & Media",
  robots: { index: false, follow: false },
};

// A literal, not the shared constant: Next reads a segment config statically.
export const revalidate = 300;

export default async function DjMusicPage() {
  const content = await loadService("dj-music", DJ_MUSIC_FALLBACK, revalidate);
  return <DjMusicView content={content} />;
}
