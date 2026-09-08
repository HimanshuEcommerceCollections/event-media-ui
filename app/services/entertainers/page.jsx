import EntertainersView from "./EntertainersView";
import { ENTERTAINERS_FALLBACK } from "./entertainers-fallback";
import { loadService } from "../loadService";

export const metadata = {
  title: "Entertainers — Events & Media",
  robots: { index: false, follow: false },
};

// A literal, not the shared constant: Next reads a segment config statically.
export const revalidate = 300;

export default async function EntertainersPage() {
  const content = await loadService("entertainers", ENTERTAINERS_FALLBACK, revalidate);
  return <EntertainersView content={content} />;
}
