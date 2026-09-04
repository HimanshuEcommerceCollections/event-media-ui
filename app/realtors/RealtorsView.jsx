"use client";

// For realtors — ported from
// public/assets/realtors-extracted/realtors.html.
// realtors.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// reveal IntersectionObserver threshold .14, nav "scrolled" at y > 30, and
// the listing estimator's sizes, add-ons and discount tiers.
//
// Link mapping follows the other ported pages: home → "/", the services menu
// → "/services/*", Events → the landing page anchor, and the rest to their
// own routes.
//
// Copy stays in this file. There is no content endpoint for this page — the
// backend serves the home, services, reviews and legal collections only.

import { useEffect, useRef, useState } from "react";
import "./realtors.css";

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

// The listing-photos card reuses the hero photograph, as the reference does.
const BUNDLE = [
  {
    img: "bundle-staging.jpg",
    h: "3D virtual tour",
    p: "Buyers walk every room before they visit.",
    icon: (
      <>
        <path d="M12 2l9 5v10l-9 5-9-5V7z" />
        <path d="M12 12l9-5M12 12v10M12 12L3 7" />
      </>
    ),
  },
  {
    img: "bundle-aerial.jpg",
    h: "Drone & aerials",
    p: "Show the lot, the block and the view from above.",
    icon: (
      <>
        <circle cx="5" cy="6" r="2.4" />
        <circle cx="19" cy="6" r="2.4" />
        <rect x="9" y="10" width="6" height="4.5" rx="1.3" />
        <path d="M6.6 7.6 9.6 11M17.4 7.6 14.4 11" />
      </>
    ),
  },
  {
    img: "hero-bg.jpg",
    h: "Listing photos",
    p: "Bright, MLS-ready stills delivered next day.",
    icon: (
      <>
        <rect x="2.5" y="6.5" width="14" height="11" rx="2.5" />
        <path d="M16.5 10l5-2.5v9l-5-2.5" />
        <circle cx="8.5" cy="12" r="2.3" />
      </>
    ),
  },
];

const VALUES = [
  {
    h: "Sell faster",
    p: "Listings with tours get more clicks and quicker offers.",
    icon: <path d="M13 3L4 14h6l-1 7 9-11h-6z" />,
  },
  {
    h: "MLS & portal-ready",
    p: "Formatted for MLS, Zillow and your socials.",
    icon: <path d="M4 12l5 5L20 6" />,
  },
  {
    h: "Next-day delivery",
    p: "Shot today, live tomorrow. Keep your pipeline moving.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  },
  {
    h: "One coordinator",
    p: "A single point of contact for every shoot.",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M16 6a3 3 0 0 1 0 6M15 20a6 6 0 0 1 6 0" />
      </>
    ),
  },
];

// cents, exactly as the reference's SIZE and ADD tables.
const SIZES = [
  { name: "Under 1,500 sqft", price: 19900 },
  { name: "1,500–3,000", price: 29900 },
  { name: "3,000–5,000", price: 44900 },
  { name: "5,000+ sqft", price: 64900 },
];

const ADDONS = [
  { name: "Drone aerials", price: 14900 },
  { name: "Floor plan", price: 7900 },
  { name: "Twilight photos", price: 9000 },
  { name: "Extra photos", price: 6000 },
];

// Highest matching tier wins, as in the reference's if/else ladder.
const DISCOUNTS = [
  { min: 20, rate: 0.2 },
  { min: 14, rate: 0.15 },
  { min: 8, rate: 0.1 },
];

// Whole dollars — the estimator deals in monthly plans, where cents are noise.
const money = (c) => `$${Math.round(c / 100).toLocaleString("en-US")}`;

const discountFor = (count) => DISCOUNTS.find((d) => count >= d.min)?.rate ?? 0;

const ASSET = (name) => `/assets/realtors/${name}`;

export default function RealtorsView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);

  const [dropOpen, setDropOpen] = useState(false);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [addonsOn, setAddonsOn] = useState(() => new Set());
  const [count, setCount] = useState(6);

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

  /* ---------- listing estimator ---------- */
  const toggleAddon = (i) =>
    setAddonsOn((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const perListing =
    SIZES[sizeIdx].price + [...addonsOn].reduce((sum, i) => sum + ADDONS[i].price, 0);
  const rate = discountFor(count);
  const net = perListing * count * (1 - rate);

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
            <a className="pn-item pn-cta" href="/build">
              Build my event
            </a>
          </div>
        </div>
      </nav>

      <header className="r-hero">
        <div className="bg" style={{ backgroundImage: `url('${ASSET("hero-bg.jpg")}')` }} />
        <div className="wrap">
          <span className="b2b">For realtors</span>
          <h1 className="rise">Listings that sell before the open house.</h1>
          <p className="rise">
            3D tours, drone aerials and MLS-ready photos — booked in one request, delivered next
            day, priced for volume.
          </p>
          <div className="r-cta rise">
            <a className="btn btn-primary" href="/build">
              Book a listing shoot →
            </a>
            <a className="btn btn-ghost" href="#estimator">
              See volume pricing
            </a>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">The listing bundle</p>
            <h2>Everything a listing needs, together</h2>
          </div>
          <div className="bundle rise">
            {BUNDLE.map((b) => (
              <div className="b" key={b.h}>
                <div className="im" style={{ backgroundImage: `url('${ASSET(b.img)}')` }} />
                <div className="bd">
                  <div className="ic">
                    <LineIcon>{b.icon}</LineIcon>
                  </div>
                  <h3>{b.h}</h3>
                  <p>{b.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--sunken)" }}>
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Why realtors switch</p>
            <h2>Built for your pipeline</h2>
          </div>
          <div className="vals">
            {VALUES.map((v) => (
              <div className="val rise" key={v.h}>
                <div className="ic">
                  <LineIcon>{v.icon}</LineIcon>
                </div>
                <h3>{v.h}</h3>
                <p>{v.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec est" id="estimator">
        <div className="sec-bg" style={{ backgroundImage: `url('${ASSET("bundle-staging.jpg")}')` }} />
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Listing estimator</p>
            <h2 style={{ color: "#fff" }}>Price your listings</h2>
          </div>
          <div className="est-card rise">
            <div className="est-l">
              <div className="rl">Property size</div>
              <div className="est-opts">
                {SIZES.map((s, i) => (
                  <button
                    type="button"
                    key={s.name}
                    className={`est-opt${sizeIdx === i ? " on" : ""}`}
                    onClick={() => setSizeIdx(i)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <div className="rl">Add-ons</div>
              <div className="chk">
                {ADDONS.map((a, i) => (
                  <div
                    className={`c${addonsOn.has(i) ? " on" : ""}`}
                    key={a.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleAddon(i)}
                    onKeyDown={(e) => {
                      if (e.key !== " " && e.key !== "Enter") return;
                      e.preventDefault();
                      toggleAddon(i);
                    }}
                  >
                    {a.name} <span style={{ opacity: 0.6 }}>+{money(a.price)}</span>
                  </div>
                ))}
              </div>
              <div className="rl">Listings per month</div>
              <div className="est-slider">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={count}
                  aria-label="Listings per month"
                  onChange={(e) => setCount(Number(e.target.value))}
                />
                <div className="v">
                  <span>{count}</span> per month · volume pricing at 8+
                </div>
              </div>
            </div>
            <div className="est-r">
              <div className="big">{money(net)}</div>
              <div className="sub">per month</div>
              <div className="disc">
                {rate ? `Volume discount: ${rate * 100}% off` : "Add 8+ for volume pricing"}
              </div>
              <div className="per">{money(perListing * (1 - rate))} per listing</div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="quote rise">
            <div className="st">★★★★★</div>
            <p>
              “Our listings sell faster with the 3D tours, and the volume pricing is a real win.”
            </p>
            <div className="who">Northside Realty · Raleigh</div>
          </div>
        </div>
      </section>

      <section className="cband">
        <div className="sec-bg" style={{ backgroundImage: `url('${ASSET("hero-bg.jpg")}')` }} />
        <div className="wrap">
          <h2>Your next listing, shot tomorrow.</h2>
          <p>Set a recurring plan and we’ll keep every listing camera-ready.</p>
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
              <a className="fl" href="/about">
                About
              </a>
              <a className="fl" href="/how-it-works">
                How it works
              </a>
              <a className="fl" href="/realtors">
                For realtors
              </a>
              <a className="fl" href="/#events">
                Events
              </a>
              <a className="fl" href="/reviews">
                Reviews
              </a>
            </div>
            <div>
              <h4>Get started</h4>
              <a className="fl" href="/build">
                Build my event
              </a>
              <a className="fl" href="/vendors">
                Become a vendor
              </a>
              <a className="fl" href="/faq">
                FAQ
              </a>
              <a className="fl" href="/contact">
                Contact
              </a>
              <a className="fl" href="/signin">
                Sign in
              </a>
            </div>
          </div>
          <div className="fine">
            <span>© 2026 Events &amp; Media · Demo build · noindex</span>
            <span>
              <a href="/legal/privacy" style={{ color: "var(--ond2)" }}>
                Privacy
              </a>{" "}
              ·{" "}
              <a href="/legal/terms" style={{ color: "var(--ond2)" }}>
                Terms
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
