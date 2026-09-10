import AdminGalleryDetailView from "./AdminGalleryDetailView";

export const metadata = {
  title: "Edit gallery item — Admin — Events & Media",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryDetailPage({ params }) {
  const { id } = await params;
  return <AdminGalleryDetailView id={id} />;
}
