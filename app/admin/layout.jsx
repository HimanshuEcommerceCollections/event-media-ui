"use client";

// Route guard + shell for every /admin/* page.
//
// On mount: no session → straight to /signin?next=/admin. A session is
// re-validated with the same getMe(token) call NavAuth.jsx already makes
// (not a JWT decode) so a stale localStorage role can never grant access —
// only what the server says right now can. Not an admin → sent home. Only
// once the server has confirmed role "admin" does the sidebar + children
// render; every check in between shows a plain loading card.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, getMe } from "../../lib/api";
import { clearSession, loadSession } from "../../lib/session";
import "./admin.css";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/analytics", label: "Analytics" },
];

const CONTENT_NAV = [
  { href: "/admin/content/services", label: "Services" },
  { href: "/admin/content/pages", label: "Pages" },
  { href: "/admin/content/bundles", label: "Bundles" },
  { href: "/admin/content/reviews", label: "Reviews" },
  { href: "/admin/content/gallery", label: "Gallery" },
  { href: "/admin/content/legal", label: "Legal" },
  { href: "/admin/content/site-settings", label: "Site settings" },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  // "checking" | "ok" | "denied" — "denied" still renders the loading card
  // while the redirect it just kicked off is in flight.
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let live = true;
    const session = loadSession();
    if (!session?.accessToken) {
      router.replace("/signin?next=/admin");
      return undefined;
    }
    getMe(session.accessToken)
      .then((user) => {
        if (!live) return;
        if (user?.role === "admin") {
          setStatus("ok");
        } else {
          setStatus("denied");
          router.replace("/");
        }
      })
      .catch((err) => {
        if (!live) return;
        setStatus("denied");
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          router.replace("/signin?next=/admin");
        } else {
          router.replace("/");
        }
      });
    return () => {
      live = false;
    };
  }, [router]);

  if (status !== "ok") {
    return (
      <div className="ad-gate">
        <div className="ad-gate-card">
          {status === "denied" ? "Redirecting…" : "Checking access…"}
        </div>
      </div>
    );
  }

  const isOn = (href) => (href === "/admin" ? pathname === href : pathname?.startsWith(href));

  return (
    <div className="ad-shell">
      <aside className="ad-sidebar">
        <Link className="ad-brand" href="/">
          <span className="rings">
            <i />
            <i />
          </span>
          <b>events &amp; media</b>
        </Link>
        <div className="ad-sidebar-tag">Admin</div>
        <nav className="ad-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={isOn(n.href) ? "on" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ad-nav-h">Content</div>
        <nav className="ad-nav">
          {CONTENT_NAV.map((n) => (
            <Link key={n.href} href={n.href} className={isOn(n.href) ? "on" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ad-sidebar-foot">
          <Link href="/dashboard">← Back to account</Link>
        </div>
      </aside>
      <main className="ad-main">{children}</main>
    </div>
  );
}
