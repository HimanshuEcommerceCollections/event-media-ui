import LegalView from "../LegalView";
import { TERMS_FALLBACK } from "./terms-fallback";
import { loadLegalDocument } from "../loadDocument";

export const metadata = {
  title: "Terms of Service — Events & Media",
  robots: { index: false, follow: false },
};

// A literal, not the shared constant: Next reads a segment config statically.
export const revalidate = 3600;

export default async function TermsPage() {
  const doc = await loadLegalDocument("terms", TERMS_FALLBACK, revalidate);
  return <LegalView doc={doc} />;
}
