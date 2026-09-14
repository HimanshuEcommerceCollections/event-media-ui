import VendorJobDetailView from "./VendorJobDetailView";

export const metadata = {
  title: "Job — Vendor — Events & Media",
  robots: { index: false, follow: false },
};

export default async function VendorJobDetailPage({ params }) {
  const { id } = await params;
  return <VendorJobDetailView id={id} />;
}
