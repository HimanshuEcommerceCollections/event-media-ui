import AdminVendorAccountDetailView from "./AdminVendorAccountDetailView";

export const metadata = {
  title: "Vendor account — Admin — Events & Media",
  robots: { index: false, follow: false },
};

export default async function AdminVendorAccountDetailPage({ params }) {
  const { id } = await params;
  return <AdminVendorAccountDetailView id={id} />;
}
