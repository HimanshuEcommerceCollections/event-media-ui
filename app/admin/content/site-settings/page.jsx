import AdminSiteSettingsView from "./AdminSiteSettingsView";

export const metadata = {
  title: "Site settings — Admin — Events & Media",
  robots: { index: false, follow: false },
};

export default function AdminSiteSettingsPage() {
  return <AdminSiteSettingsView />;
}
