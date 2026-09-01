"use client";

// Reviews — ported from public/assets/reviews-extracted/reviews.html.
// reviews.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// reveal IntersectionObserver threshold .14, nav "scrolled" at y > 30,
// the rating bars + count-ups firing once at threshold .3 on the rate card
// (1300ms, 1-(1-p)³ easing), the spotlight carousel at 5500ms with a
// 180ms quote cross-fade, and the FLIP filter at .5s var(--ease).
//
// Link mapping follows the other ported pages: the reference's relative
// document links become app routes — home and "Build my event" → "/", the
// services menu → "/services/*", Events/About → the matching landing page
// anchors.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

const SPOTLIGHT = [
  {
    img: "spot-1.jpg",
    q: "One request and our whole backyard wedding came together — tables, lounge, string lights, all set up before we arrived.",
    st: 5,
    ini: "PM",
    name: "Priya & Marcus",
    tag: "Party rentals · Backyard wedding",
  },
  {
    img: "spot-2.jpg",
    q: "The DJ read the room perfectly — the dance floor did not empty once all night. Everyone asked who we booked.",
    st: 5,
    ini: "AK",
    name: "Aisha K.",
    tag: "DJ + music · Corporate gala",
  },
  {
    img: "spot-3.jpg",
    q: "Buyers walk the space before they ever visit. For our listings, it’s an absolute game changer.",
    st: 5,
    ini: "HG",
    name: "Harbor Group",
    tag: "Virtual tours · Real estate",
  },
];

// The reference prints this row twice so the -50% keyframe loops seamlessly.
const MARQUEE = [
  { img: "spot-2.jpg", label: "Neon bash" },
  { img: "marq-carnival.jpg", label: "Carnival" },
  { img: "spot-1.jpg", label: "Lakeside wedding" },
  { img: "marq-album-party.jpg", label: "Album party" },
  { img: "spot-3.jpg", label: "Brand summit" },
  { img: "marq-family-fest.jpg", label: "Family fest" },
  { img: "marq-garden-vows.jpg", label: "Garden vows" },
  { img: "marq-launch-day.jpg", label: "Launch day" },
  { img: "marq-film-night.jpg", label: "Film night" },
];

const FILTERS = [
  { f: "all", label: "All" },
  { f: "party", label: "Party rentals" },
  { f: "ent", label: "Entertainers" },
  { f: "dj", label: "DJ + music" },
  { f: "photo", label: "Photo + video" },
  { f: "tours", label: "Virtual tours" },
  { f: "drone", label: "Drone video" },
];

const REVIEWS = [
  {
    cat: "party",
    av: "#639922",
    ini: "PM",
    name: "Priya & Marcus",
    tag: "Party rentals",
    st: 5,
    txt: "One request and our whole backyard wedding came together — tables, lounge, string lights, all set up before we arrived. Effortless.",
    when: "June · verified",
  },
  {
    cat: "dj",
    av: "#e0b341",
    ini: "AK",
    name: "Aisha K.",
    tag: "DJ + music",
    st: 5,
    txt: "The DJ read the room perfectly — the dance floor did not empty once all night!",
    when: "April · verified",
  },
  {
    cat: "ent",
    av: "#6fb0d6",
    ini: "TD",
    name: "The Delgado Family",
    tag: "Entertainers",
    st: 5,
    txt: "The magician had our kids (and honestly the adults) completely speechless.",
    when: "May · verified",
  },
  {
    cat: "tours",
    av: "#e79ab5",
    ini: "NR",
    name: "Northside Realty",
    tag: "Virtual tours",
    st: 5,
    txt: "Our listings sell faster with the 3D tours, and the volume pricing is a real win.",
    when: "ongoing · verified",
  },
  {
    cat: "photo",
    av: "#e8934b",
    ini: "TR",
    name: "Tom & Riley",
    tag: "Photo + video",
    st: 5,
    txt: "Edited gallery back in three days, and the drone shots were unreal.",
    when: "March · verified",
  },
  {
    cat: "drone",
    av: "#8a7bd8",
    ini: "CC",
    name: "Cardinal Coworking",
    tag: "Drone video",
    st: 4,
    txt: "Aerials made our launch video pop. Booking was smooth and the pilot was a pro.",
    when: "Feb · verified",
  },
  {
    cat: "party",
    av: "#3b9a8f",
    ini: "BM",
    name: "Bianca M.",
    tag: "Party rentals",
    st: 5,
    txt: "Chairs, tables, lighting — delivered and set up before I even got there. Spotless!",
    when: "July · verified",
  },
  {
    cat: "ent",
    av: "#d96a5b",
    ini: "GH",
    name: "Grace H.",
    tag: "Entertainers",
    st: 5,
    txt: "A face painter and balloon artist kept thirty kids happy for hours. Lifesavers.",
    when: "June · verified",
  },
  {
    cat: "dj",
    av: "#639922",
    ini: "EH",
    name: "Elm Street HOA",
    tag: "DJ + music",
    st: 5,
    txt: "Booked, matched and done in minutes. The whole neighborhood loved it.",
    when: "May · verified",
  },
  {
    cat: "photo",
    av: "#e0b341",
    ini: "DS",
    name: "Devon & Sam",
    tag: "Photo + video",
    st: 5,
    txt: "Every candid moment captured beautifully. Worth every single penny.",
    when: "October · verified",
  },
  {
    cat: "tours",
    av: "#6fb0d6",
    ini: "HG",
    name: "Harbor Group",
    tag: "Virtual tours",
    st: 5,
    txt: "Buyers walk the space before they ever visit. An absolute game changer.",
    when: "ongoing · verified",
  },
  {
    cat: "drone",
    av: "#e79ab5",
    ini: "LP",
    name: "Lena P.",
    tag: "Drone video",
    st: 5,
    txt: "The sunset flyover of our venue gave every guest chills. Stunning.",
    when: "September · verified",
  },
];

// Lit stars, then the remainder greyed out by `.off` — the reference's markup.
const stars = (n) => (
  <>
    {"★".repeat(n)}
    {n < 5 ? <span className="off">{"★".repeat(5 - n)}</span> : null}
  </>
);

export default function ReviewsView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const rateCardRef = useRef(null);
  const statRefs = useRef([]);
  const cardRefs = useRef([]);
  const quoteRef = useRef(null);
  const firstRects = useRef(null);
  const countedRef = useRef(false);

  const [dropOpen, setDropOpen] = useState(false);
  const [barsOn, setBarsOn] = useState(false);
  const [filter, setFilter] = useState("all");
  const [cur, setCur] = useState(0);
  const [shown, setShown] = useState(0);

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

  /* ---------- spotlight carousel ---------- */
  useEffect(() => {
    const q = quoteRef.current;
    if (!q) return undefined;
    q.style.opacity = "0";
    const t = setTimeout(() => {
      setShown(cur);
      q.style.opacity = "1";
    }, 180);
    return () => clearTimeout(t);
  }, [cur]);

  // Keyed on `cur` so manual navigation restarts the 5.5s dwell, as the
  // reference's restart() does.
  useEffect(() => {
    const t = setInterval(() => setCur((c) => (c + 1) % SPOTLIGHT.length), 5500);
    return () => clearInterval(t);
  }, [cur]);

  const go = useCallback((i) => setCur((i + SPOTLIGHT.length) % SPOTLIGHT.length), []);

  /* ---------- wall filter, FLIP-animated ---------- */
  const applyFilter = useCallback((f) => {
    const first = new Map();
    cardRefs.current.forEach((el, i) => {
      if (el) first.set(i, el.getBoundingClientRect());
    });
    firstRects.current = first;
    setFilter(f);
  }, []);

  useLayoutEffect(() => {
    const first = firstRects.current;
    if (!first) return;
    firstRects.current = null;
    cardRefs.current.forEach((el, i) => {
      if (!el || el.style.display === "none") return;
      const fr = first.get(i);
      if (!fr) return;
      const last = el.getBoundingClientRect();
      const dx = fr.left - last.left;
      const dy = fr.top - last.top;
      if (!dx && !dy) return;
      el.style.transition = "none";
      el.style.transform = `translate(${dx}px,${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = "transform .5s var(--ease)";
        el.style.transform = "";
      });
    });
  }, [filter]);

  const spot = SPOTLIGHT[shown];
  const visible = REVIEWS.filter((r) => filter === "all" || r.cat === filter).length;

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

      <section className="rv-spot">
        <div className="wrap">
          <div className="spot-head rise">
            <p className="eyebrow">In their words</p>
            <h2>Client spotlight</h2>
          </div>
          <div className="spot rise">
            <div className="spot-media">
              {SPOTLIGHT.map((s, i) => (
                <div
                  className={`sm${i === cur ? " on" : ""}`}
                  key={s.img}
                  style={{ backgroundImage: `url('${ASSET(s.img)}')` }}
                />
              ))}
            </div>
            <div className="spot-body">
              <div className="spot-mark">“</div>
              <div className="spot-stars">{stars(spot.st)}</div>
              <p className="spot-quote" ref={quoteRef}>
                {spot.q}
              </p>
              <div className="spot-who">
                <div className="spot-av">{spot.ini}</div>
                <div>
                  <b>{spot.name}</b>
                  <span>{spot.tag}</span>
                </div>
              </div>
              <div className="spot-ctrl">
                <div className="spot-dots">
                  {SPOTLIGHT.map((s, i) => (
                    <i
                      className={i === cur ? "on" : undefined}
                      key={s.img}
                      onClick={() => go(i)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Show quote ${i + 1}`}
                      onKeyDown={(e) => {
                        if (e.key !== " " && e.key !== "Enter") return;
                        e.preventDefault();
                        go(i);
                      }}
                    />
                  ))}
                </div>
                <div className="spot-nav">
                  <button type="button" onClick={() => go(cur - 1)} aria-label="Previous quote">
                    ‹
                  </button>
                  <button type="button" onClick={() => go(cur + 1)} aria-label="Next quote">
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rv-marq">
        <div className="lab">Moments from real Raleigh events</div>
        <div className="marq-mask">
          <div className="marq-row">
            {[0, 1].map((loop) =>
              MARQUEE.map((m) => (
                <div className="m" key={`${loop}-${m.label}`}>
                  <img src={ASSET(m.img)} alt="" />
                  <span>{m.label}</span>
                </div>
              )),
            )}
          </div>
        </div>
      </section>

      <section className="rv-wall-sec">
        <div className="wrap">
          <div className="rv-head rise">
            <p className="eyebrow">Straight from the inbox</p>
            <h2>What clients tell us</h2>
          </div>
          <div className="rv-filter rise">
            {FILTERS.map((f) => (
              <button
                type="button"
                key={f.f}
                className={filter === f.f ? "on" : ""}
                onClick={() => applyFilter(f.f)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="rv-grid">
            {REVIEWS.map((r, i) => (
              <article
                // The reference alternates sent/received down the authored
                // order, and keeps that order when filtering (hidden cards
                // stay in the DOM), so parity is the index, not the position.
                className={`rv-card bub${i % 2 ? " sent" : ""}`}
                key={`${r.name}-${r.tag}`}
                data-cat={r.cat}
                style={filter === "all" || r.cat === filter ? undefined : { display: "none" }}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              >
                <div className="bub-av" style={{ background: r.av }}>
                  {r.ini}
                </div>
                <div className="bub-msg">
                  <div className="bub-name">
                    {r.name} <i className="chk">✓</i>
                    <span className="bub-tag">{r.tag}</span>
                  </div>
                  <div className="bub-stars">{stars(r.st)}</div>
                  <p className="bub-txt">{r.txt}</p>
                  <div className="bub-time">{r.when}</div>
                </div>
              </article>
            ))}
          </div>
          <div className="rv-empty" style={visible ? undefined : { display: "block" }}>
            No reviews in this category yet.
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
