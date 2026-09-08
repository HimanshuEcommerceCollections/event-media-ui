import LegalView from "../LegalView";
import { PRIVACY_FALLBACK } from "./privacy-fallback";
import { loadLegalDocument } from "../loadDocument";

export const metadata = {
  title: "Privacy Policy — Events & Media",
  robots: { index: false, follow: false },
};

// A literal, not the shared constant: Next reads a segment config statically.
export const revalidate = 3600;

export default async function PrivacyPage() {
  const doc = await loadLegalDocument("privacy", PRIVACY_FALLBACK, revalidate);
  return <LegalView doc={doc} />;
}
