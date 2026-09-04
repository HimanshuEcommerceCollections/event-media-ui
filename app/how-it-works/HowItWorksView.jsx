"use client";

// How it works — ported from
// public/assets/no-asset-pages/how-it-works.html.
// how-it-works.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// reveal IntersectionObserver threshold .14, nav "scrolled" at y > 30, the
// walkthrough's 2500ms dwell, and the 110-particle burst on the last step
// (gravity .28, alpha -.01/frame).
//
// The step emblems are inline SVG strings in the reference, swapped into the
// stage with innerHTML. They are components here instead, so nothing has to
// be injected as raw markup.
//
// Link mapping follows the other ported pages: home → "/", the services menu
// → "/services/*", Events → the landing page anchor, and the rest to their
// own routes.

import { useEffect, useRef, useState } from "react";
import "./how-it-works.css";

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

const STEPS = [
  {
    t: "Tell us once",
    d: "Build your event in minutes — pick your services, dates and any special requests. One request, that’s it.",
    bg: "rgba(151,196,89,.18)",
    c: "#3b6d11",
    icon: <path d="M4 5h16v11H8l-4 4z" />,
  },
  {
    t: "We match your pros",
    d: "We pair you with vetted, insured local pros who fit your vibe and your budget — no vendor juggling.",
    bg: "rgba(111,176,214,.2)",
    c: "#2f6f96",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M16 6a3 3 0 0 1 0 6M15 20a6 6 0 0 1 6 0" />
      </>
    ),
  },
  {
    t: "They arrive set up",
    d: "Everything shows up on time, set up and ready to go. Your coordinator keeps it all on track.",
    bg: "rgba(224,179,65,.22)",
    c: "#8a6d13",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </>
    ),
  },
  {
    t: "You celebrate",
    d: "You just enjoy the day. Afterward, leave a review and rebook your favourites in a tap.",
    bg: "rgba(231,154,181,.22)",
    c: "#a34e70",
    icon: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  },
];

const WHY = [
  {
    h: "One request",
    p: "Replace ten vendor calls with a single ask. Save hours.",
    icon: <path d="M13 3L4 14h6l-1 7 9-11h-6z" />,
  },
  {
    h: "Vetted & insured",
    p: "Every pro is background-checked and covered.",
    icon: <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />,
  },
  {
    h: "Upfront pricing",
    p: "Clear estimates before you commit — no surprises.",
    icon: (
      <>
        <line x1="12" y1="3" x2="12" y2="21" />
        <path d="M16 7.5C16 6.1 14.2 5 12 5S8 6 8 7.5 9.8 10 12 10s4 1 4 2.5S14.2 15 12 15s-4-1.1-4-2.5" />
      </>
    ),
  },
];

const CONFETTI_COLORS = ["#639922", "#97c459", "#e0b341", "#6fb0d6", "#e79ab5"];

const DWELL = 2500;

export default function HowItWorksView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const emblemRef = useRef(null);
  const canvasRef = useRef(null);
  const curRef = useRef(0);

  const [dropOpen, setDropOpen] = useState(false);
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  // The reference leaves the button reading "Replay" once the walkthrough has
  // run to the end, and only a fresh play resets it.
  const [ended, setEnded] = useState(false);

  const last = STEPS.length - 1;
  const step = STEPS[cur];

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

  /* ---------- walkthrough ---------- */
  useEffect(() => {
    curRef.current = cur;
  }, [cur]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      if (curRef.current >= last) {
        setPlaying(false);
        setEnded(true);
        return;
      }
      setCur((c) => c + 1);
    }, DWELL);
    return () => clearInterval(id);
  }, [playing, last]);

  // Retrigger the emblem's pop keyframe on every step, the way the reference
  // does by removing the class and forcing a reflow before adding it back.
  useEffect(() => {
    const el = emblemRef.current;
    if (!el) return;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }, [cur]);

  /* ---------- confetti on the final step ---------- */
  const burst = () => {
    const cv = canvasRef.current;
    const stage = cv?.parentElement?.getBoundingClientRect();
    if (!cv || !stage) return;
    cv.width = stage.width;
    cv.height = stage.height;
    const ctx = cv.getContext("2d");
    const P = Array.from({ length: 110 }, (_, i) => ({
      x: cv.width / 2,
      y: cv.height * 0.4,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 3,
      r: 3 + Math.random() * 3,
      c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      a: 1,
    }));
    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      let alive = false;
      P.forEach((p) => {
        p.vy += 0.28;
        p.x += p.vx;
        p.y += p.vy;
        p.a -= 0.01;
        if (p.a <= 0) return;
        alive = true;
        ctx.globalAlpha = Math.max(0, p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.r, p.r);
      });
      ctx.globalAlpha = 1;
      if (alive) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (cur === last) burst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, last]);

  const go = (i) => {
    setPlaying(false);
    setCur(((i % STEPS.length) + STEPS.length) % STEPS.length);
  };

  const onPlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (cur >= last) setCur(0);
    setEnded(false);
    setPlaying(true);
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
            <a className="pn-item pn-cta" href="/build">
              Build my event
            </a>
          </div>
        </div>
      </nav>

      <header className="h-hero">
        <div className="wrap">
          <p className="eyebrow">How it works</p>
          <h1>From idea to celebration — in four taps.</h1>
          <p>Hit play and watch the whole thing come together.</p>
        </div>
      </header>

      <section className="h-play">
        <div className="wrap">
          <div className="hp-stage">
            <div className="hp-scene">
              <div
                className="hp-emblem"
                ref={emblemRef}
                style={{ background: step.bg, color: step.c }}
              >
                <LineIcon>{step.icon}</LineIcon>
              </div>
              <div className="hp-num">
                Step {cur + 1} of {STEPS.length}
              </div>
              <h3>{step.t}</h3>
              <p>{step.d}</p>
            </div>
            <div className="hp-track">
              <div className="hp-fill" style={{ width: `${((cur + 1) / STEPS.length) * 100}%` }} />
            </div>
            <div className="hp-dots">
              {STEPS.map((s, i) => (
                <i
                  key={s.t}
                  className={i === cur ? "on" : undefined}
                  onClick={() => go(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Step ${i + 1}`}
                  onKeyDown={(e) => {
                    if (e.key !== " " && e.key !== "Enter") return;
                    e.preventDefault();
                    go(i);
                  }}
                />
              ))}
            </div>
            <div className="hp-ctrl">
              <button type="button" onClick={() => go(cur - 1)}>
                ‹ Back
              </button>
              <button className="hp-play" type="button" onClick={onPlay}>
                {playing ? "❚❚ Pause" : ended ? "↻ Replay" : "▶ Play"}
              </button>
              <button type="button" onClick={() => go(cur + 1)}>
                Next ›
              </button>
            </div>
            <canvas id="hpCf" aria-hidden="true" ref={canvasRef} />
          </div>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Why it’s different</p>
            <h2>Simple on purpose</h2>
          </div>
          <div className="why-grid">
            {WHY.map((w) => (
              <div className="why-c rise" key={w.h}>
                <div className="ic">
                  <LineIcon>{w.icon}</LineIcon>
                </div>
                <h3>{w.h}</h3>
                <p>{w.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="h-cta">
        <div className="wrap">
          <h2>Ready to try it?</h2>
          <p>Build your event now — it takes about two minutes.</p>
          <a className="btn btn-primary" href="/build">
            Build my event →
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
