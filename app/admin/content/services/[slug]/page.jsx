import AdminServiceDetailView from "./AdminServiceDetailView";

export const metadata = {
  title: "Edit service — Admin — Events & Media",
  robots: { index: false, follow: false },
};

export default async function AdminServiceDetailPage({ params }) {
  const { slug } = await params;
  return <AdminServiceDetailView slug={slug} />;
}
