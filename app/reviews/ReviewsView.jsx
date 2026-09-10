"use client";

// Reviews — ported from public/assets/reviews-extracted/reviews.html.
// reviews.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// reveal IntersectionObserver threshold .14, nav "scrolled" at y > 30,
// the rating bars + count-ups firing once at threshold .3 on the rate card
// (1300ms, 1-(1-p)³ easing), the spotlight carousel at 5500ms with a 180ms
// quote cross-fade, the FLIP filter at .5s var(--ease), and the 120-particle
// confetti burst (gravity .25, alpha -.01/frame).
//
// Link mapping follows the other ported pages: the reference's relative
// document links become app routes — home and "Build my event" → "/", the
// services menu → "/services/*", Events/About → the matching landing page
// anchors.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { sendRatingPulse } from "../../lib/api";
import { loadSession } from "../../lib/session";
import "./reviews.css";
import NavAuth from "../components/NavAuth";
import SiteFooter from "../components/SiteFooter";

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

// SERVICE_LINKS, the rating histogram, the stats, the spotlight slides, the
// photo marquee, the filter chips and the review wall all used to be authored
// here. They now arrive from GET /api/v1/content/reviews, so a new service or
// a new review needs no edit to this file. What stays local is the animation:
// the confetti system, the 5.5s carousel dwell and the FLIP filter transition.

const CONFETTI_COLORS = ["#639922", "#97c459", "#e0b341", "#fff"];

// Lit stars, then the remainder greyed out by `.off` — the reference's markup.
const stars = (n) => (
  <>
    {"★".repeat(n)}
    {n < 5 ? <span className="off">{"★".repeat(5 - n)}</span> : null}
  </>
);

export default function ReviewsView({ content }) {
  // Named locally so the render below reads the way it did when these were
  // module constants.
  const {
    summary,
    stats: STATS,
    filters: FILTERS,
    spotlight: SPOTLIGHT,
    reviews: REVIEWS,
    marquee: MARQUEE,
    navigation,
  } = content;
  const SERVICE_LINKS = navigation.services;
  const BARS = summary.histogram;

  const rootRef = useRef(null);
  const navRef = useRef(null);
  const rateCardRef = useRef(null);
  const statRefs = useRef([]);
  const cardRefs = useRef([]);
  const quoteRef = useRef(null);
  const canvasRef = useRef(null);
  const firstRects = useRef(null);
  const countedRef = useRef(false);

  const [dropOpen, setDropOpen] = useState(false);
  const [barsOn, setBarsOn] = useState(false);
  const [filter, setFilter] = useState("all");
  const [cur, setCur] = useState(0);
  const [shown, setShown] = useState(0);
  const [picked, setPicked] = useState(0);
  const [hover, setHover] = useState(0);
  const [thanks, setThanks] = useState("");

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
        const v = s.value * e;
        el.textContent = s.prefix + (s.decimals ? v.toFixed(s.decimals) : Math.round(v)) + s.suffix;
      });
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [STATS]);

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

  /* ---------- confetti on a rating ---------- */
  const burst = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    // The reference sizes the bitmap from `cv.parentElement.parentElement` —
    // the page wrapper, not the `.rv-rate` section the canvas is stretched
    // over — so the burst is drawn into a document-tall buffer and squashed
    // into the section. Kept as-is: it is what the reference renders.
    const box = cv.parentElement?.parentElement?.getBoundingClientRect();
    if (!box) return;
    cv.width = box.width;
    cv.height = box.height;
    const P = [];
    for (let i = 0; i < 120; i++) {
      P.push({
        x: cv.width / 2,
        y: cv.height * 0.55,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 3,
        r: 3 + Math.random() * 3,
        c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        a: 1,
      });
    }
    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      let alive = false;
      P.forEach((p) => {
        p.vy += 0.25;
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
  }, []);

  const rate = useCallback(
    (v) => {
      setPicked(v);
      setThanks(`Thanks for the ${"★".repeat(v)} — we appreciate you!`);
      burst();
      // Recorded server-side so the taps are actually counted. The thank-you
      // and the confetti are not held back on the round trip, and a failure is
      // not surfaced: the visitor has already given their answer, and there is
      // nothing useful for them to do about it.
      const session = loadSession();
      sendRatingPulse(v, session?.accessToken).catch(() => {});
    },
    [burst],
  );

  const spot = SPOTLIGHT[shown];
  const lit = hover || picked;
  const visible = REVIEWS.filter((r) => filter === "all" || r.categoryKey === filter).length;

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
            <NavAuth />
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
                <b>{summary.average.toFixed(1)}</b>
                <div className="rc-stars">★★★★★</div>
                <span>
                  {summary.total} verified {summary.total === 1 ? "review" : "reviews"}
                </span>
              </div>
              <div className="rc-bars">
                {BARS.map((b) => (
                  <div className="rc-row" key={b.stars}>
                    <span className="lab">{b.stars}★</span>
                    <div className="rc-track">
                      <div
                        className="rc-fill"
                        style={barsOn ? { width: `${b.percent}%` } : undefined}
                      />
                    </div>
                    <span className="pct">{b.percent}%</span>
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
                  key={s.id}
                  style={{ backgroundImage: `url('${s.image.path}')` }}
                />
              ))}
            </div>
            <div className="spot-body">
              <div className="spot-mark">“</div>
              <div className="spot-stars">{stars(spot.stars)}</div>
              <p className="spot-quote" ref={quoteRef}>
                {spot.quote}
              </p>
              <div className="spot-who">
                <div className="spot-av">{spot.initials}</div>
                <div>
                  <b>{spot.authorName}</b>
                  <span>{spot.tag}</span>
                </div>
              </div>
              <div className="spot-ctrl">
                <div className="spot-dots">
                  {SPOTLIGHT.map((s, i) => (
                    <i
                      className={i === cur ? "on" : undefined}
                      key={s.id}
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
                <div className="m" key={`${loop}-${m.id}`}>
                  <img src={m.image.path} alt="" />
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
                key={f.key}
                className={filter === f.key ? "on" : ""}
                onClick={() => applyFilter(f.key)}
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
                key={r.id}
                data-cat={r.categoryKey}
                style={
                  filter === "all" || r.categoryKey === filter ? undefined : { display: "none" }
                }
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              >
                <div className="bub-av" style={{ background: r.avatarColor }}>
                  {r.initials}
                </div>
                <div className="bub-msg">
                  <div className="bub-name">
                    {r.authorName} <i className="chk">✓</i>
                    <span className="bub-tag">{r.serviceLabel}</span>
                  </div>
                  <div className="bub-stars">{stars(r.stars)}</div>
                  <p className="bub-txt">{r.body}</p>
                  <div className="bub-time">{r.whenLabel}</div>
                </div>
              </article>
            ))}
          </div>
          <div className="rv-empty" style={visible ? undefined : { display: "block" }}>
            No reviews in this category yet.
          </div>
        </div>
      </section>

      <section className="rv-rate">
        <canvas id="rateCf" ref={canvasRef} />
        <div className="wrap">
          <h2>How was your event?</h2>
          <p>Tap a star — we read every one.</p>
          <div className="stars-in" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                type="button"
                key={v}
                className={v <= lit ? "lit" : undefined}
                aria-label={`Rate ${v} out of 5`}
                onMouseEnter={() => setHover(v)}
                onClick={() => rate(v)}
              >
                ★
              </button>
            ))}
          </div>
          <div className="rate-thanks">{thanks}</div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
