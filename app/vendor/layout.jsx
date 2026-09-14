"use client";

// Route guard + shell for every /vendor page.
//
// The guard is one call: GET /vendors/me. It answers 401 without a session,
// 403 without a vendor profile, and the profile otherwise — so asking it is
// both "are you signed in?" and "are you a vendor?", and a stale role in
// localStorage can never get anyone through it. That is also why 403 is a
// screen rather than a redirect: the likeliest person to hit it is an
// applicant who has not been approved yet, and bouncing them to the home page
// would answer none of their questions.
//
// The profile it fetches is handed to the children through context so the
// overview and the sidebar do not each re-request it; a child that changes it
// (the profile form) pushes the new one back up.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, getMyVendor } from "../../lib/api";
import { signOut } from "../../lib/auth";
import { clearSession, loadSession } from "../../lib/session";
import "./vendor.css";

const NAV = [
  { href: "/vendor", label: "Overview" },
  { href: "/vendor/jobs", label: "Jobs" },
  { href: "/vendor/profile", label: "Profile" },
];

const VendorContext = createContext(null);

/** The signed-in vendor's profile and work summary, plus a way to refresh it. */
export function useVendor() {
  const ctx = useContext(VendorContext);
  if (ctx === null) throw new Error("useVendor must be used inside the /vendor layout");
  return ctx;
}

export default function VendorLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  // "checking" | "ok" | "not-a-vendor" | "error"
  const [status, setStatus] = useState("checking");
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [leaving, setLeaving] = useState(false);

  const load = useCallback(
    (signal) => {
      const session = loadSession();
      if (!session?.accessToken) {
        router.replace("/signin?next=/vendor");
        return;
      }
      getMyVendor(session.accessToken)
        .then((payload) => {
          if (signal?.cancelled) return;
          setData(payload);
          setStatus("ok");
        })
        .catch((err) => {
          if (signal?.cancelled) return;
          if (err instanceof ApiError && err.status === 401) {
            clearSession();
            router.replace("/signin?next=/vendor");
            return;
          }
          if (err instanceof ApiError && err.status === 403) {
            setMessage(err.message);
            setStatus("not-a-vendor");
            return;
          }
          setMessage(err?.message || "Could not load your vendor account.");
          setStatus("error");
        });
    },
    [router],
  );

  useEffect(() => {
    const signal = { cancelled: false };
    load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  const handleSignOut = async (e) => {
    e.preventDefault();
    if (leaving) return;
    setLeaving(true);
    await signOut();
    window.location.assign("/");
  };

  if (status === "checking") {
    return (
      <div className="vd-gate">
        <div className="vd-gate-card">
          <p className="waiting">Checking your vendor account…</p>
        </div>
      </div>
    );
  }

  if (status === "not-a-vendor") {
    return (
      <div className="vd-gate">
        <div className="vd-gate-card">
          <h1>No vendor account yet</h1>
          <p>
            {message} If you have applied, your dashboard opens as soon as a coordinator approves
            the application — we email you a link to set a password when that happens.
          </p>
          <Link className="cta" href="/vendors#apply">
            Apply to join →
          </Link>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="vd-gate">
        <div className="vd-gate-card">
          <h1>We could not load your account</h1>
          <p>{message}</p>
          <Link className="cta" href="/vendor">
            Try again
          </Link>
        </div>
      </div>
    );
  }

  const vendor = data?.vendor ?? {};
  const openOffers = data?.work?.openOffers ?? 0;
  const isOn = (href) => (href === "/vendor" ? pathname === href : pathname?.startsWith(href));

  return (
    <VendorContext.Provider value={{ ...data, refresh: () => load(), setData }}>
      <div className="vd-shell">
        <aside className="vd-sidebar">
          <Link className="vd-brand" href="/">
            <span className="rings">
              <i />
              <i />
            </span>
            <b>events &amp; media</b>
          </Link>
          <div className="vd-sidebar-tag">Vendor</div>
          <div className="vd-biz">
            <b>{vendor.businessName || "Your business"}</b>
            {vendor.contactName || ""}
          </div>
          <nav className="vd-nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={isOn(n.href) ? "on" : undefined}>
                {n.label}
                {n.href === "/vendor/jobs" && openOffers > 0 ? (
                  <span className="pip">{openOffers}</span>
                ) : null}
              </Link>
            ))}
          </nav>
          <div className="vd-sidebar-foot">
            <Link href="/dashboard">← Back to account</Link>
            <button type="button" onClick={handleSignOut}>
              {leaving ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </aside>
        <main className="vd-main">{children}</main>
      </div>
    </VendorContext.Provider>
  );
}
