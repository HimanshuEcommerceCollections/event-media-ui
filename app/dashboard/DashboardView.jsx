"use client";

// Dashboard — ported from public/assets/dashboard-extracted/dashboard.html.
// dashboard.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// reveal IntersectionObserver threshold .14, nav "scrolled" at y > 30, the
// one-second countdown to the next event, and the request tabs.
//
// The account, requests and saved pros are the reference's synthetic data,
// authored here. The backend already exposes GET /api/v1/auth/me,
// /api/v1/requests/mine and /api/v1/perks/me, so this page is the natural
// place to read them — but that turns it into an authenticated route with a
// redirect and a loading state, which is a larger change than porting the
// design. Kept static until that is asked for.
//
// The countdown target is the reference's fixed date. Once it passes, the
// clamp holds every readout at zero rather than counting up.
//
// Link mapping follows the other ported pages: home and "Build my event" →
// "/", the services menu → "/services/*", Events/About → the matching
// landing page anchors, Reviews → "/reviews", Sign out → "/signin".

import { useEffect, useRef, useState } from "react";
import "./dashboard.css";

const Logo = () => (
  <>
    <span className="rings">
      <i />
      <i />
    </span>
    <b>events &amp; media</b>
  </>
);

const Caret = () => (
  <svg
    className="caret"
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// The reference sets these attributes inline on every icon in the page.
const LineIcon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    style={{ width: "1em", height: "1em", verticalAlign: "-.12em" }}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const SERVICE_LINKS = [
  { href: "/services/party-rentals", label: "Party rentals" },
  { href: "/services/entertainers", label: "Entertainers" },
  { href: "/services/dj-music", label: "DJ + music" },
  { href: "/services/photo-video", label: "Photo + video" },
  { href: "/services/virtual-tours", label: "Virtual tours" },
  { href: "/services/drone-video", label: "Drone video" },
];

const ACCOUNT = {
  initial: "M",
  name: "Maya",
  sub: "2 events in motion · 1 awaiting your pick",
};

const NEXT_EVENT = {
  title: "Rooftop 30th Birthday",
  meta: "Sat, Sep 5 · 7:00 PM · Downtown Raleigh",
  at: "2026-09-05T19:00:00",
};

const ACTIONS = [
  {
    b: "Build new event",
    s: "Start a fresh request",
    icon: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
  },
  {
    b: "Messages",
    s: "2 unread from pros",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),
  },
  {
    b: "Saved pros",
    s: "4 favourites",
    icon: <path d="M12 3l2.6 6.3L21 10l-5 4.2L17.5 21 12 17.3 6.5 21 8 14.2 3 10l6.4-.7z" />,
  },
];

const TABS = [
  { f: "all", label: "All" },
  { f: "matching", label: "Matching" },
  { f: "confirmed", label: "Confirmed" },
  { f: "completed", label: "Completed" },
];

const STATUS_LABEL = {
  confirmed: "Confirmed",
  matching: "Matching pros",
  completed: "Completed",
};

const REQUESTS = [
  {
    title: "Rooftop 30th Birthday",
    status: "confirmed",
    services: ["DJ", "Party rentals", "Photo"],
    when: "Sep 5",
    amount: "$1,240",
  },
  {
    title: "Product Launch Mixer",
    status: "matching",
    services: ["Photo + video", "Drone"],
    when: "Sep 18",
    amount: "$2,350",
  },
  {
    title: "Backyard Anniversary",
    status: "completed",
    services: ["Party rentals", "Entertainers"],
    when: "Jul 12",
    amount: "$680",
  },
  {
    title: "The Hartwell Wedding",
    status: "confirmed",
    services: ["Photo + video", "DJ", "Drone"],
    when: "Oct 24",
    amount: "$3,900",
  },
  {
    title: "New Listing — Oakwood",
    status: "matching",
    services: ["Virtual tours"],
    when: "ongoing",
    amount: "$449",
  },
  {
    title: "Kids Carnival Fair",
    status: "completed",
    services: ["Entertainers", "Party rentals"],
    when: "Aug 29",
    amount: "$520",
  },
];

const PROS = [
  { ini: "JR", name: "Jordan R.", craft: "DJ", av: "#639922" },
  { ini: "KC", name: "Kim & Co", craft: "Photo", av: "#e0b341" },
  { ini: "MV", name: "Marco V.", craft: "Drone", av: "#6fb0d6" },
  { ini: "LS", name: "Lila S.", craft: "Rentals", av: "#e79ab5" },
];

const ASSET = (name) => `/assets/dashboard/${name}`;

const pad = (n) => (n < 10 ? `0${n}` : String(n));

const ZERO = { d: "00", h: "00", m: "00" };

export default function DashboardView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);

  const [dropOpen, setDropOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  // Server-rendered as zeros, exactly like the reference's markup, so the
  // first paint cannot disagree with what the clock reads on hydration.
  const [left, setLeft] = useState(ZERO);

  /* ---------- scroll reveals ---------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.14 },
    );
    root.querySelectorAll(".rise").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---------- nav background on scroll ---------- */
  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) navRef.current.classList.toggle("scrolled", window.scrollY > 30);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- services dropdown ---------- */
  useEffect(() => {
    if (!dropOpen) return undefined;
    const onDoc = () => setDropOpen(false);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [dropOpen]);

  /* ---------- countdown to the next event ---------- */
  useEffect(() => {
    const target = new Date(NEXT_EVENT.at).getTime();
    const tick = () => {
      const ms = Math.max(0, target - Date.now());
      setLeft({
        d: pad(Math.floor(ms / 864e5)),
        h: pad(Math.floor((ms % 864e5) / 36e5)),
        m: pad(Math.floor((ms % 36e5) / 6e4)),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div ref={rootRef}>
      <div className="demo">
        Demo build · <b>synthetic data</b> · noindex
      </div>

      <nav className="nav" ref={navRef}>
        <div className="wrap">
          <a className="logo" href="/">
            <Logo />
          </a>
          <div className="pill-nav">
            <a className="pn-item" href="/">
              Home
            </a>
            <div className={`pn-drop${dropOpen ? " open" : ""}`}>
              <a
                className="pn-item"
                href="#"
                role="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropOpen((o) => !o);
                }}
              >
                Services <Caret />
              </a>
              <div className="pn-menu">
                <span className="pn-menu-caret" aria-hidden="true" />
                {SERVICE_LINKS.map((l) => (
                  <a key={l.href} href={l.href}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            <a className="pn-item" href="/#events">
              Events
            </a>
            <a className="pn-item" href="/reviews">
              Reviews
            </a>
            <a className="pn-item" href="/signin">
              Sign in
            </a>
            <a className="pn-item pn-cta" href="/">
              Build my event
            </a>
          </div>
        </div>
      </nav>

      <header className="d-hero">
        <div className="wrap">
          <div className="d-top">
            <div className="d-av">{ACCOUNT.initial}</div>
            <div>
              <h1>Welcome back, {ACCOUNT.name}</h1>
              <div className="sub">{ACCOUNT.sub}</div>
            </div>
            <div className="d-out">
              Signed in · <a href="/signin">Sign out</a>
            </div>
          </div>
        </div>
      </header>

      <main className="d-main">
        <div className="wrap">
          <div className="d-up">
            <div
              className="bg"
              style={{ backgroundImage: `url('${ASSET("upcoming-event-bg.jpg")}')` }}
            />
            <div className="tag">● Next up</div>
            <h2>{NEXT_EVENT.title}</h2>
            <div className="meta">{NEXT_EVENT.meta}</div>
            <div className="d-cd">
              <div className="b">
                <b>{left.d}</b>
                <span>days</span>
              </div>
              <div className="b">
                <b>{left.h}</b>
                <span>hrs</span>
              </div>
              <div className="b">
                <b>{left.m}</b>
                <span>min</span>
              </div>
            </div>
          </div>

          <div className="d-actions">
            {ACTIONS.map((a) => (
              <div className="d-act rise" key={a.b}>
                <div className="ic">
                  <LineIcon>{a.icon}</LineIcon>
                </div>
                <div>
                  <b>{a.b}</b>
                  <span>{a.s}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="d-sec-h">
            <h2>Your requests</h2>
            <div className="d-tabs">
              {TABS.map((t) => (
                <button
                  type="button"
                  key={t.f}
                  className={filter === t.f ? "on" : undefined}
                  onClick={() => setFilter(t.f)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered cards are hidden rather than unmounted, as in the
              reference: a card that comes back has already been revealed and
              keeps its `.in` class. */}
          <div className="req-grid">
            {REQUESTS.map((r) => (
              <div
                className="req rise"
                key={r.title}
                style={
                  filter === "all" || r.status === filter ? undefined : { display: "none" }
                }
              >
                <div className="r1">
                  <h3>{r.title}</h3>
                  <span className={`status ${r.status}`}>{STATUS_LABEL[r.status]}</span>
                </div>
                <div className="svcs">
                  {r.services.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <div className="r2">
                  <span>{r.when}</span>
                  <span className="amt">{r.amount}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="d-pros">
            <div className="d-sec-h">
              <h2>Saved pros</h2>
            </div>
            <div className="pros-row">
              {PROS.map((p) => (
                <div className="pro" key={p.ini}>
                  <div className="av" style={{ background: p.av }}>
                    {p.ini}
                  </div>
                  <b>{p.name}</b>
                  <span>{p.craft}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="cols">
            <div>
              <div className="logo">
                <Logo />
              </div>
              <p className="desc">
                One request. Whole event covered. A Raleigh marketplace for celebrations and
                commercial media.
              </p>
            </div>
            <div>
              <h4>Services</h4>
              {SERVICE_LINKS.map((l) => (
                <a className="fl" href={l.href} key={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
            <div>
              <h4>Company</h4>
              <a className="fl" href="/#about">
                About
              </a>
              <a className="fl" href="/#events">
                Events
              </a>
              <a className="fl" href="/reviews">
                Reviews
              </a>
              <a className="fl" href="/commercial">
                Commercial
              </a>
              <a className="fl" href="/contact">
                Contact
              </a>
            </div>
            <div>
              <h4>Get started</h4>
              <a className="fl" href="/">
                Build my event
              </a>
              <a className="fl" href="/signin">
                Sign in
              </a>
              <a className="fl" href="/legal/privacy">
                Privacy
              </a>
              <a className="fl" href="/legal/terms">
                Terms
              </a>
            </div>
          </div>
          <div className="fine">
            <span>© 2026 Events &amp; Media · Demo build · noindex</span>
            <span>Synthetic data only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
