import AdminLegalDetailView from "./AdminLegalDetailView";

export const metadata = {
  title: "Edit legal document — Admin — Events & Media",
  robots: { index: false, follow: false },
};

export default async function AdminLegalDetailPage({ params }) {
  const { slug } = await params;
  return <AdminLegalDetailView slug={slug} />;
}
