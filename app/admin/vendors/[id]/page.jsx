import AdminVendorDetailView from "./AdminVendorDetailView";

export const metadata = {
  title: "Vendor — Admin — Events & Media",
  robots: { index: false, follow: false },
};

export default async function AdminVendorDetailPage({ params }) {
  const { id } = await params;
  return <AdminVendorDetailView id={id} />;
}
