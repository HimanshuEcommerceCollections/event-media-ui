"use client";

// Contact — ported from public/assets/contact-extracted/contact.html.
// contact.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// reveal IntersectionObserver threshold .14, nav "scrolled" at y > 30, and
// the same submit-time validation — name and message non-empty, email against
// /^[^@\s]+@[^@\s]+\.[^@\s]+$/ — painting `.bad` on the offending field.
//
// The form does not post anywhere, exactly as in the reference: it swaps
// itself for the confirmation panel and nothing leaves the browser. There is
// no contact endpoint on the backend (POST /api/v1/requests is the quote
// builder, which carries event line items rather than a message), so wiring
// this up needs a backend route first.
//
// Link mapping follows the other ported pages: home and "Build my event" →
// "/", the services menu → "/services/*", Events/About → the matching
// landing page anchors, Reviews → "/reviews".

import { useEffect, useRef, useState } from "react";
import "./contact.css";

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

const TOPICS = ["General question", "Get a quote", "Commercial / B2B", "Press"];

const DETAILS = [
  {
    b: "Email",
    v: "hello@eventsandmedia.demo",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),
  },
  {
    b: "Phone",
    v: "(919) 555-0142",
    icon: (
      <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z" />
    ),
  },
  {
    b: "Studio",
    v: "118 E Hargett St, Raleigh, NC",
    icon: (
      <>
        <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z" />
        <circle cx="12" cy="11" r="2.2" />
      </>
    ),
  },
  {
    b: "Hours",
    v: "Mon–Sat, 9am–6pm ET",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  },
];

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const ASSET = (name) => `/assets/contact/${name}`;

export default function ContactView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);

  const [dropOpen, setDropOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: TOPICS[0], message: "" });
  const [bad, setBad] = useState({ name: false, email: false, message: false });
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

  /* ---------- form ---------- */
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // Validation runs on submit only, as the reference does — typing does not
  // paint an error before anyone has tried to send anything.
  const onSubmit = (e) => {
    e.preventDefault();
    const next = {
      name: !form.name.trim(),
      email: !EMAIL.test(form.email),
      message: !form.message.trim(),
    };
    setBad(next);
    if (next.name || next.email || next.message) return;
    setSent(true);
  };

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

      <header className="k-hero">
        <div className="bg" style={{ backgroundImage: `url('${ASSET("hero-bg.jpg")}')` }} />
        <div className="wrap">
          <p className="eyebrow rise">Contact</p>
          <h1 className="rise">Let’s talk about your event.</h1>
          <p className="rise">
            Questions, quotes, or partnerships — drop us a line and a real person replies within a
            day.
          </p>
        </div>
      </header>

      <main className="k-main">
        <div className="wrap">
          <div className="k-grid">
            <div className="k-form rise">
              <div>
                {sent ? null : (
                  <>
                    <h2>Send a message</h2>
                    <p className="sub">Tell us a little about what you need.</p>
                    <form noValidate onSubmit={onSubmit}>
                      <div className="frow">
                        <div className={`field${bad.name ? " bad" : ""}`}>
                          <label htmlFor="k-name">Name</label>
                          <input
                            id="k-name"
                            type="text"
                            placeholder="Your name"
                            value={form.name}
                            onChange={set("name")}
                          />
                          <div className="err">Please enter your name.</div>
                        </div>
                        <div className={`field${bad.email ? " bad" : ""}`}>
                          <label htmlFor="k-email">Email</label>
                          <input
                            id="k-email"
                            type="email"
                            placeholder="you@email.com"
                            value={form.email}
                            onChange={set("email")}
                          />
                          <div className="err">Enter a valid email.</div>
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="k-topic">Topic</label>
                        <select id="k-topic" value={form.topic} onChange={set("topic")}>
                          {TOPICS.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className={`field${bad.message ? " bad" : ""}`}>
                        <label htmlFor="k-msg">Message</label>
                        <textarea
                          id="k-msg"
                          placeholder="How can we help?"
                          value={form.message}
                          onChange={set("message")}
                        />
                        <div className="err">Please add a message.</div>
                      </div>
                      <button className="k-send" type="submit">
                        Send message
                      </button>
                    </form>
                  </>
                )}
              </div>
              <div className={`k-ok${sent ? " on" : ""}`}>
                <div className="ck">✓</div>
                <h2>Message sent!</h2>
                <p style={{ color: "var(--tx2)", marginTop: "8px" }}>
                  Thanks — we’ll get back to you within one business day.
                </p>
              </div>
            </div>
            <div className="k-info">
              {DETAILS.map((d) => (
                <div className="k-card rise" key={d.b}>
                  <div className="ic">
                    <LineIcon>{d.icon}</LineIcon>
                  </div>
                  <div>
                    <b>{d.b}</b>
                    <span>{d.v}</span>
                  </div>
                </div>
              ))}
              <div
                className="k-card rise"
                style={{ background: "var(--accent-soft)", borderColor: "#d4e4b8" }}
              >
                <div className="ic">
                  <LineIcon>
                    <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
                  </LineIcon>
                </div>
                <div>
                  <b>Prefer to just build?</b>
                  <span>
                    Skip the form —{" "}
                    <a href="/" style={{ color: "var(--txacc)", fontWeight: 600 }}>
                      start a request
                    </a>
                    .
                  </span>
                </div>
              </div>
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
