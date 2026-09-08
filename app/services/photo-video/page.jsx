import PhotoVideoView from "./PhotoVideoView";
import { PHOTO_VIDEO_FALLBACK } from "./photo-video-fallback";
import { loadService } from "../loadService";

export const metadata = {
  title: "Photo + video — Events & Media",
  robots: { index: false, follow: false },
};

// A literal, not the shared constant: Next reads a segment config statically.
export const revalidate = 300;

export default async function PhotoVideoPage() {
  const content = await loadService("photo-video", PHOTO_VIDEO_FALLBACK, revalidate);
  return <PhotoVideoView content={content} />;
}
