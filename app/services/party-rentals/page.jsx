import PartyRentalsView from "./PartyRentalsView";
import { PARTY_RENTALS_FALLBACK } from "./party-rentals-fallback";
import { loadService } from "../loadService";

export const metadata = {
  title: "Party rentals — Events & Media",
  robots: { index: false, follow: false },
};

// A literal, not the shared constant: Next reads a segment config statically.
export const revalidate = 300;

export default async function PartyRentalsPage() {
  const content = await loadService("party-rentals", PARTY_RENTALS_FALLBACK, revalidate);
  return <PartyRentalsView content={content} />;
}
