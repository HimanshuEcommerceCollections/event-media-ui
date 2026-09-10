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
//
// The catalogue itself — nav links, intro points, item prices, kit presets,
// polaroids, steps and FAQs — arrives from GET
// /api/v1/content/services/party-rentals, so a price change is a seed edit
// rather than a code edit. Only the behaviour stays here.

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StepIcon from "../StepIcon";
import "./party-rentals.css";
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

const CONFETTI_COLORS = ["#97c459", "#639922", "#EF9F27", "#e24b4a", "#3D5AC9", "#D4537E", "#f4f3ee"];

const money = (c) =>
  `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Sums a quantity map against the item list the API supplied. */
const priceOf = (items, qty) =>
  items.reduce((sum, it) => sum + (qty[it.key] || 0) * it.unitCents, 0);

const ASSET = (name) => `/assets/party-rentals/${name}`;

export default function PartyRentalsView({ content }) {
  // Named locally so the render below reads the way it did when these were
  // module constants.
  const { pricing, blocks, navigation } = content;
  const SERVICE_LINKS = navigation.services;
  const MENU_LINKS = navigation.menu;
  const INTRO_POINTS = blocks.intro ?? [];
  const ITEMS = pricing.items;
  const KITS = blocks.kit ?? [];
  const POLAROIDS = blocks.polaroid ?? [];
  const STEPS = blocks.step ?? [];
  const FAQS = blocks.faq ?? [];
  // The chair strip stops drawing past this and prints the remainder.
  const CHAIRVIZ_MAX = pricing.chairVizMax;

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
  const [qty, setQty] = useState(pricing.startQuantities);
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
  const total = useMemo(() => priceOf(ITEMS, qty), [ITEMS, qty]);

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
    setQty({ ...k.quantities });
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
                  <a key={l.href} href={l.href} aria-current={l.isCurrent ? "page" : undefined}>
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
                <div className="sp-point" key={pt.name}>
                  <div className="n">{pt.name}</div>
                  <p>{pt.text}</p>
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
                    <div className="kbg" style={{ backgroundImage: `url('${ASSET(k.imageFile)}')` }} />
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
                      <span className="kb-total">{money(priceOf(ITEMS, k.quantities))}</span>
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
                key={p.imageFile}
                style={{ left: p.left, top: p.top, transform: `rotate(${p.rotate})` }}
              >
                <img src={ASSET(p.imageFile)} alt="" />
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

      <SiteFooter />
    </div>
  );
}
