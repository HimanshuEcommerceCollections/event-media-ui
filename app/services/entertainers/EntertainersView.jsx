"use client";

// Entertainers service page — ported from designs/entertainers-SHARE.html
// (de-inlined copy: designs/entertainers-extracted.html).
// entertainers.css is that document's <style> block copied verbatim, so every
// token, breakpoint and transition comes from the reference rather than a
// redraw. The reference's vanilla JS is reimplemented below with the same
// numbers: IntersectionObserver threshold .15, nav "scrolled" at y > 40,
// Lenis duration 1.1, magnetic offsets .25/.4, the cent-based performer
// calculator, and the sparkle canvas (28ms trail throttle, 22-particle burst).
//
// Deliberately not ported (a no-op in the reference itself):
//  - the #stageSpot pointermove handler. A later CSS override sets
//    `.stage-spot{display:none}`, so it writes --sx/--sy to a hidden element.
//    The element stays in the markup, as it is in the reference.

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import StepIcon from "../StepIcon";
import "./entertainers.css";
import NavAuth from "../../components/NavAuth";
import SiteFooter from "../../components/SiteFooter";

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

const money = (c) =>
  `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SPARKLE_COLORS = ["#97c459", "#EF9F27", "#f4f3ee"];

export default function EntertainersView({ content }) {
  // Named locally so the render below reads the way it did when these were
  // module constants.
  const { pricing, blocks, navigation } = content;
  const SERVICE_LINKS = navigation.services;
  const MENU_LINKS = navigation.menu;
  const INTRO_POINTS = blocks.intro ?? [];
  const FAQS = blocks.faq ?? [];
  const CARDS = blocks.card ?? [];
  const STEPS = blocks.step ?? [];
  const MARQUEE = (blocks.marquee ?? []).map((m) => m.label);
  const { performers: PERF, minHours: MIN_HOURS, maxHours: MAX_HOURS } = pricing;

  const rootRef = useRef(null);
  const navRef = useRef(null);
  const lenisRef = useRef(null);

  const [reduce, setReduce] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    setReduce(matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* ---------- smooth scroll (Lenis, same CDN build as the reference) ---------- */
  const initLenis = useCallback(() => {
    if (reduce || !window.Lenis || lenisRef.current) return;
    const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [reduce]);

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
      { threshold: 0.15 },
    );
    root.querySelectorAll(".rise,.stagger").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---------- nav background on scroll ---------- */
  // Lenis owns the scroll position while it runs, so the listener is attached
  // there when it exists and to the window otherwise — as in the reference.
  useEffect(() => {
    const apply = (y) => {
      if (navRef.current) navRef.current.classList.toggle("scrolled", y > 40);
    };
    apply(0);
    const lenis = lenisRef.current;
    if (lenis) {
      const onLenis = (e) => apply(e.scroll);
      lenis.on("scroll", onLenis);
      return () => lenis.off("scroll", onLenis);
    }
    const onWin = () => apply(window.scrollY);
    window.addEventListener("scroll", onWin, { passive: true });
    return () => window.removeEventListener("scroll", onWin);
  }, [reduce]);

  /* ---------- menu overlay ---------- */
  const setMenu = useCallback((open) => {
    setMenuOpen(open);
    document.body.style.overflow = open ? "hidden" : "";
    if (lenisRef.current) {
      if (open) lenisRef.current.stop();
      else lenisRef.current.start();
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && menuOpen) setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, setMenu]);

  /* ---------- services dropdown ---------- */
  useEffect(() => {
    if (!dropOpen) return undefined;
    const onDoc = () => setDropOpen(false);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [dropOpen]);

  /* ---------- magnetic buttons ---------- */
  const magnetic = reduce
    ? {}
    : {
        onPointerMove: (e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - (r.left + r.width / 2)) * 0.25).toFixed(1);
          const y = ((e.clientY - (r.top + r.height / 2)) * 0.4).toFixed(1);
          e.currentTarget.style.transform = `translate(${x}px,${y}px)`;
        },
        onPointerLeave: (e) => {
          e.currentTarget.style.transform = "";
        },
      };

  /* ---------- FAQ ---------- */
  const faqRefs = useRef([]);
  const [openFaq, setOpenFaq] = useState(() => new Set());

  const toggleFaq = (i) => {
    const open = !openFaq.has(i);
    // The reference animates max-height from the measured scrollHeight; there
    // is no fixed height for CSS alone to transition to.
    const a = faqRefs.current[i];
    if (a) a.style.maxHeight = open ? `${a.scrollHeight}px` : "0";
    setOpenFaq((prev) => {
      const next = new Set(prev);
      if (open) next.add(i);
      else next.delete(i);
      return next;
    });
  };

  /* ---------- sparkle canvas ---------- */
  // A fixed, pointer-events:none canvas over the whole viewport: a throttled
  // trail under the cursor, plus a burst when a performer is picked. The
  // particle loop is self-terminating — it stops once the last one dies.
  const cvsRef = useRef(null);
  const partsRef = useRef([]);
  const runningRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0 });

  const runParticles = useCallback(() => {
    if (runningRef.current) return;
    const cvs = cvsRef.current;
    const ctx = cvs && cvs.getContext("2d");
    if (!ctx) return;
    runningRef.current = true;

    const star = (cx, cy, s) => {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        const rad = i % 2 === 0 ? s : s * 0.4;
        ctx.lineTo(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
      }
      ctx.closePath();
      ctx.fill();
    };

    const loop = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      const parts = partsRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life--;
        p.vy += 0.03;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        const k = p.life / p.max;
        ctx.save();
        ctx.globalAlpha = Math.max(0, k);
        ctx.translate(p.x, p.y);
        p.r += p.vr;
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        star(0, 0, p.s * (0.5 + k * 0.5));
        ctx.restore();
        if (p.life <= 0) parts.splice(i, 1);
      }
      if (parts.length) requestAnimationFrame(loop);
      else runningRef.current = false;
    };
    requestAnimationFrame(loop);
  }, []);

  const spk = useCallback((x, y, vx, vy, life) => {
    partsRef.current.push({
      x,
      y,
      vx,
      vy,
      life,
      max: life,
      r: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.3,
      s: 3 + Math.random() * 4,
      c: SPARKLE_COLORS[(Math.random() * SPARKLE_COLORS.length) | 0],
    });
  }, []);

  const sparkleBurst = useCallback(
    (x, y, n) => {
      if (reduce) return;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.28;
        const p = 1 + Math.random() * 3;
        spk(x, y, Math.cos(a) * p, Math.sin(a) * p, 40 + Math.random() * 20);
      }
      runParticles();
    },
    [reduce, spk, runParticles],
  );

  useEffect(() => {
    const cvs = cvsRef.current;
    if (!cvs) return undefined;
    const ctx = cvs.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h };
      cvs.width = w * dpr;
      cvs.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ---------- hero spotlight + sparkle trail ---------- */
  const heroRef = useRef(null);
  const spotRef = useRef(null);

  useEffect(() => {
    let lastT = 0;
    const onMove = (e) => {
      const hero = heroRef.current;
      const spot = spotRef.current;
      if (hero && spot) {
        const r = hero.getBoundingClientRect();
        spot.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        spot.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      }
      if (reduce) return;
      const now = performance.now();
      if (now - lastT <= 28) return;
      lastT = now;
      spk(e.clientX, e.clientY, (Math.random() - 0.5) * 0.6, -0.3 - Math.random() * 0.5, 26 + Math.random() * 16);
      runParticles();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, spk, runParticles]);

  /* ---------- performer picker ---------- */
  const [sel, setSel] = useState(0);
  const [hours, setHours] = useState(2);
  const totalRef = useRef(null);

  const total = PERF[sel].baseCents + PERF[sel].hourlyCents * hours;

  // The reference restarts the bump keyframe by removing the class, forcing a
  // reflow, then re-adding it — a class toggle alone would not replay it.
  useEffect(() => {
    const el = totalRef.current;
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }, [total]);

  const pickPerf = (i, e) => {
    setSel(i);
    const r = e.currentTarget.getBoundingClientRect();
    sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 22);
  };

  /* ---------- card fan ---------- */
  const [flipped, setFlipped] = useState(() => new Set());
  const [zIndexes, setZIndexes] = useState({});
  const zRef = useRef(10);

  const flipCard = (i) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    // Each click lifts that card above the ones already turned over.
    zRef.current += 1;
    setZIndexes((prev) => ({ ...prev, [i]: zRef.current }));
  };

  return (
    <div ref={rootRef}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lenis/1.1.13/lenis.min.js"
        strategy="afterInteractive"
        onLoad={initLenis}
      />

      <canvas id="sparkles" aria-hidden="true" ref={cvsRef} />

      <div className="demo">
        Demo build · <b>synthetic data</b> · noindex · sample pricing
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
                className="pn-item active"
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
                  <a key={l.href} href={l.href} aria-current={l.isCurrent ? "page" : undefined}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            <a className="pn-item" href="/#events">
              Events
            </a>
            <a className="pn-item" href="/#testimonials">
              Reviews
            </a>
            <NavAuth />
            <a className="pn-item pn-cta" href="/">
              Build my event
            </a>
          </div>
          <button
            className={`menu-btn${menuOpen ? " open" : ""}`}
            id="menuBtn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenu(!menuOpen)}
          >
            <span className="txt">Menu</span>{" "}
            <span className="bars" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`menu-overlay${menuOpen ? " open" : ""}`}
        id="menuOverlay"
        aria-hidden={!menuOpen}
      >
        <p className="eyebrow" style={{ marginBottom: "18px" }}>
          Events &amp; Media — services
        </p>
        <nav className="menu-nav" id="menuNav">
          {MENU_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={l.isCurrent ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <span className="idx">{l.idx}</span>
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <header className="s-hero" ref={heroRef}>
        <div className="bg">
          <video
            className="hvid"
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/entertainers/hero-poster.jpg"
          >
            <source src="/assets/entertainers/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="spot" id="heroSpot" aria-hidden="true" ref={spotRef} />
        <div className="wrap">
          <p className="crumb">
            <a href="/">Home</a> / <a href="/#services">Services</a> / Entertainers
          </p>

          <div className="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 2.5l2.2 5.3 5.8.5-4.4 3.8 1.3 5.6L12 20.7l-4.2 2 1.3-5.6L4.7 8.3l5.8-.5L12 2.5Z" />
            </svg>
          </div>
          <h1>Entertainers</h1>
          <p className="tag">
            Magicians, face painters, caricaturists and balloon artists — booked by the hour.
          </p>
          <div className="cta">
            <a className="btn btn-primary magnetic" href="/" {...magnetic}>
              Build my event <span className="ar">→</span>
            </a>
            <a className="btn btn-ghost magnetic" href="#pricing" {...magnetic}>
              See pricing
            </a>
          </div>
        </div>
      </header>

      <div className="act-marq">
        {/* Doubled so the -50% scroll keyframe loops seamlessly. */}
        <div className="am-row">
          {[...MARQUEE, ...MARQUEE].map((a, i) => (
            <span className="am" key={`${a}-${i}`}>
              {a}
            </span>
          ))}
        </div>
      </div>

      <section className="s-intro">
        <div className="wrap grid">
          <div className="rise">
            <p className="eyebrow">What it is</p>
            <img className="intro-img" src="/assets/entertainers/intro.jpg" alt="" />
          </div>
          <div className="rise">
            <p className="lead">
              Bring the moment to life with vetted local performers. Pick a type and the hours you
              need; the running total updates live as you go.
            </p>
            <div className="sp-points stagger">
              {INTRO_POINTS.map((pt) => (
                <div className="sp-point" key={pt.name}>
                  <div className="n">{pt.name}</div>
                  <p>{pt.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="s-price" id="pricing">
        <div className="perf-bg" id="perfBg" aria-hidden="true" />
        <div className="perf-veil" aria-hidden="true" />
        <div className="wrap">
          <div
            className="head rise"
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "20px",
              marginBottom: "28px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p className="eyebrow">Pick your performer</p>
              <h2 style={{ marginTop: "10px" }}>Who&apos;s on the bill?</h2>
            </div>
            <span style={{ fontFamily: "var(--fmono)", fontSize: "12px", color: "var(--tx3)" }}>
              [ sample · USD ]
            </span>
          </div>
          <div className="perf-stage rise" id="perfStage">
            {PERF.map((p, i) => (
              <button
                type="button"
                key={p.key}
                className={`perf${sel === i ? " sel" : ""}`}
                aria-pressed={sel === i}
                onClick={(e) => pickPerf(i, e)}
              >
                <div
                  className="pbg"
                  style={{ backgroundImage: `url('/assets/entertainers/${p.imageFile}')` }}
                />
                <div className="pshade" />
                <div className="pname">
                  <span className="pn">{p.name}</span>
                  <span className="pfrom">{p.fromLabel}</span>
                </div>
              </button>
            ))}
            <div className="stage-spot" id="stageSpot" aria-hidden="true" />
          </div>
          <div className="perf-calc rise">
            <div>
              <div className="cl">How many hours?</div>
              <div className="hoursctl">
                <button
                  type="button"
                  aria-label="fewer hours"
                  onClick={() => setHours((h) => Math.max(MIN_HOURS, h - 1))}
                >
                  −
                </button>
                <span className="hv">{hours === 1 ? "1 hr" : `${hours} hrs`}</span>
                <button
                  type="button"
                  aria-label="more hours"
                  onClick={() => setHours((h) => Math.min(MAX_HOURS, h + 1))}
                >
                  +
                </button>
              </div>
            </div>
            <div className="perf-est">
              <div className="lbl">Estimated total</div>
              <br />
              <span className="amt" ref={totalRef}>
                {money(total)}
              </span>
            </div>
            <a className="btn btn-primary magnetic" href="/" {...magnetic}>
              Add to my event <span className="ar">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="s-cards" id="cards">
        <div className="wrap">
          <p className="eyebrow rise">Reviews, dealt</p>
          <h2 className="rise" style={{ marginTop: "10px", fontSize: "clamp(1.9rem,3.6vw,2.8rem)" }}>
            Pick a card, any card
          </h2>
          <div className="card-fan" id="cardFan">
            {CARDS.map((c, i) => (
              <div
                key={c.author}
                className={`pcard${flipped.has(i) ? " flip" : ""}`}
                style={{ "--l": c.left, "--rot": c.rotate, zIndex: zIndexes[i] }}
                role="button"
                aria-pressed={flipped.has(i)}
                tabIndex={0}
                onClick={() => flipCard(i)}
                onKeyDown={(e) => {
                  if (e.key !== " " && e.key !== "Enter") return;
                  e.preventDefault();
                  flipCard(i);
                }}
              >
                <div className="inner">
                  <div className="pface pfront">
                    <div className="bk">★</div>
                  </div>
                  <div className="pface pback">
                    <div className={`suit ${c.tone}`}>{c.suit}</div>
                    <p>{c.quote}</p>
                    <div className="by">{c.author}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="cards-hint">click a card to reveal</p>
        </div>
      </section>

      <section className="s-tl">
        <div
          className="tl-bg"
          style={{ backgroundImage: "url('/assets/entertainers/timeline-bg.jpg')" }}
        />
        <div className="tl-veil" />
        <div className="wrap">
          <div className="head rise" style={{ marginBottom: "30px" }}>
            <p className="eyebrow">How it works</p>
            <h2 style={{ marginTop: "10px", fontSize: "clamp(1.9rem,3.6vw,2.8rem)" }}>
              From booking to showtime
            </h2>
          </div>
          <div className="tl stagger">
            {STEPS.map((s) => (
              <div className="step" key={s.no}>
                <div className="ti">
                  <svg viewBox="0 0 24 24">
                    <StepIcon iconKey={s.iconKey} />
                  </svg>
                </div>
                <div className="n">{s.no}</div>
                <h4>{s.heading}</h4>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-faq">
        <div className="wrap faq-wrap">
          <h2 className="rise">Questions</h2>
          <div className="rise">
            {FAQS.map((f, i) => (
              <div className={`faq-item${openFaq.has(i) ? " open" : ""}`} key={f.question}>
                <button
                  className="faq-q"
                  type="button"
                  aria-expanded={openFaq.has(i)}
                  onClick={() => toggleFaq(i)}
                >
                  {f.question}
                  <span className="faq-ic" aria-hidden="true">
                    +
                  </span>
                </button>
                <div
                  className="faq-a"
                  ref={(el) => {
                    faqRefs.current[i] = el;
                  }}
                >
                  <p>{f.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-cta">
        <video className="cta-vid2" autoPlay muted loop playsInline>
          <source src="/assets/entertainers/cta-bg.mp4" type="video/mp4" />
        </video>
        <div className="cta-veil" />
        <div className="glow" />
        <div className="wrap">
          <p className="eyebrow rise">Ready when you are</p>
          <h2 className="rise" style={{ marginTop: "12px" }}>
            Add Entertainers to your event.
          </h2>
          <p className="rise">
            Tick it in the builder, watch the total update live, and send one request.
          </p>
          <a className="btn btn-primary magnetic rise" href="/" {...magnetic}>
            Build my event <span className="ar">→</span>
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
