"use client";

// Drone video service page — ported from
// public/assets/drone-video-extracted/drone-video.html.
// drone-video.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// IntersectionObserver threshold .15, nav "scrolled" at y > 40, Lenis
// duration 1.1, magnetic offsets .25/.4, the cent-based flight calculator,
// and the FPV cockpit HUD (46px compass cells, playbackRate .5 + v*1.7,
// heading 4 + v*22 deg/s, battery drain .25 + v*.5 %/s with an 18% floor).
//
// Deliberately not ported (a no-op in the reference itself): the `.s-fly`
// click-to-plot flight-mission planner. It has a full CSS block and a JS
// module, but no matching markup in the reference body — the design settled
// on the FPV cockpit as its signature section and never swept up the earlier
// iteration. That JS bails on the missing `#flyMap`, so the reference renders
// exactly what this component does. See drone-video.css for the same note.
//
// The cockpit HUD writes through refs rather than state on purpose: the
// reference repaints five readouts every animation frame, and routing that
// through React state would re-render the page 60 times a second.

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import "./drone-video.css";
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

// The FPV compass strip. Pure geometry for the HUD, so it stays here rather
// than travelling with the catalogue: two loops of 0..345 in 15° steps, so the
// strip wraps without a seam.
const compassLabel = (d) =>
  d === 0 ? "N" : d === 90 ? "E" : d === 180 ? "S" : d === 270 ? "W" : String(d);

const COMPASS_TICKS = [0, 1].flatMap((loop) =>
  Array.from({ length: 24 }, (_, i) => ({ key: `${loop}-${i}`, deg: i * 15 })),
);
const COMPASS_CELL = 46; // px per tick, matching .fpv-comp-strip span
const COMPASS_LOOP = 24 * COMPASS_CELL;

const money = (c) =>
  `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const pad = (n) => (n < 10 ? `0${n}` : String(n));

const ASSET = (name) => `/assets/drone-video/${name}`;

export default function DroneVideoView({ content }) {
  // Named locally so the render below reads the way it did when these were
  // module constants.
  const { pricing, blocks, navigation } = content;
  const SERVICE_LINKS = navigation.services;
  const MENU_LINKS = navigation.menu;
  const INTRO_POINTS = blocks.intro ?? [];
  const FAQS = blocks.faq ?? [];
  const INCLUDED = (blocks.included ?? []).map((i) => i.text);
  const { packs: PACKS, addons: ADDONS } = pricing;

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

  /* ---------- flight calculator ---------- */
  const [packIdx, setPackIdx] = useState(0);
  const [addonsOn, setAddonsOn] = useState(() => new Set());

  const total =
    PACKS[packIdx].cents + [...addonsOn].reduce((sum, i) => sum + ADDONS[i].cents, 0);

  const toggleAddon = (i) => {
    setAddonsOn((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  /* ---------- FAQ ---------- */
  const faqRefs = useRef([]);
  const [openFaq, setOpenFaq] = useState(() => new Set());

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

  /* ---------- FPV cockpit ---------- */
  const [throttle, setThrottle] = useState(32);
  const throttleRef = useRef(32);
  const vidRef = useRef(null);
  const compRef = useRef(null);
  const horizRef = useRef(null);
  const altRef = useRef(null);
  const spdRef = useRef(null);
  const batRef = useRef(null);
  const tcRef = useRef(null);
  const gpsRef = useRef(null);

  // playbackRate: hover .5 → full throttle 2.2, as in the reference.
  useEffect(() => {
    throttleRef.current = throttle;
    if (vidRef.current) vidRef.current.playbackRate = 0.5 + (throttle / 100) * 1.7;
  }, [throttle]);

  useEffect(() => {
    if (reduce) return undefined;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    let heading = 20;
    let bat = 96;

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const v = throttleRef.current / 100;

      heading += (4 + v * 22) * dt;
      const strip = compRef.current;
      if (strip?.parentElement) {
        const cx = strip.parentElement.clientWidth / 2;
        const x = cx - (((heading / 15) * COMPASS_CELL) % COMPASS_LOOP) - COMPASS_CELL / 2;
        strip.style.transform = `translateX(${x}px)`;
      }

      const roll = Math.sin(t * 0.7) * 4 + Math.sin(t * 1.9) * 1.5;
      if (horizRef.current) {
        horizRef.current.style.transform = `translate(-50%,-50%) rotate(${roll.toFixed(2)}deg)`;
      }

      if (altRef.current) altRef.current.textContent = `${Math.round(72 + Math.sin(t * 0.5) * 9)} m`;
      if (spdRef.current) spdRef.current.textContent = `${Math.round(20 + v * 92)} km/h`;

      bat -= dt * (0.25 + v * 0.5);
      if (bat < 18) bat = 18;
      if (batRef.current) batRef.current.textContent = `${Math.round(bat)}%`;

      const s = Math.floor(vidRef.current?.currentTime || 0);
      if (tcRef.current) tcRef.current.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

      if (gpsRef.current) {
        const lat = (50.8225 + Math.sin(t * 0.3) * 0.004).toFixed(4);
        const lon = (0.1372 + Math.cos(t * 0.3) * 0.004).toFixed(4);
        gpsRef.current.textContent = `${lat}° N, ${lon}° W · Brighton`;
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <div ref={rootRef}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lenis/1.1.13/lenis.min.js"
        strategy="afterInteractive"
        onLoad={initLenis}
      />

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

      <header className="s-hero">
        <div className="bg">
          <video autoPlay muted loop playsInline poster={ASSET("hero-poster.jpg")}>
            <source src={ASSET("hero-bg.mp4")} type="video/mp4" />
          </video>
        </div>
        <div className="wrap">
          <p className="crumb">
            <a href="/">Home</a> / <a href="/#services">Services</a> / Drone video
          </p>
          <span className="b2b-badge">B2B · Commercial</span>
          <div className="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="5" cy="6" r="2.4" />
              <circle cx="19" cy="6" r="2.4" />
              <rect x="9" y="10" width="6" height="4.5" rx="1.3" />
              <path d="M6.6 7.6 9.6 11M17.4 7.6 14.4 11M12 14.5V18M9.5 18h5" />
            </svg>
          </div>
          <h1>Drone video</h1>
          <p className="tag">Aerial footage as an add-on or a standalone flight.</p>
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

      <section className="s-intro">
        <div className="wrap grid">
          <div className="rise">
            <p className="eyebrow">What it is</p>
            <div className="intro-media">
              <img src={ASSET("intro.jpg")} alt="Pilot prepping a drone" />
            </div>
          </div>
          <div className="rise">
            <p className="lead">
              Add scale and polish with the sky. Book aerial video as an add-on to another shoot or
              as a standalone flight, with an edited highlight reel on request.
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
        <div className="wrap">
          <div className="head rise">
            <div>
              <p className="eyebrow">Sample pricing</p>
              <h2 style={{ marginTop: "10px" }}>Priced up front</h2>
            </div>
            <span style={{ fontFamily: "var(--fmono)", fontSize: "12px", color: "var(--tx3)" }}>
              [ sample · USD ]
            </span>
          </div>
          <div className="pv-grid rise">
            <div className="pv-calc">
              <div className="pv-sub">Flight type</div>
              <div className="pv-packs">
                {PACKS.map((p, i) => (
                  <button
                    type="button"
                    key={p.key}
                    className={`pv-pack${packIdx === i ? " on" : ""}`}
                    onClick={() => setPackIdx(i)}
                  >
                    <span className="nm">{p.name}</span>
                    <span className="pr">{money(p.cents)}</span>
                  </button>
                ))}
              </div>
              <div className="pv-sub">Add-ons</div>
              <div className="addons">
                {ADDONS.map((a, i) => (
                  <div
                    key={a.key}
                    className={`addon${addonsOn.has(i) ? " on" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleAddon(i)}
                    onKeyDown={(e) => {
                      if (e.key !== " " && e.key !== "Enter") return;
                      e.preventDefault();
                      toggleAddon(i);
                    }}
                  >
                    <span className="nm">{a.name}</span>
                    <span className="rt">
                      <span className="pr">+{money(a.cents)}</span>
                      <span className="chk">
                        <span>✓</span>
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="calc-total">
                <span className="lbl">Estimated total</span>
                <span className="amt">{money(total)}</span>
              </div>
            </div>
            <aside className="pv-aside">
              <img src={ASSET("hero-poster.jpg")} alt="Drone in flight" />
              <div className="pv-inc">
                <h4>Every flight includes</h4>
                <ul>
                  {INCLUDED.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="s-fpv" id="fpv">
        <div className="wrap">
          <div className="booth-head rise">
            <p className="eyebrow">In the pilot’s seat</p>
            <h2>Fly it FPV</h2>
          </div>
          <div className="fpv rise">
            <div className="fpv-stage">
              <video ref={vidRef} autoPlay muted loop playsInline poster={ASSET("fpv-poster.jpg")}>
                <source src={ASSET("fpv-bg.mp4")} type="video/mp4" />
              </video>
              <div className="fpv-hud">
                <span className="fpv-cor tl" />
                <span className="fpv-cor tr" />
                <span className="fpv-cor bl" />
                <span className="fpv-cor br" />
                <div className="fpv-compass">
                  <div className="fpv-comp-strip" ref={compRef}>
                    {COMPASS_TICKS.map((tick) => (
                      <span key={tick.key} className={tick.deg % 90 === 0 ? "card" : undefined}>
                        {compassLabel(tick.deg)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="fpv-comp-cur" />
                <div className="fpv-horizon" ref={horizRef}>
                  <span className="line" />
                  <span className="tick l" />
                  <span className="tick r" />
                </div>
                <div className="fpv-cross" />
                <div className="fpv-tl">
                  <div className="fpv-cell">
                    <k>ALT</k>
                    <v ref={altRef}>78 m</v>
                  </div>
                  <div className="fpv-cell">
                    <k>SPD</k>
                    <v ref={spdRef}>42 km/h</v>
                  </div>
                </div>
                <div className="fpv-tr">
                  <div className="fpv-rec">
                    <i />
                    REC <span ref={tcRef}>00:00</span>
                  </div>
                  <div className="fpv-cell">
                    <k>BAT</k>
                    <v ref={batRef}>96%</v>
                  </div>
                </div>
                <div className="fpv-gps" ref={gpsRef}>
                  50.8225° N, 0.1372° W · Brighton
                </div>
              </div>
            </div>
            <div className="fpv-throttle">
              <span>Hover</span>
              <input
                type="range"
                min="0"
                max="100"
                value={throttle}
                aria-label="throttle"
                onChange={(e) => setThrottle(Number(e.target.value))}
              />
              <span>Full throttle</span>
            </div>
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
        <div className="cta-bg" style={{ backgroundImage: `url('${ASSET("cta-bg.jpg")}')` }} />
        <div className="cta-veil" />
        <div className="glow" />
        <div className="wrap">
          <p className="eyebrow rise">Ready when you are</p>
          <h2 className="rise" style={{ marginTop: "12px" }}>
            Add Drone video to your event.
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
