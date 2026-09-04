"use client";

// About — ported from public/assets/about-extracted/about.html.
// about.css is that document's <style> block copied verbatim. The reference's
// vanilla JS is reimplemented below with the same numbers: reveal
// IntersectionObserver threshold .14, nav "scrolled" at y > 30, the stat
// count-ups firing once at threshold .3 (1300ms, 1-(1-p)³ easing), and the
// pinned timeline.
//
// The timeline is the page's one piece of real machinery. Its track is a tall
// scroll region; while the viewport is inside it the panel is pinned, and how
// far through the track you are picks the year. The pin uses the reference's
// three states — released above, `fixed` through the middle, `bottom` once the
// track has been passed — rather than position:sticky, because the panel has
// to release at the exact scroll offset the year buttons scroll back to.
//
// Only the photograph cross-fades on a year change; the year, heading and copy
// swap immediately, at the 180ms mark. That asymmetry is the reference's.
//
// Note this page's chrome differs from its siblings: the nav carries no "Sign
// in" item and the footer is a single line rather than the four-column block.
// Both are as authored.
//
// Link mapping follows the other ported pages: home → "/", the services menu
// → "/services/*", Events → the landing page anchor, "Build my event" →
// "/build".

import { useEffect, useRef, useState } from "react";
import "./about.css";

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

const TIMELINE = [
  {
    y: "2021",
    img: "tl-2021.jpg",
    h: "Founded in Raleigh",
    p: "Two friends, tired of juggling ten vendors for one backyard party, sketched a simpler idea on a napkin: what if a single request could cover the whole event?",
  },
  {
    y: "2022",
    img: "tl-2022.jpg",
    h: "First 50 events",
    p: "Word spread neighborhood to neighborhood. Birthdays, block parties, backyard weddings — all booked through one friendly front door.",
  },
  {
    y: "2023",
    img: "tl-2023.jpg",
    h: "A vetted pro network",
    p: "We built a roster of background-checked, insured local pros — DJs, photographers, entertainers — that we’d happily book for our own families.",
  },
  {
    y: "2024",
    img: "tl-2024.jpg",
    h: "Commercial launch",
    p: "Realtors and brands came knocking, so we added virtual tours and drone video — the same one-request simplicity, for business.",
  },
  {
    y: "2025",
    img: "tl-2025.jpg",
    h: "The one-request builder",
    p: "We shipped the live builder: pick your services, watch the estimate assemble, and send a single request in minutes.",
  },
  {
    y: "2026",
    img: "tl-2026-cta-bg.jpg",
    h: "320+ events & counting",
    p: "Today we’re Raleigh’s front door for celebrations and commercial media — and we’re just getting started.",
  },
];

const HOW_STEPS = [
  {
    n: "1",
    h: "Tell us once",
    p: "Share your event, your date, and the services you want — in one short request.",
  },
  {
    n: "2",
    h: "We match the pros",
    p: "We pair you with vetted, insured local pros who fit your vibe and budget.",
  },
  {
    n: "3",
    h: "You celebrate",
    p: "Everything shows up set up and ready. You just enjoy the day.",
  },
];

// data-to / data-dec from the reference's .cu elements.
const STATS = [
  { to: 320, dec: 0, label: "Events covered" },
  { to: 140, dec: 0, label: "Vetted pros" },
  { to: 6, dec: 0, label: "Service types" },
  { to: 4.9, dec: 1, label: "Avg rating" },
];

const VALUES = [
  {
    h: "Local first",
    p: "We champion Raleigh’s own — the pros who live and work where you celebrate.",
    icon: (
      <>
        <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z" />
        <circle cx="12" cy="11" r="2.2" />
      </>
    ),
  },
  {
    h: "Vetted & insured",
    p: "Every pro is background-checked, reviewed, and covered. No surprises.",
    icon: <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />,
  },
  {
    h: "Fair & upfront",
    p: "Clear, sample pricing before you commit. No hidden fees, ever.",
    icon: (
      <>
        <line x1="12" y1="3" x2="12" y2="21" />
        <path d="M16 7.5C16 6.1 14.2 5 12 5S8 6 8 7.5 9.8 10 12 10s4 1 4 2.5S14.2 15 12 15s-4-1.1-4-2.5" />
      </>
    ),
  },
  {
    h: "One request",
    p: "The whole event through a single friendly ask. That’s the whole point.",
    icon: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  },
];

const TEAM = [
  { ini: "MC", name: "Maya Chen", role: "Co-founder, CEO", av: "#639922" },
  { ini: "DP", name: "Devin Park", role: "Co-founder, Ops", av: "#e0b341" },
  { ini: "AR", name: "Aisha Rahman", role: "Head of Pros", av: "#6fb0d6" },
  { ini: "TA", name: "Tom Alvarez", role: "Product", av: "#e79ab5" },
];

const ASSET = (name) => `/assets/about/${name}`;

const LAST = TIMELINE.length - 1;

export default function AboutView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const trackRef = useRef(null);
  const pinRef = useRef(null);
  const imgRef = useRef(null);
  const statGridRef = useRef(null);
  const statRefs = useRef([]);
  const countedRef = useRef(false);

  const [dropOpen, setDropOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  // The photograph lags the copy by the cross-fade, so it tracks its own index.
  const [imgIdx, setImgIdx] = useState(0);

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

  /* ---------- pinned timeline ---------- */
  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!track || !pin) return undefined;

    const apply = () => {
      const r = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = track.offsetHeight - vh;

      if (r.top <= 0 && r.bottom >= vh) {
        pin.classList.add("fixed");
        pin.classList.remove("bottom");
      } else if (r.bottom < vh) {
        pin.classList.remove("fixed");
        pin.classList.add("bottom");
      } else {
        pin.classList.remove("fixed", "bottom");
      }

      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      setIdx(Math.round(p * LAST));
    };

    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  // Cross-fade the photograph: out, swap at 180ms, back in.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return undefined;
    img.style.opacity = "0";
    const t = setTimeout(() => {
      setImgIdx(idx);
      img.style.opacity = "1";
    }, 180);
    return () => clearTimeout(t);
  }, [idx]);

  const jumpTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const total = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: track.offsetTop + (i / LAST) * total, behavior: "smooth" });
  };

  /* ---------- stat count-up, once ---------- */
  useEffect(() => {
    const grid = statGridRef.current;
    if (!grid) return undefined;
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting || countedRef.current) return;
          countedRef.current = true;
          const t0 = performance.now();
          const frame = (now) => {
            const p = Math.min(1, (now - t0) / 1300);
            const eased = 1 - (1 - p) ** 3;
            STATS.forEach((s, i) => {
              const el = statRefs.current[i];
              if (!el) return;
              const v = s.to * eased;
              el.textContent = s.dec ? v.toFixed(s.dec) : String(Math.round(v));
            });
            if (p < 1) requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        });
      },
      { threshold: 0.3 },
    );
    io.observe(grid);
    return () => io.disconnect();
  }, []);

  const t = TIMELINE[idx];

  return (
    <div ref={rootRef}>
      <div className="demo">
        Demo build · <b>synthetic data</b> · noindex · sample company
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
            <a className="pn-item pn-cta" href="/build">
              Build my event
            </a>
          </div>
        </div>
      </nav>

      <header className="ab-hero">
        <div className="bg" style={{ backgroundImage: `url('${ASSET("hero-bg.jpg")}')` }} />
        <div className="wrap">
          <p className="eyebrow rise">Our story</p>
          <h1 className="rise">We turned ten vendor calls into one request.</h1>
          <p className="rise">
            Events &amp; Media is Raleigh’s front door for celebrations and commercial media — one
            marketplace, every pro, a single ask.
          </p>
        </div>
      </header>

      <section className="ab-story">
        <div className="wrap grid">
          <div className="rise">
            <p className="eyebrow">Why we exist</p>
            <h2>Planning an event shouldn’t take a spreadsheet.</h2>
            <p>
              Booking a party used to mean chasing a dozen vendors, comparing a dozen quotes, and
              hoping they all showed up. We thought that was backwards.
            </p>
            <p>
              So we built a marketplace where one request covers the whole thing — rentals,
              entertainers, DJs, photo, tours and drone — matched to vetted local pros who treat
              your event like their own.
            </p>
          </div>
          <div className="im rise">
            <img src={ASSET("team.jpg")} alt="A celebration" />
          </div>
        </div>
      </section>

      <section className="ab-tl">
        <div className="ab-tl-track" ref={trackRef}>
          <div className="ab-tl-pin" ref={pinRef}>
            <div className="wrap">
              <div className="head rise">
                <p className="eyebrow">The road here</p>
                <h2>From a napkin to 320+ events</h2>
              </div>
              <div className="tl-rail rise">
                <div className="tl-prog" style={{ width: `${(idx / LAST) * 90}%` }} />
                {TIMELINE.map((row, i) => (
                  <button
                    type="button"
                    key={row.y}
                    className={`tl-yr${i === idx ? " on" : ""}`}
                    onClick={() => jumpTo(i)}
                  >
                    <span className="dot" />
                    {row.y}
                  </button>
                ))}
              </div>
              <div className="tl-content rise">
                <div className="tl-media">
                  <img ref={imgRef} src={ASSET(TIMELINE[imgIdx].img)} alt="" />
                </div>
                <div className="tl-body">
                  <div className="yr">{t.y}</div>
                  <h3>{t.h}</h3>
                  <p>{t.p}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ab-how">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">How it works</p>
            <h2>Three steps, one request</h2>
          </div>
          <div className="how-steps">
            {HOW_STEPS.map((s) => (
              <div className="how-step rise" key={s.n}>
                <div className="n">{s.n}</div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-stats">
        <div className="wrap">
          <div className="stat-grid" ref={statGridRef}>
            {STATS.map((s, i) => (
              <div className="stat" key={s.label}>
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
      </section>

      <section className="ab-val">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">What we stand for</p>
            <h2>Our values</h2>
          </div>
          <div className="val-grid">
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

      <section className="ab-team">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">The people</p>
            <h2>Meet the team</h2>
          </div>
          <div className="team-grid">
            {TEAM.map((m) => (
              <div className="mem rise" key={m.ini}>
                <div className="av" style={{ background: m.av }}>
                  {m.ini}
                </div>
                <b>{m.name}</b>
                <span>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-cta">
        <div
          className="sec-bg"
          style={{ backgroundImage: `url('${ASSET("tl-2026-cta-bg.jpg")}')` }}
        />
        <div className="wrap">
          <h2>Let’s build your event.</h2>
          <p>One request. Whole event covered. See how easy it can be.</p>
          <a className="btn btn-primary" href="/build">
            Build my event →
          </a>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">© 2026 Events &amp; Media · Demo build · Synthetic data only</div>
      </footer>
    </div>
  );
}
