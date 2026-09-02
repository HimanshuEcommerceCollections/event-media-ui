"use client";

// Commercial (B2B) — ported from
// public/assets/commercial-extracted/commercial.html.
// commercial.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// reveal IntersectionObserver threshold .14, nav "scrolled" at y > 30, and
// the volume estimator's package prices and discount tiers.
//
// Link mapping follows the other ported pages: home and "Build my event" →
// "/", the services menu → "/services/*", Events/About → the matching
// landing page anchors, Reviews → "/reviews", "Talk to us" → "/contact".
//
// Unlike the service pages, this page's copy stays in the file. There is no
// GET /api/v1/content/commercial to read it from — the backend serves the
// home, services, reviews and legal collections only — so the catalogue-style
// arrays below are authored here until an endpoint exists.

import { useEffect, useRef, useState } from "react";
import "./commercial.css";

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

const AUDIENCES = [
  {
    h: "Realtors",
    p: "Faster listings that sell before the open house.",
    icon: (
      <>
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
      </>
    ),
  },
  {
    h: "Builders",
    p: "Show model homes and progress from the sky.",
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="1" />
        <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
      </>
    ),
  },
  {
    h: "Brands",
    p: "Launch films and social cutdowns that pop.",
    icon: (
      <>
        <path d="M3 17l6-6 4 4 7-7" />
        <path d="M17 8h4v4" />
      </>
    ),
  },
  {
    h: "Hospitality",
    p: "Venues & restaurants, shown at their best.",
    icon: (
      <>
        <path d="M8 3h8l-1 6a3 3 0 0 1-6 0z" />
        <line x1="12" y1="15" x2="12" y2="21" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </>
    ),
  },
];

// The virtual tours card reuses the hero photograph, as the reference does.
const BUSINESS_SERVICES = [
  {
    href: "/services/virtual-tours",
    img: "hero-bg.jpg",
    h: "Virtual tours",
    p: "3D walkthroughs priced by square footage.",
  },
  {
    href: "/services/drone-video",
    img: "drone-video-card.jpg",
    h: "Drone & aerial",
    p: "4K aerials by insured, FAA-licensed pilots.",
  },
  {
    href: "/services/photo-video",
    img: "photo-video-card.jpg",
    h: "Commercial photo + video",
    p: "Product, brand and property media, edited fast.",
  },
];

// cents, exactly as the reference's PKG table.
const PACKAGES = [
  { name: "Home tour", price: 29900 },
  { name: "Estate tour", price: 64900 },
  { name: "Aerial package", price: 45000 },
  { name: "Brand film", price: 210000 },
];

// Highest matching tier wins, as in the reference's if/else ladder.
const DISCOUNTS = [
  { min: 30, rate: 0.2 },
  { min: 20, rate: 0.15 },
  { min: 10, rate: 0.1 },
];

const STATS = [
  { b: "48h", s: "Avg turnaround" },
  { b: "140", s: "Vetted pros" },
  { b: "15%", s: "Volume discount" },
  { b: "4.9", s: "Client rating" },
];

const CLIENTS = [
  "Northside Realty",
  "Harbor Group",
  "Cardinal Co",
  "BuildRDU",
  "Skyline Brands",
  "Oak City Homes",
];

// Whole dollars — the estimator deals in monthly plans, where cents are noise.
const money = (c) => `$${Math.round(c / 100).toLocaleString("en-US")}`;

const discountFor = (count) => DISCOUNTS.find((d) => count >= d.min)?.rate ?? 0;

const ASSET = (name) => `/assets/commercial/${name}`;

export default function CommercialView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);

  const [dropOpen, setDropOpen] = useState(false);
  const [pkgIdx, setPkgIdx] = useState(0);
  const [count, setCount] = useState(8);

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

  /* ---------- volume estimator ---------- */
  const rate = discountFor(count);
  const net = PACKAGES[pkgIdx].price * count * (1 - rate);

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

      <header className="c-hero">
        <div className="bg" style={{ backgroundImage: `url('${ASSET("hero-bg.jpg")}')` }} />
        <div className="wrap">
          <span className="b2b">B2B · Commercial</span>
          <h1 className="rise">Media that moves properties and brands.</h1>
          <p className="rise">
            Virtual tours, aerial video and commercial media for Raleigh’s realtors, builders and
            brands — on volume pricing, with one point of contact.
          </p>
          <div className="c-cta rise">
            <a className="btn btn-primary" href="/">
              Get a quote →
            </a>
            <a className="btn btn-ghost" href="#estimator">
              Estimate volume pricing
            </a>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Who it’s for</p>
            <h2>Built for businesses that show, not tell</h2>
          </div>
          <div className="who">
            {AUDIENCES.map((a) => (
              <div className="w rise" key={a.h}>
                <div className="ic">
                  <LineIcon>{a.icon}</LineIcon>
                </div>
                <h3>{a.h}</h3>
                <p>{a.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--sunken)" }}>
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Business services</p>
            <h2>Three ways we make you look good</h2>
          </div>
          <div className="bsvc rise">
            {BUSINESS_SERVICES.map((s) => (
              <a href={s.href} key={s.href}>
                <div className="bg" style={{ backgroundImage: `url('${ASSET(s.img)}')` }} />
                <div className="t">
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                  <span className="go">Explore →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="sec est" id="estimator">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Volume estimator</p>
            <h2 style={{ color: "#fff" }}>Price your monthly plan</h2>
          </div>
          <div className="est-card rise">
            <div className="est-l">
              <div className="rl">Service &amp; package</div>
              <div className="est-opts">
                {PACKAGES.map((p, i) => (
                  <button
                    type="button"
                    key={p.name}
                    className={`est-opt${pkgIdx === i ? " on" : ""}`}
                    onClick={() => setPkgIdx(i)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="rl">Listings / shoots per month</div>
              <div className="est-slider">
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={count}
                  aria-label="Listings or shoots per month"
                  onChange={(e) => setCount(Number(e.target.value))}
                />
                <div className="v">
                  <span>{count}</span> per month · discounts kick in at 10+
                </div>
              </div>
            </div>
            <div className="est-r">
              <div className="big">{money(net)}</div>
              <div className="sub">est. per month</div>
              <div className="disc">
                {rate ? `Volume discount: ${rate * 100}% off` : "Add 10+ for volume pricing"}
              </div>
              <div className="per">{money(net / count)} per listing</div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="stat-grid rise">
            {STATS.map((s) => (
              <div className="stat" key={s.s}>
                <b>{s.b}</b>
                <span>{s.s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--sunken)" }}>
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">In good company</p>
            <h2>Trusted across the Triangle</h2>
          </div>
          <div className="logos rise">
            {CLIENTS.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="cband">
        <div className="wrap">
          <h2>Let’s talk volume.</h2>
          <p>Tell us your cadence and we’ll build a plan that scales with you.</p>
          <a className="btn btn-primary" href="/contact">
            Talk to us →
          </a>
        </div>
      </section>

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
