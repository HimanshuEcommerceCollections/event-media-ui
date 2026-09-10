import AdminContentPageDetailView from "./AdminContentPageDetailView";

export const metadata = {
  title: "Edit page — Admin — Events & Media",
  robots: { index: false, follow: false },
};

export default async function AdminContentPageDetailPage({ params }) {
  const { slug } = await params;
  return <AdminContentPageDetailView slug={slug} />;
}
