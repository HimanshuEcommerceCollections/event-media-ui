"use client";

// Reviews — ported from public/assets/reviews-extracted/reviews.html.
// reviews.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// reveal IntersectionObserver threshold .14, nav "scrolled" at y > 30,
// the rating bars + count-ups firing once at threshold .3 on the rate card
// (1300ms, 1-(1-p)³ easing).
//
// Link mapping follows the other ported pages: the reference's relative
// document links become app routes — home and "Build my event" → "/", the
// services menu → "/services/*", Events/About → the matching landing page
// anchors.

import { useCallback, useEffect, useRef, useState } from "react";
import "./reviews.css";

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

const ASSET = (name) => `/assets/reviews/${name}`;

const SERVICE_LINKS = [
  { href: "/services/party-rentals", label: "Party rentals" },
  { href: "/services/entertainers", label: "Entertainers" },
  { href: "/services/dj-music", label: "DJ + music" },
  { href: "/services/photo-video", label: "Photo + video" },
  { href: "/services/virtual-tours", label: "Virtual tours" },
  { href: "/services/drone-video", label: "Drone video" },
];

// 5★ down to 1★, as the reference's data-w attributes.
const BARS = [
  { lab: "5★", w: 92 },
  { lab: "4★", w: 6 },
  { lab: "3★", w: 1 },
  { lab: "2★", w: 1 },
  { lab: "1★", w: 0 },
];

// data-to / data-dec / data-suf from the reference's .cu elements.
const STATS = [
  { to: 320, dec: 0, suf: "", label: "Events covered" },
  { to: 4.9, dec: 1, suf: "", label: "Average rating" },
  { to: 96, dec: 0, suf: "%", label: "Five-star" },
  { to: 38, dec: 0, suf: "%", label: "Repeat clients" },
];

export default function ReviewsView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const rateCardRef = useRef(null);
  const statRefs = useRef([]);
  const countedRef = useRef(false);

  const [dropOpen, setDropOpen] = useState(false);
  const [barsOn, setBarsOn] = useState(false);

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
    const apply = () => {
      if (navRef.current) navRef.current.classList.toggle("scrolled", window.scrollY > 30);
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    return () => window.removeEventListener("scroll", apply);
  }, []);

  /* ---------- services dropdown ---------- */
  useEffect(() => {
    if (!dropOpen) return undefined;
    const onDoc = () => setDropOpen(false);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [dropOpen]);

  /* ---------- bars + stat count-up, once, when the rate card shows ---------- */
  // The readouts are repainted every frame, so they are written through refs
  // rather than state — 4 nodes updating instead of the page re-rendering 60
  // times a second.
  const countUp = useCallback(() => {
    const t0 = performance.now();
    const dur = 1300;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      STATS.forEach((s, i) => {
        const el = statRefs.current[i];
        if (!el) return;
        const v = s.to * e;
        el.textContent = (s.dec ? v.toFixed(s.dec) : Math.round(v)) + s.suf;
      });
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const card = rateCardRef.current;
    if (!card) return undefined;
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting || countedRef.current) return;
          countedRef.current = true;
          setBarsOn(true);
          countUp();
        });
      },
      { threshold: 0.3 },
    );
    io.observe(card);
    return () => io.disconnect();
  }, [countUp]);


  return (
    <div ref={rootRef}>
      <div className="demo">
        Demo build · <b>synthetic data</b> · noindex · sample reviews
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
                  <a href={l.href} key={l.href}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            <a className="pn-item" href="/#events">
              Events
            </a>
            <a className="pn-item active" href="/reviews">
              Reviews
            </a>
            <a className="pn-item pn-cta" href="/">
              Build my event
            </a>
          </div>
        </div>
      </nav>

      <header className="rv-hero">
        <div className="bg">
          <video autoPlay muted loop playsInline poster={ASSET("hero-poster.jpg")}>
            <source src={ASSET("hero-bg.mp4")} type="video/mp4" />
          </video>
        </div>
        <div className="wrap">
          <div className="in-wrap">
            <p className="eyebrow rise">Reviews</p>
            <h1 className="rise">Loved across Raleigh</h1>
            <p className="sub rise">
              From backyard weddings to brand launches, here’s what people say after one request
              covered the whole event.
            </p>
            <div className="rate-card rise" ref={rateCardRef}>
              <div className="rc-score">
                <b>4.9</b>
                <div className="rc-stars">★★★★★</div>
                <span>320 verified events</span>
              </div>
              <div className="rc-bars">
                {BARS.map((b) => (
                  <div className="rc-row" key={b.lab}>
                    <span className="lab">{b.lab}</span>
                    <div className="rc-track">
                      <div className="rc-fill" style={barsOn ? { width: `${b.w}%` } : undefined} />
                    </div>
                    <span className="pct">{b.w}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rv-stats rise">
              {STATS.map((s, i) => (
                <div className="rv-stat" key={s.label}>
                  <b
                    className="cu"
                    ref={(el) => {
                      statRefs.current[i] = el;
                    }}
                  >
                    0
                  </b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

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
            </div>
            <div>
              <h4>Get started</h4>
              <a className="fl" href="/">
                Build my event
              </a>
              <a className="fl" href="/">
                Home
              </a>
            </div>
          </div>
          <div className="fine">
            <span>© 2026 Events &amp; Media · Demo build · noindex</span>
            <span>Privacy · Terms · Synthetic data only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
