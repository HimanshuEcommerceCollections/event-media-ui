"use client";

// FAQ — ported from public/assets/no-asset-pages/faq.html.
// faq.css is that document's <style> block copied verbatim. The reference's
// vanilla JS is reimplemented below with the same behaviour: nav "scrolled"
// at y > 30, the accordion measuring its own scrollHeight, and the search and
// category filters, which combine — a search term narrows within the selected
// category rather than replacing it.
//
// The reference gives each question a `data-q` attribute holding its question
// and answer lower-cased, and searches that. Here the same string is derived
// from the copy being rendered, so the two cannot drift apart.
//
// The reference also runs a reveal observer over `.rise`, but its markup
// carries the class nowhere, so nothing on this page animates in. That is
// kept: no reveals are added that the reference does not have.
//
// Link mapping follows the other ported pages: home → "/", the services menu
// → "/services/*", Events → the landing page anchor, and the rest to their
// own routes.

import { useEffect, useMemo, useRef, useState } from "react";
import "./faq.css";

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

const SERVICE_LINKS = [
  { href: "/services/party-rentals", label: "Party rentals" },
  { href: "/services/entertainers", label: "Entertainers" },
  { href: "/services/dj-music", label: "DJ + music" },
  { href: "/services/photo-video", label: "Photo + video" },
  { href: "/services/virtual-tours", label: "Virtual tours" },
  { href: "/services/drone-video", label: "Drone video" },
];

const CATEGORIES = [
  { c: "all", label: "All" },
  { c: "booking", label: "Booking" },
  { c: "pricing", label: "Pricing" },
  { c: "pros", label: "Pros" },
  { c: "commercial", label: "Commercial" },
  { c: "account", label: "Account" },
];

const CAT_LABEL = {
  booking: "Booking",
  pricing: "Pricing",
  pros: "Pros",
  commercial: "Commercial",
  account: "Account",
};

const FAQS = [
  {
    cat: "booking",
    q: "How do I book?",
    a: "Build your event in the builder, pick services and add-ons, and send one request. We match you with vetted pros and confirm your quote.",
  },
  {
    cat: "booking",
    q: "How far in advance should I book?",
    a: "Two to four weeks is ideal for most events, but we regularly turn around smaller requests in days. Commercial shoots can often be next-day.",
  },
  {
    cat: "booking",
    q: "Can I change my request after sending?",
    a: "Absolutely. Nothing is locked until you approve the final quote, and your coordinator can adjust services anytime before then.",
  },
  {
    cat: "pricing",
    q: "Are the prices I see final?",
    a: "Prices shown are clear sample estimates. You always receive a firm, itemized quote to approve before anything is booked.",
  },
  {
    cat: "pricing",
    q: "Do I pay a deposit up front?",
    a: "No payment is taken to send a request. Deposit terms, if any, are shown on your quote before you confirm.",
  },
  {
    cat: "pricing",
    q: "Are there hidden fees?",
    a: "No. Delivery, setup and coordination are built into the quote. What you approve is what you pay.",
  },
  {
    cat: "pros",
    q: "Are your pros vetted?",
    a: "Every pro is background-checked, reviewed and insured. We only list people we’d book for our own families.",
  },
  {
    cat: "pros",
    q: "Can I choose my specific pro?",
    a: "Often yes — note a preference in your request and we’ll match it when the pro is available.",
  },
  {
    cat: "pros",
    q: "What happens if a pro cancels?",
    a: "We keep a backup network on standby and re-match you fast, at no extra cost, so your event stays on track.",
  },
  {
    cat: "commercial",
    q: "Do you work with realtors and businesses?",
    a: "Yes — virtual tours, drone and commercial media with volume pricing. See the Commercial and For-realtors pages.",
  },
  {
    cat: "account",
    q: "Do I need an account to request?",
    a: "You can build and send a request without one, but an account lets you track requests and save favourite pros.",
  },
  {
    cat: "account",
    q: "How do I reset my password?",
    a: "Use ‘Forgot password’ on the sign-in page and we’ll email you a reset link.",
  },
];

// The reference's data-q: question and answer, lower-cased, searched as one
// string.
const HAYSTACK = FAQS.map((f) => `${f.q} ${f.a}`.toLowerCase());

export default function FaqView() {
  const navRef = useRef(null);
  const answerRefs = useRef([]);

  const [dropOpen, setDropOpen] = useState(false);
  const [cat, setCat] = useState("all");
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(() => new Set());

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

  /* ---------- accordion ---------- */
  const toggle = (i) => {
    const opening = !open.has(i);
    const a = answerRefs.current[i];
    if (a) a.style.maxHeight = opening ? `${a.scrollHeight}px` : "0";
    setOpen((prev) => {
      const next = new Set(prev);
      if (opening) next.add(i);
      else next.delete(i);
      return next;
    });
  };

  /* ---------- search + category ---------- */
  const needle = term.toLowerCase().trim();
  const visible = useMemo(
    () =>
      FAQS.map(
        (f, i) => (cat === "all" || f.cat === cat) && (!needle || HAYSTACK[i].includes(needle)),
      ),
    [cat, needle],
  );
  const shown = visible.filter(Boolean).length;

  return (
    <div>
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

      <header className="f-head">
        <div className="wrap">
          <p className="eyebrow">FAQ</p>
          <h1>Questions? We’ve got answers.</h1>
          <p>Everything about booking, pricing, pros and more.</p>
        </div>
      </header>

      <main className="f-main">
        <div className="wrap">
          <div className="f-tools">
            <input
              className="f-search"
              type="text"
              placeholder="Search questions..."
              aria-label="Search questions"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <div className="f-cats">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.c}
                  className={cat === c.c ? "on" : ""}
                  onClick={() => setCat(c.c)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="f-list">
            {FAQS.map((f, i) => (
              <div
                className={`f-item${open.has(i) ? " open" : ""}`}
                key={f.q}
                style={visible[i] ? undefined : { display: "none" }}
              >
                <button
                  className="f-q"
                  type="button"
                  aria-expanded={open.has(i)}
                  onClick={() => toggle(i)}
                >
                  {f.q}
                  <span className="f-cat">{CAT_LABEL[f.cat]}</span>
                  <span className="ic">{open.has(i) ? "−" : "+"}</span>
                </button>
                <div
                  className="f-a"
                  ref={(el) => {
                    answerRefs.current[i] = el;
                  }}
                >
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="f-empty" style={shown ? { display: "none" } : { display: "block" }}>
            No questions match — try another search.
          </div>

          <p className="f-cta">
            Still stuck? <a href="/contact">Contact us</a> and a real person will help.
          </p>
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
