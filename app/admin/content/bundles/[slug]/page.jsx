import AdminBundleDetailView from "./AdminBundleDetailView";

export const metadata = {
  title: "Edit bundle — Admin — Events & Media",
  robots: { index: false, follow: false },
};

export default async function AdminBundleDetailPage({ params }) {
  const { slug } = await params;
  return <AdminBundleDetailView slug={slug} />;
}
