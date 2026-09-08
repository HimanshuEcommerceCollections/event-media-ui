import VirtualToursView from "./VirtualToursView";
import { VIRTUAL_TOURS_FALLBACK } from "./virtual-tours-fallback";
import { loadService } from "../loadService";

export const metadata = {
  title: "Virtual tours — Events & Media",
  robots: { index: false, follow: false },
};

// A literal, not the shared constant: Next reads a segment config statically.
export const revalidate = 300;

export default async function VirtualToursPage() {
  const content = await loadService("virtual-tours", VIRTUAL_TOURS_FALLBACK, revalidate);
  return <VirtualToursView content={content} />;
}
