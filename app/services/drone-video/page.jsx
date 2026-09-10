import DroneVideoView from "./DroneVideoView";
import { DRONE_VIDEO_FALLBACK } from "./drone-video-fallback";
import { loadService } from "../loadService";

export const metadata = {
  title: "Drone video — Events & Media",
  robots: { index: false, follow: false },
};

// A literal, not the shared constant: Next reads a segment config statically.
export const revalidate = 300;

export default async function DroneVideoPage() {
  const content = await loadService("drone-video", DRONE_VIDEO_FALLBACK, revalidate);
  return <DroneVideoView content={content} />;
}
