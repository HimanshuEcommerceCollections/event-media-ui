import LegalView from "../LegalView";
import { TERMS } from "../documents";

export const metadata = {
  title: "Terms of Service — Events & Media",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return <LegalView doc={TERMS} />;
}
