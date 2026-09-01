import LegalView from "../LegalView";
import { PRIVACY } from "../documents";

export const metadata = {
  title: "Privacy Policy — Events & Media",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return <LegalView doc={PRIVACY} />;
}
