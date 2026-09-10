import AdminBookingsView from "./AdminBookingsView";

export const metadata = {
  title: "Bookings — Admin — Events & Media",
  robots: { index: false, follow: false },
};

export default function AdminBookingsPage() {
  return <AdminBookingsView />;
}
