"use client";

// Party rentals service page — ported from
// public/assets/party-rentals-extracted/party-rentals.html.
// party-rentals.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// IntersectionObserver threshold .15, nav "scrolled" at y > 40, Lenis
// duration 1.1, magnetic offsets .25/.4, the cent-based rental calculator,
// the before/after wipe clamped to 2–98%, and the confetti system (gravity
// .18, drag .995, 6–13px pieces, the 350ms opening pop and the one-shot
// burst when pricing is 40% visible).
//
// Deliberately not ported (both no-ops in the reference itself):
//  - the `[data-parallax]` translate inside its scroll handler. Nothing in
//    the reference body carries the attribute, so the loop runs over an
//    empty list on every scroll event.
//  - `<body data-slug="party-rentals">`. No script or rule reads it, and in
//    the app router the body belongs to the root layout.
//
// The kit cards print their totals as literal strings in the reference. Here
// they are summed from the same quantities and unit prices, which reproduces
// those strings exactly and keeps them true if a price ever moves.

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./party-rentals.css";

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

const HERE = "/services/party-rentals";

const SERVICE_LINKS = [
  { href: HERE, label: "Party rentals" },
  { href: "/services/entertainers", label: "Entertainers" },
  { href: "/services/dj-music", label: "DJ + music" },
  { href: "/services/photo-video", label: "Photo + video" },
  { href: "/services/virtual-tours", label: "Virtual tours" },
  { href: "/services/drone-video", label: "Drone video" },
];

const MENU_LINKS = [
  { href: "/", idx: "00", label: "Home" },
  { href: HERE, idx: "01", label: "Party rentals" },
  { href: "/services/entertainers", idx: "02", label: "Entertainers" },
  { href: "/services/dj-music", idx: "03", label: "DJ + music" },
  { href: "/services/photo-video", idx: "04", label: "Photo + video" },
  { href: "/services/virtual-tours", idx: "05", label: "Virtual tours" },
  { href: "/services/drone-video", idx: "06", label: "Drone video" },
  { href: "/reviews", idx: "→", label: "Reviews" },
];

const INTRO_POINTS = [
  { n: "Delivered & set up", p: "We handle drop-off, staging and collection." },
  { n: "Partner-fulfilled", p: "Vetted local inventory, not warehoused by us." },
  { n: "Priced per item", p: "See the per-piece cost before you commit." },
];

// cents, exactly as the reference's PR table; `step` is its data-step.
const ITEMS = [
  { key: "chair", label: "Folding chair", note: "$1.75 each · steps of 10", price: 175, step: 10 },
  { key: "table", label: "Round table", note: "$9.50 each", price: 950, step: 1 },
  { key: "linen", label: "Table linen", note: "$6.25 each", price: 625, step: 1 },
  { key: "tent", label: "20×20 tent", note: "$325.00 each", price: 32500, step: 1 },
  { key: "dancefloor", label: "Dance floor", note: "$210.00 each", price: 21000, step: 1 },
  { key: "lighting", label: "String-light kit", note: "$145.00 each", price: 14500, step: 1 },
];

const START_QTY = { chair: 40, table: 5, linen: 5, tent: 0, dancefloor: 0, lighting: 0 };

const KITS = [
  {
    key: "backyard",
    name: "Backyard Party",
    img: "kit-backyard-party.jpg",
    includes: ["30 folding chairs", "4 round tables", "4 table linens", "String-light kit"],
    qty: { chair: 30, table: 4, linen: 4, tent: 0, dancefloor: 0, lighting: 1 },
  },
  {
    key: "wedding",
    name: "The Wedding",
    img: "kit-wedding.jpg",
    includes: [
      "120 folding chairs",
      "15 round tables",
      "15 table linens",
      "20×20 tent",
      "Dance floor",
      "2 string-light kits",
    ],
    qty: { chair: 120, table: 15, linen: 15, tent: 1, dancefloor: 1, lighting: 2 },
  },
  {
    key: "birthday",
    name: "Kids' Birthday",
    img: "kit-kids-birthday.jpg",
    includes: ["20 folding chairs", "3 round tables", "3 table linens", "String-light kit"],
    qty: { chair: 20, table: 3, linen: 3, tent: 0, dancefloor: 0, lighting: 1 },
  },
  {
    key: "corporate",
    name: "Corporate",
    img: "kit-corporate.jpg",
    includes: [
      "60 folding chairs",
      "8 round tables",
      "8 table linens",
      "Dance floor",
      "2 string-light kits",
    ],
    qty: { chair: 60, table: 8, linen: 8, tent: 0, dancefloor: 1, lighting: 2 },
  },
];

const POLAROIDS = [
  { img: "ba-styled.jpg", label: "Setup", left: "2%", top: "6%", rot: "-6deg" },
  { img: "polaroid-moment.jpg", label: "The moment", left: "23%", top: "30%", rot: "4deg" },
  { img: "polaroid-head-table.jpg", label: "Head table", left: "45%", top: "3%", rot: "-3deg" },
  { img: "polaroid-little-guests.jpg", label: "Little guests", left: "60%", top: "34%", rot: "7deg" },
  { img: "polaroid-first-dance.jpg", label: "First dance", left: "78%", top: "12%", rot: "-5deg" },
];

const STEPS = [
  {
    n: "01",
    h: "Deliver",
    p: "We drop everything at your venue, on schedule.",
    icon: (
      <>
        <rect x="1" y="6" width="13" height="10" rx="1" />
        <path d="M14 9h4l3 3v4h-7z" />
        <circle cx="6" cy="18" r="1.8" />
        <circle cx="17" cy="18" r="1.8" />
      </>
    ),
  },
  {
    n: "02",
    h: "Set up",
    p: "Our partners stage chairs, tables and decor.",
    icon: (
      <>
        <circle cx="12" cy="12" r="3.4" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M18 6l-2 2M6 18l2-2M18 18l-2-2" />
      </>
    ),
  },
  {
    n: "03",
    h: "Celebrate",
    p: "You enjoy the day — nothing to haul or fuss.",
    icon: (
      <>
        <path d="M4 20 9 8l7 7-12 5Z" />
        <path d="M14 4l1 2M18 6l-1.5 1.5M20 10l-2 .8" />
      </>
    ),
  },
  {
    n: "04",
    h: "Collect",
    p: "We pack it all down and take it away after.",
    icon: (
      <>
        <path d="M4 8 12 4l8 4v8l-8 4-8-4V8Z" />
        <path d="M4 8l8 4 8-4M12 12v8" />
      </>
    ),
  },
];

const FAQS = [
  {
    q: "Do you deliver and set up?",
    a: "Yes — delivery, setup and pickup are coordinated with the fulfilling partner and included in your request.",
  },
  {
    q: "Is there a minimum order?",
    a: "Most partners have a small minimum; the builder will flag it before you submit.",
  },
  {
    q: "How far ahead should I book?",
    a: "Two to three weeks is ideal for peak-season weekends.",
  },
];

const CONFETTI_COLORS = ["#97c459", "#639922", "#EF9F27", "#e24b4a", "#3D5AC9", "#D4537E", "#f4f3ee"];

// The chair strip stops drawing at 80 and prints the remainder as a count.
const CHAIRVIZ_MAX = 80;

const money = (c) =>
  `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const priceOf = (qty) => ITEMS.reduce((sum, it) => sum + (qty[it.key] || 0) * it.price, 0);

const ASSET = (name) => `/assets/party-rentals/${name}`;

export default function PartyRentalsView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const lenisRef = useRef(null);
  const canvasRef = useRef(null);
  const fxRef = useRef(null);
  const pricingRef = useRef(null);
  const calcRef = useRef(null);
  const totalRef = useRef(null);
  const baRef = useRef(null);
  const faqRefs = useRef([]);

  const [reduce, setReduce] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [qty, setQty] = useState(START_QTY);
  const [kit, setKit] = useState(null);
  const [openFaq, setOpenFaq] = useState(() => new Set());

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

  /* ---------- confetti ---------- */
  // The particle field lives entirely in this effect: it repaints every frame
  // off a plain array, so routing it through state would re-render the page
  // sixty times a second for no gain. Handlers reach it through fxRef.
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;
    const ctx = cv.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const parts = [];
    let W = 0;
    let H = 0;
    let running = false;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      running = true;
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += 0.18;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.sh) {
          ctx.beginPath();
          ctx.arc(0, 0, p.s * 0.45, 0, 6.28);
          ctx.fill();
        } else {
          ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
        }
        ctx.restore();
        if (p.y > H + 30 || p.x < -50 || p.x > W + 50) parts.splice(i, 1);
      }
      if (parts.length) requestAnimationFrame(loop);
      else running = false;
    };

    const run = () => {
      if (!running) requestAnimationFrame(loop);
    };

    const burst = (x, y, n, pmin, pmax, amin, amax) => {
      for (let i = 0; i < n; i++) {
        const a = amin + Math.random() * (amax - amin);
        const p = pmin + Math.random() * (pmax - pmin);
        parts.push({
          x,
          y,
          vx: Math.cos(a) * p,
          vy: Math.sin(a) * p,
          r: Math.random() * 6.28,
          vr: (Math.random() - 0.5) * 0.4,
          s: 6 + Math.random() * 7,
          c: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
          sh: Math.random() < 0.5,
        });
      }
    };

    fxRef.current = { burst, run, size: () => ({ W, H }) };

    // The opening pop: two cannons off the bottom corners and a spray at the
    // hero's midline, 350ms in.
    let pop = 0;
    if (!reduce) {
      pop = setTimeout(() => {
        burst(W * 0.12, H + 10, 80, 9, 17, -1.9, -1.15);
        burst(W * 0.88, H + 10, 80, 9, 17, -2.0, -1.25);
        burst(W * 0.5, H * 0.34, 60, 6, 13, -Math.PI, 0);
        run();
      }, 350);
    }

    return () => {
      clearTimeout(pop);
      window.removeEventListener("resize", resize);
      parts.length = 0;
      fxRef.current = null;
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce) return undefined;
    const el = pricingRef.current;
    if (!el) return undefined;
    let seen = false;
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting || seen) return;
          seen = true;
          const fx = fxRef.current;
          if (!fx) return;
          const { W, H } = fx.size();
          fx.burst(W * 0.5, H * 0.18, 55, 6, 13, -Math.PI, 0);
          fx.run();
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const throwConfetti = (e) => {
    if (reduce) return;
    const fx = fxRef.current;
    if (!fx) return;
    const r = e.currentTarget.getBoundingClientRect();
    fx.burst(r.left + r.width / 2, r.top, 90, 7, 15, -Math.PI, 0);
    fx.run();
  };

  /* ---------- rental calculator ---------- */
  const total = useMemo(() => priceOf(qty), [qty]);

  const setItem = (key, value) =>
    setQty((prev) => ({ ...prev, [key]: Math.max(0, value) }));

  // Retrigger the bump keyframe on every change, the way the reference does
  // by removing the class and forcing a reflow before adding it back.
  useEffect(() => {
    const el = totalRef.current;
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }, [total]);

  const loadKit = (k) => {
    setKit(k.key);
    setQty({ ...k.qty });
    calcRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const chairs = Math.min(qty.chair, CHAIRVIZ_MAX);
  const chairsOver = qty.chair - CHAIRVIZ_MAX;

  /* ---------- before / after wipe ---------- */
  useEffect(() => {
    const ba = baRef.current;
    if (!ba) return undefined;
    let drag = false;
    const setX = (cx) => {
      const r = ba.getBoundingClientRect();
      const p = Math.max(2, Math.min(98, ((cx - r.left) / r.width) * 100));
      ba.style.setProperty("--x", `${p}%`);
    };
    const onDown = (e) => {
      drag = true;
      setX(e.clientX);
    };
    const onMove = (e) => {
      if (drag) setX(e.clientX);
    };
    const onUp = () => {
      drag = false;
    };
    ba.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      ba.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  /* ---------- FAQ ---------- */
  const toggleFaq = (i) => {
    const open = !openFaq.has(i);
    const a = faqRefs.current[i];
    if (a) a.style.maxHeight = open ? `${a.scrollHeight}px` : "0";
    setOpenFaq((prev) => {
      const next = new Set(prev);
      if (open) next.add(i);
      else next.delete(i);
      return next;
    });
  };

  return (
    <div ref={rootRef}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lenis/1.1.13/lenis.min.js"
        strategy="afterInteractive"
        onLoad={initLenis}
      />

      <canvas id="confetti" aria-hidden="true" ref={canvasRef} />

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
                  <a key={l.href} href={l.href} aria-current={l.href === HERE ? "page" : undefined}>
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
              key={l.label}
              href={l.href}
              aria-current={l.href === HERE ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <span className="idx">{l.idx}</span>
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <header className="s-hero">
        <div className="bg">
          <video className="hvid" autoPlay muted loop playsInline>
            <source src={ASSET("hero-bg.mp4")} type="video/mp4" />
          </video>
        </div>
        <div className="wrap">
          <p className="crumb">
            <a href="/">Home</a> / <a href="/#services">Services</a> / Party rentals
          </p>
          <div className="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 3 3 9h18L12 3Z" />
              <path d="M5 9v11M19 9v11M12 9v11M3 20h18" />
            </svg>
          </div>
          <h1>Party rentals</h1>
          <p className="tag">
            Chairs, tables, tents and more — delivered, set up, and handled by our local partners.
          </p>
          <div className="cta">
            <a className="btn btn-primary magnetic" href="/" {...magnetic}>
              Build my event <span className="ar">→</span>
            </a>
            <a className="btn btn-ghost magnetic" href="#pricing" {...magnetic}>
              See pricing
            </a>
            <button
              className="btn btn-ghost magnetic"
              id="throwBtn"
              type="button"
              {...magnetic}
              onClick={throwConfetti}
            >
              Throw confetti
            </button>
          </div>
        </div>
      </header>

      <section className="s-intro">
        <div className="wrap grid">
          <div className="rise">
            <p className="eyebrow">What it is</p>
            <img className="intro-img" src={ASSET("intro.jpg")} alt="" />
          </div>
          <div className="rise">
            <p className="lead">
              Everything that fills the room, priced by the piece. Tick the items you need and we
              coordinate delivery, setup and pickup with vetted Raleigh rental partners — so the
              logistics never land on you.
            </p>
            <div className="sp-points stagger">
              {INTRO_POINTS.map((pt) => (
                <div className="sp-point" key={pt.n}>
                  <div className="n">{pt.n}</div>
                  <p>{pt.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="s-ba">
        <div className="wrap">
          <div
            className="head rise"
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "20px",
              marginBottom: "26px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p className="eyebrow">See the difference</p>
              <h2 style={{ marginTop: "10px", fontSize: "clamp(1.9rem,3.6vw,2.8rem)" }}>
                Bare room to party
              </h2>
            </div>
            <span style={{ fontFamily: "var(--fmono)", fontSize: "12px", color: "var(--tx3)" }}>
              drag the handle ↔
            </span>
          </div>
          <div className="ba rise" ref={baRef}>
            <img className="before" src={ASSET("ba-bare.jpg")} alt="Bare venue" />
            <img className="after" src={ASSET("ba-styled.jpg")} alt="Venue with rentals" />
            <span className="lbl l">Bare venue</span>
            <span className="lbl r">With rentals</span>
            <div className="handle" />
            <div className="knob">↔</div>
          </div>
        </div>
      </section>

      <section className="s-price" id="pricing" ref={pricingRef}>
        <div className="wrap">
          <div className="head rise">
            <div>
              <p className="eyebrow">Start with a kit</p>
              <h2 style={{ marginTop: "10px" }}>Ready-made packages</h2>
            </div>
            <span style={{ fontFamily: "var(--fmono)", fontSize: "12px", color: "var(--tx3)" }}>
              [ sample · USD ]
            </span>
          </div>
          <div className="kits-grid stagger">
            {KITS.map((k) => (
              <button
                type="button"
                key={k.key}
                className={`kit-preset${kit === k.key ? " sel" : ""}`}
                onClick={() => loadKit(k)}
              >
                <div className="kit-inner">
                  <div className="kit-face kit-front">
                    <div className="kbg" style={{ backgroundImage: `url('${ASSET(k.img)}')` }} />
                    <span className="flip-hint">hover ↻</span>
                    <h4>{k.name}</h4>
                  </div>
                  <div className="kit-face kit-back">
                    <div>
                      <span className="kb-eyebrow">Includes</span>
                      <ul className="kb-items">
                        {k.includes.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="kb-foot">
                      <span className="kb-total">{money(priceOf(k.qty))}</span>
                      <span className="kb-go">Load →</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="calc rise" ref={calcRef}>
            <div>
              <h3>Build your rental estimate</h3>
              <p className="sub">Adjust the quantities — your total updates live, to the penny.</p>
              {ITEMS.map((it) => (
                <div className="calc-row" key={it.key}>
                  <div className="cl">
                    {it.label}
                    <small>{it.note}</small>
                  </div>
                  <div className="stepper">
                    <button
                      type="button"
                      aria-label={`Fewer ${it.label}`}
                      onClick={() => setItem(it.key, qty[it.key] - it.step)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={qty[it.key]}
                      aria-label={it.label}
                      onChange={(e) => setItem(it.key, parseInt(e.target.value, 10) || 0)}
                    />
                    <button
                      type="button"
                      aria-label={`More ${it.label}`}
                      onClick={() => setItem(it.key, qty[it.key] + it.step)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="calc-side">
              <div className="chairviz" aria-hidden="true">
                {Array.from({ length: chairs }, (_, i) => (
                  <i key={i} />
                ))}
                {chairsOver > 0 ? (
                  <span
                    style={{
                      fontFamily: "var(--fmono)",
                      fontSize: "11px",
                      color: "var(--ond2)",
                      marginLeft: "6px",
                    }}
                  >
                    +{chairsOver}
                  </span>
                ) : null}
              </div>
              <div>
                <div className="calc-total">
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
          </div>
        </div>
      </section>

      <section className="s-gal">
        <div className="wrap">
          <div className="head rise" style={{ marginBottom: "22px" }}>
            <p className="eyebrow">On the day</p>
            <h2 style={{ marginTop: "10px", fontSize: "clamp(1.9rem,3.6vw,2.8rem)" }}>
              Real celebrations
            </h2>
          </div>
          <div className="pola-wrap">
            {POLAROIDS.map((p) => (
              <div
                className="pola"
                key={p.img}
                style={{ left: p.left, top: p.top, transform: `rotate(${p.rot})` }}
              >
                <img src={ASSET(p.img)} alt="" />
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-tl">
        <div className="wrap">
          <div className="head rise" style={{ marginBottom: "30px" }}>
            <p className="eyebrow">How it works</p>
            <h2 style={{ marginTop: "10px", fontSize: "clamp(1.9rem,3.6vw,2.8rem)" }}>
              We handle the heavy lifting
            </h2>
          </div>
          <div className="tl stagger">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="ti">
                  <svg viewBox="0 0 24 24">{s.icon}</svg>
                </div>
                <div className="n">{s.n}</div>
                <h4>{s.h}</h4>
                <p>{s.p}</p>
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
              <div className={`faq-item${openFaq.has(i) ? " open" : ""}`} key={f.q}>
                <button
                  className="faq-q"
                  type="button"
                  aria-expanded={openFaq.has(i)}
                  onClick={() => toggleFaq(i)}
                >
                  {f.q}
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
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s-cta">
        <div
          className="cta-bg"
          style={{ backgroundImage: `url('${ASSET("gallery-cta-bg.jpg")}')` }}
        />
        <div className="cta-veil" />
        <div className="glow" />
        <div className="wrap">
          <p className="eyebrow rise">Ready when you are</p>
          <h2 className="rise" style={{ marginTop: "12px" }}>
            Add Party rentals to your event.
          </h2>
          <p className="rise">
            Tick it in the builder, watch the total update live, and send one request.
          </p>
          <a className="btn btn-primary magnetic rise" href="/" {...magnetic}>
            Build my event <span className="ar">→</span>
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
              <a className="fl" href="/#about">
                About
              </a>
              <a className="fl" href="/reviews">
                Reviews
              </a>
              <a className="fl" href="/">
                Home
              </a>
            </div>
            <div>
              <h4>Get started</h4>
              <a className="fl" href="/">
                Build my event
              </a>
              <a className="fl" href="/#events">
                Featured events
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
