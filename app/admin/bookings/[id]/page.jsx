import AdminBookingDetailView from "./AdminBookingDetailView";

export const metadata = {
  title: "Booking — Admin — Events & Media",
  robots: { index: false, follow: false },
};

export default async function AdminBookingDetailPage({ params }) {
  const { id } = await params;
  return <AdminBookingDetailView id={id} />;
}
