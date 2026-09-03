"use client";

// Become a vendor — ported from
// public/assets/vendors-extracted/vendors.html.
// vendors.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// reveal IntersectionObserver threshold .14, nav "scrolled" at y > 30, the
// earnings estimator's craft rates and its .88 take-home multiplier, and the
// same submit-time validation — name non-empty, email against
// /^[^@\s]+@[^@\s]+\.[^@\s]+$/ — painting `.bad` on the offending field.
//
// The application form does not post anywhere, exactly as in the reference:
// it swaps itself for the confirmation panel and nothing leaves the browser.
// There is no vendor-application endpoint on the backend, so wiring it up
// needs a backend route first.
//
// Link mapping follows the other ported pages: home → "/", the services menu
// → "/services/*", Events → the landing page anchor, and the rest to their
// own routes.

import { useEffect, useRef, useState } from "react";
import "./vendors.css";

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

const BENEFITS = [
  {
    h: "Steady local leads",
    p: "Matched requests from real clients in your area — no cold outreach.",
    icon: (
      <>
        <path d="M3 12V4h8l9 9-8 8z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </>
    ),
  },
  {
    h: "You set your prices",
    p: "Keep control of your rates and your calendar.",
    icon: (
      <>
        <line x1="12" y1="3" x2="12" y2="21" />
        <path d="M16 7.5C16 6.1 14.2 5 12 5S8 6 8 7.5 9.8 10 12 10s4 1 4 2.5S14.2 15 12 15s-4-1.1-4-2.5" />
      </>
    ),
  },
  {
    h: "We handle the busywork",
    p: "Scheduling, reminders and payments, sorted.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </>
    ),
  },
  {
    h: "Keep your brand",
    p: "Reviews and repeat clients build your reputation, not ours.",
    icon: <path d="M12 3l2.6 6.3L21 10l-5 4.2L17.5 21 12 17.3 6.5 21 8 14.2 3 10l6.4-.7z" />,
  },
];

const STEPS = [
  { n: "1", h: "Apply in minutes", p: "Tell us your craft, your area and your rates." },
  { n: "2", h: "Get verified", p: "We check references and insurance — quality matters." },
  { n: "3", h: "Start getting matched", p: "Accept the requests that fit. Get paid on time." },
];

// cents per booking, exactly as the reference's CRAFT table.
const CRAFTS = [
  { name: "DJ", rate: 90000 },
  { name: "Photo/Video", rate: 140000 },
  { name: "Entertainer", rate: 70000 },
  { name: "Rentals", rate: 110000 },
  { name: "Drone", rate: 45000 },
];

// What a pro keeps after the platform fee the note mentions.
const TAKE_HOME = 0.88;

const CATEGORIES = [
  "DJ + music",
  "Photo + video",
  "Entertainer",
  "Party rentals",
  "Drone pilot",
  "Virtual tours",
  "Other",
];

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Whole dollars — the estimator deals in monthly earnings, where cents are
// noise.
const money = (c) => `$${Math.round(c / 100).toLocaleString("en-US")}`;

const ASSET = (name) => `/assets/vendors/${name}`;

export default function VendorsView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);

  const [dropOpen, setDropOpen] = useState(false);
  const [craftIdx, setCraftIdx] = useState(0);
  const [jobs, setJobs] = useState(6);
  const [form, setForm] = useState({
    name: "",
    business: "",
    email: "",
    category: CATEGORIES[0],
    about: "",
  });
  const [bad, setBad] = useState({ name: false, email: false });
  const [sent, setSent] = useState(false);

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

  /* ---------- application form ---------- */
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const next = { name: !form.name.trim(), email: !EMAIL.test(form.email) };
    setBad(next);
    if (next.name || next.email) return;
    setSent(true);
  };

  const monthly = CRAFTS[craftIdx].rate * jobs * TAKE_HOME;

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

      <header className="v-hero">
        <div className="bg" style={{ backgroundImage: `url('${ASSET("hero-bg.jpg")}')` }} />
        <div className="wrap">
          <h1 className="rise">Do what you love. We’ll bring the bookings.</h1>
          <p className="rise">
            Join Raleigh’s vetted network of event pros — steady local leads, your prices, your
            brand. We handle the rest.
          </p>
          <div className="v-cta rise">
            <a className="btn btn-primary" href="#apply">
              Apply to join →
            </a>
            <a className="btn btn-ghost" href="#how">
              How it works
            </a>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Why pros join</p>
            <h2>Booked, not buried in admin</h2>
          </div>
          <div className="ben">
            {BENEFITS.map((b) => (
              <div className="b rise" key={b.h}>
                <div className="ic">
                  <LineIcon>{b.icon}</LineIcon>
                </div>
                <h3>{b.h}</h3>
                <p>{b.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="how" style={{ background: "var(--sunken)" }}>
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Getting started</p>
            <h2>Three steps to your first booking</h2>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step rise" key={s.n}>
                <div className="n">{s.n}</div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec est">
        <div className="sec-bg" style={{ backgroundImage: `url('${ASSET("est-bg.jpg")}')` }} />
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Earnings estimator</p>
            <h2 style={{ color: "#fff" }}>See your monthly potential</h2>
          </div>
          <div className="est-card rise">
            <div className="est-l">
              <div className="rl">Your craft</div>
              <div className="est-opts">
                {CRAFTS.map((c, i) => (
                  <button
                    type="button"
                    key={c.name}
                    className={`est-opt${craftIdx === i ? " on" : ""}`}
                    onClick={() => setCraftIdx(i)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <div className="rl">Jobs per month</div>
              <div className="est-slider">
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={jobs}
                  aria-label="Bookings per month"
                  onChange={(e) => setJobs(Number(e.target.value))}
                />
                <div className="v">
                  <span>{jobs}</span> bookings / month
                </div>
              </div>
            </div>
            <div className="est-r">
              <div className="big">{money(monthly)}</div>
              <div className="sub">est. monthly</div>
              <div className="note">You keep your rate — a small platform fee applies.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="apply">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Apply</p>
            <h2>Join the network</h2>
          </div>
          {sent ? null : (
            <div className="vform rise">
              <form noValidate onSubmit={onSubmit}>
                <div className="frow">
                  <div className={`field${bad.name ? " bad" : ""}`}>
                    <label htmlFor="v-name">Your name</label>
                    <input
                      id="v-name"
                      type="text"
                      placeholder="Name"
                      value={form.name}
                      onChange={set("name")}
                    />
                    <div className="err">Please enter your name.</div>
                  </div>
                  <div className="field">
                    <label htmlFor="v-biz">Business name</label>
                    <input
                      id="v-biz"
                      type="text"
                      placeholder="Optional"
                      value={form.business}
                      onChange={set("business")}
                    />
                  </div>
                </div>
                <div className="frow">
                  <div className={`field${bad.email ? " bad" : ""}`}>
                    <label htmlFor="v-email">Email</label>
                    <input
                      id="v-email"
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={set("email")}
                    />
                    <div className="err">Enter a valid email.</div>
                  </div>
                  <div className="field">
                    <label htmlFor="v-cat">Category</label>
                    <select id="v-cat" value={form.category} onChange={set("category")}>
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="v-about">Tell us about your work</label>
                  <textarea
                    id="v-about"
                    placeholder="Years of experience, service area, a link to your work..."
                    value={form.about}
                    onChange={set("about")}
                  />
                </div>
                <button className="v-send" type="submit">
                  Submit application
                </button>
              </form>
            </div>
          )}
          <div className={`vform v-ok${sent ? " on" : ""}`}>
            <div className="ck">
              <LineIcon>
                <path d="M4 12l5 5L20 6" />
              </LineIcon>
            </div>
            <h2>Application received!</h2>
            <p style={{ color: "var(--tx2)", marginTop: "8px" }}>
              Thanks for applying — our team reviews new pros within 3 business days.
            </p>
          </div>
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
