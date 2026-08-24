"use client";

// Landing / Home — ported from designs/Events-Media-Home-SHARE.html.
// home.css is that file's <style> block copied verbatim, so all layout,
// spacing, tokens and keyframes come from the reference rather than a redraw.
// The reference's vanilla JS is reimplemented below with the same thresholds,
// durations and easing.
//
// Two structural notes:
//  - The reference moves #services directly after the hero at runtime
//    (insertBefore). It is rendered in that final position here instead.
//  - The reference's second <script> targets #heroExpand, which no longer
//    exists in its markup, so it is a no-op. It is intentionally not ported.
//    The matching `.hero.expand` / `.cta` rules stay in home.css unused, as
//    they are in the reference.

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import "./home.css";

// Icons keyed the way the API reports them (services.iconKey), so the catalogue
// can drive which frame shows which glyph. Paths are verbatim from the reference.
const ICONS = {
  tent: (
    <>
      <path d="M12 3 3 9h18L12 3Z" />
      <path d="M5 9v11M19 9v11M12 9v11M3 20h18" />
    </>
  ),
  star: <path d="M12 2.5l2.2 5.3 5.8.5-4.4 3.8 1.3 5.6L12 20.7l-4.2 2 1.3-5.6L4.7 8.3l5.8-.5L12 2.5Z" />,
  disc: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </>
  ),
  camera: (
    <>
      <rect x="2.5" y="6.5" width="14" height="11" rx="2.5" />
      <path d="M16.5 10l5-2.5v9L16.5 14" />
      <circle cx="8.5" cy="12" r="2.3" />
    </>
  ),
  house: (
    <>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9.5 20v-5h5v5" />
    </>
  ),
  drone: (
    <>
      <circle cx="5" cy="6" r="2.4" />
      <circle cx="19" cy="6" r="2.4" />
      <rect x="9" y="10" width="6" height="4.5" rx="1.3" />
      <path d="M6.6 7.6 9.6 11M17.4 7.6 14.4 11M12 14.5V18M9.5 18h5" />
    </>
  ),
};

// The reference splits `.split` / #heroH1 text into per-word spans at runtime and
// stamps a 0.05s-per-word transition delay. Pre-rendered here to the same result.
const Word = ({ children, i, cls }) => (
  <span className={cls ? `wd ${cls}` : "wd"}>
    <span style={{ transitionDelay: `${(i * 0.05).toFixed(2)}s` }}>{children}</span>
  </span>
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

const Logo = () => (
  <>
    <span className="rings">
      <i />
      <i />
    </span>
    <b>events &amp; media</b>
  </>
);

function ServiceCard({ s }) {
  return (
    <a className="svc" href="#" data-cursor="view">
      <div className="scene has-img">
        <img className="ph" src={s.imagePath} alt={s.imageAlt} />
        <span className="no">{s.no}</span>
        {s.isB2b ? <span className="b2b">B2B</span> : null}
        <span className="ic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[s.iconKey] ?? null}
          </svg>
        </span>
      </div>
      <div className="body">
        <h3>{s.title}</h3>
        <p>{s.blurb}</p>
        <span className="price">{s.priceLabel}</span>
      </div>
    </a>
  );
}

export default function HomeView({ content }) {
  const { services, events, marquee, testimonials, stats } = content;
  const rootRef = useRef(null);
  const lenisRef = useRef(null);
  const introRef = useRef(null);
  const filmRef = useRef(null);
  const progRef = useRef(null);
  const navRef = useRef(null);
  const glowRef = useRef(null);
  const clapperRef = useRef(null);
  const evTrackRef = useRef(null);
  const audioRef = useRef(null);

  const [reduce, setReduce] = useState(false);
  const [entered, setEntered] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [clapped, setClapped] = useState(false);
  const [aboutIn, setAboutIn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [monIdx, setMonIdx] = useState(0);
  const [flick, setFlick] = useState(false);

  /* ---------- reduced motion ---------- */
  useEffect(() => {
    setReduce(matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* ---------- smooth scroll (Lenis, same CDN build as the reference) ---------- */
  const initLenis = useCallback(() => {
    if (reduce || !window.Lenis || lenisRef.current) return;
    const lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [reduce]);

  /* ---------- hero entrance ---------- */
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), reduce ? 0 : 1000);
    return () => clearTimeout(id);
  }, [reduce]);

  /* ---------- intro video: play once, then fade into the looping bg ---------- */
  useEffect(() => {
    const intro = introRef.current;
    if (!intro) return undefined;
    const drop = () => setIntroGone(true);
    intro.addEventListener("ended", drop);
    const p = intro.play();
    if (p && p.catch) p.catch(drop);
    if (reduce) drop();
    const safety = setTimeout(drop, 6000);
    return () => {
      intro.removeEventListener("ended", drop);
      clearTimeout(safety);
    };
  }, [reduce]);

  /* ---------- scroll reveals + counters ---------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const count = (el) => {
      const to = +el.getAttribute("data-count");
      const pre = el.getAttribute("data-prefix") || "";
      const suf = el.getAttribute("data-suffix") || "";
      const st = performance.now();
      const d = 1200;
      const tick = (now) => {
        const p = Math.min(1, (now - st) / d);
        el.textContent = pre + Math.round(to * (0.5 - Math.cos(p * Math.PI) / 2)) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      tick(st);
    };

    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            if (e.target.hasAttribute("data-count")) count(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    root.querySelectorAll(".rise,.wipe,.scaley,.stagger,.split,[data-count]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---------- progress bar, nav state, parallax, film roll ---------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const plx = [...root.querySelectorAll("[data-parallax]")];

    const onScroll = () => {
      const y = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      if (progRef.current) progRef.current.style.width = `${dh > 0 ? (y / dh) * 100 : 0}%`;
      if (navRef.current) navRef.current.classList.toggle("scrolled", y > 40);
      const vh = window.innerHeight;
      plx.forEach((el) => {
        const r = el.getBoundingClientRect();
        const off = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translateY(${(off * -24).toFixed(1)}px)`;
      });
      const fs = filmRef.current;
      if (fs && !reduce) {
        const rr = fs.getBoundingClientRect();
        const pp = Math.max(0, Math.min(1, (vh * 0.82 - rr.top) / (vh * 0.55)));
        fs.style.setProperty("--roll", (1 - pp).toFixed(3));
        fs.style.setProperty("--reelrot", `${(pp * 720).toFixed(0)}deg`);
        fs.classList.toggle("open", pp > 0.96);
      }
    };

    // Reduced motion: the reference unrolls the reel immediately.
    if (filmRef.current && reduce) {
      filmRef.current.classList.add("open");
      filmRef.current.style.setProperty("--roll", "0");
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce]);

  /* ---------- hero glow follows the pointer ---------- */
  useEffect(() => {
    if (reduce) return undefined;
    const onMove = (e) => {
      const glow = glowRef.current;
      if (!glow) return;
      glow.style.setProperty("--mx", `${(e.clientX / window.innerWidth) * 100}%`);
      glow.style.setProperty("--my", `${(e.clientY / window.innerHeight) * 100}%`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  /* ---------- clapperboard ---------- */
  const clack = useCallback(() => {
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const actx = audioRef.current;
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(170, actx.currentTime);
      g.gain.setValueAtTime(0.0001, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.13, actx.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.09);
      o.connect(g);
      g.connect(actx.destination);
      o.start();
      o.stop(actx.currentTime + 0.1);
    } catch (e) {
      /* no audio available */
    }
  }, []);

  const doClap = useCallback(
    (sound) => {
      setClapped(true);
      setAboutIn(true);
      if (sound) clack();
    },
    [clack]
  );

  useEffect(() => {
    const el = clapperRef.current;
    if (!el) return undefined;
    if (reduce) {
      doClap(false);
      return undefined;
    }
    const io = new IntersectionObserver(
      (es, o) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            doClap(false);
            o.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, doClap]);

  const replay = () => {
    setClapped(false);
    if (clapperRef.current) void clapperRef.current.offsetWidth;
    setTimeout(() => doClap(true), 200);
  };

  /* ---------- testimonial monitor ---------- */
  const go = useCallback(
    (n) => {
      const next = (n + testimonials.length) % testimonials.length;
      if (reduce) {
        setMonIdx(next);
        return;
      }
      setFlick(true);
      setTimeout(() => {
        setMonIdx(next);
        setFlick(false);
      }, 170);
    },
    [reduce]
  );

  const [monPaused, setMonPaused] = useState(false);
  const [monTick, setMonTick] = useState(0);
  useEffect(() => {
    if (reduce || monPaused) return undefined;
    const id = setTimeout(() => {
      go(monIdx + 1);
      setMonTick((t) => t + 1);
    }, 5200);
    return () => clearTimeout(id);
  }, [reduce, monPaused, monIdx, monTick, go]);

  const restart = () => setMonTick((t) => t + 1);

  /* ---------- build-event modal ---------- */
  const openM = useCallback((e) => {
    if (e) e.preventDefault();
    setModalOpen(true);
    document.body.style.overflow = "hidden";
    if (lenisRef.current) lenisRef.current.stop();
  }, []);

  const closeM = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = "";
    if (lenisRef.current) lenisRef.current.start();
  }, []);

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
      if (e.key !== "Escape") return;
      if (modalOpen) closeM();
      else if (menuOpen) setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, menuOpen, closeM, setMenu]);

  /* ---------- services dropdown ---------- */
  useEffect(() => {
    if (!dropOpen) return undefined;
    const onDoc = () => setDropOpen(false);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [dropOpen]);

  /* ---------- drag-to-scroll featured events ---------- */
  useEffect(() => {
    const track = evTrackRef.current;
    if (!track) return undefined;
    let down = false;
    let sx = 0;
    let sl = 0;
    const onDown = (e) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      setDragging(true);
      sx = e.clientX;
      sl = track.scrollLeft;
    };
    const onMove = (e) => {
      if (down) track.scrollLeft = sl - (e.clientX - sx);
    };
    const onUp = () => {
      down = false;
      setDragging(false);
    };
    track.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      track.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const t = testimonials[monIdx];
  // The reference duplicates the film frames for a seamless loop unless the
  // user prefers reduced motion.
  const filmCards = reduce ? services : [...services, ...services];

  return (
    <div ref={rootRef}>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/lenis/1.1.13/lenis.min.js" strategy="afterInteractive" onLoad={initLenis} />

      <div className="progress" id="progress" ref={progRef} />
      <div className="demo">
        Demo build · <b>synthetic data</b> · noindex · not a live booking service
      </div>

      <nav className="nav" ref={navRef}>
        <div className="wrap">
          <a className="logo" href="#" data-cursor="link">
            <Logo />
          </a>
          <div className="pill-nav">
            <a className="pn-item active" href="/">
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
                <a href="/services/party-rentals">Party rentals</a>
                <a href="/services/entertainers">Entertainers</a>
                <a href="/services/dj-music">DJ + music</a>
                <a href="/services/photo-video">Photo + video</a>
                <a href="/services/virtual-tours">Virtual tours</a>
                <a href="/services/drone-video">Drone video</a>
              </div>
            </div>
            <a className="pn-item" href="#events">
              Events
            </a>
            <a className="pn-item" href="#testimonials">
              Reviews
            </a>
            <a className="pn-item pn-cta" href="#">
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
            Menu{" "}
            <span className="bars" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </nav>

      <header className="hero">
        <video className="hero-video" autoPlay muted loop playsInline preload="auto" poster="/assets/hero-poster.jpg">
          <source src="/assets/hero.mp4" type="video/mp4" />
        </video>
        <video
          className={`hero-intro${introGone ? " gone" : ""}`}
          id="heroIntro"
          ref={introRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster="/assets/hero-intro-poster.jpg"
        >
          <source src="/assets/hero-intro.mp4" type="video/mp4" />
        </video>
        <div className="hero-veil" />
        <div className="glow" id="heroGlow" ref={glowRef} />
        <div className="grain" />
        <div className="wrap">
          <div className="hero-copy">
            <p className={`eyebrow rise${entered ? " in" : ""}`}>Raleigh event marketplace</p>
            <h1 id="heroH1" className={entered ? "in" : undefined}>
              <Word i={0}>One</Word> <Word i={1}>request.</Word>
              <br />
              <Word i={2} cls="a">
                Whole
              </Word>{" "}
              <Word i={3} cls="a">
                event
              </Word>
              <br />
              <Word i={4}>covered.</Word>
            </h1>
            <p className={`sub${entered ? " in" : ""}`}>
              Describe the day once, tick every service it needs, watch the package total build live, and submit a single
              request.
            </p>
            <div className={`hero-cta${entered ? " in" : ""}`}>
              <a className="btn btn-primary btn-lg" href="#" data-cursor="link" onClick={openM}>
                <span className="t">
                  Build my event <span className="ar">→</span>
                </span>
              </a>
              <a className="btn btn-ghost btn-lg" href="#services" data-cursor="link">
                <span className="t">See services</span>
              </a>
            </div>
            <p className={`hero-note${entered ? " in" : ""}`}>No account needed · one-business-day response</p>
          </div>
        </div>
      </header>

      {/* The reference relocates this section to sit directly after the hero. */}
      <section className="services" id="services" data-moved>
        <div className="wrap">
          <div className="sec-head rise">
            <div>
              <p className="eyebrow">What we cover</p>
              <h2 style={{ marginTop: 12 }}>Six services, one shoot</h2>
            </div>
            <a
              className="btn btn-ghost"
              href="#"
              data-cursor="link"
              style={{ color: "var(--tx)", borderColor: "var(--bds)" }}
              onClick={openM}
            >
              <span className="t">
                Build my event <span className="ar">→</span>
              </span>
            </a>
          </div>
          <div className="filmstrip roll" id="filmstrip" ref={filmRef}>
            <div className="reel-coil" aria-hidden="true" />
            <div className="reel-coil right" aria-hidden="true" />
            <div className="film-viewport">
              <div className="film-track" id="filmTrack">
                {filmCards.map((s, i) => (
                  <ServiceCard key={`${s.slug}-${i}`} s={s} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marq">
        <div className="marq-row">
          {[...marquee, ...marquee].map((m, i) => (
            <span className="mi" key={i}>
              {m}
            </span>
          ))}
        </div>
      </div>

      <section className="statement">
        <div className="wrap">
          <p className="big split">
            <Word i={0}>One</Word> <Word i={1}>intake</Word> <Word i={2}>for</Word> <Word i={3}>the</Word>{" "}
            <Word i={4} cls="a">
              whole event
            </Word>{" "}
            <Word i={5}>—</Word> <Word i={6}>coordinated,</Word> <Word i={7}>not</Word> <Word i={8}>chaotic.</Word>
          </p>
          <p className="sm rise">
            Events &amp; Media absorbs party rentals, entertainers, DJs, photo and video, plus a commercial media line
            for realtors — behind a single request with a live, penny-accurate total no local competitor offers.
          </p>
        </div>
      </section>

      <section className="about" id="about">
        <div
          className={`clapper${clapped ? " clapped" : ""}`}
          id="clapper"
          ref={clapperRef}
          role="button"
          tabIndex={0}
          aria-label="About Events and Media"
          onClick={replay}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              replay();
            }
          }}
        >
          <div className="board-top" aria-hidden="true" />
          <div className="arm" aria-hidden="true" />
          <div className="clap-face" style={{ backgroundImage: "url('/assets/clapper.jpg')" }}>
            <div className="clap-inner">
              <div className="slate-hdr">
                <div className="f">
                  <div className="k">Production</div>
                  <div className="v">Events &amp; Media</div>
                </div>
                <div className="f">
                  <div className="k">Scene</div>
                  <div className="v">01 · Whole Event</div>
                </div>
                <div className="f">
                  <div className="k">Take</div>
                  <div className="v">One request</div>
                </div>
              </div>
              <div className={`about-copy${aboutIn ? " in" : ""}`} id="aboutCopy">
                <p className="eyebrow">About us</p>
                <h2>Raleigh&apos;s whole-event marketplace.</h2>
                <p>
                  Events &amp; Media started with one frustration: planning a celebration meant juggling a dozen
                  vendors, a dozen quotes and a dozen conversations. We put the whole event behind a single intake —
                  describe the day once, tick the services, and watch one honest total come together.
                </p>
                <p>
                  From backyard birthdays to 300-guest galas, plus a commercial media line for realtors, every request
                  lands with a coordinator who keeps the day on track. One request, whole event covered.
                </p>
                <div className="about-points">
                  <div className="about-point">
                    <div className="n">Local</div>
                    <p>Built for Raleigh venues and vendors.</p>
                  </div>
                  <div className="about-point">
                    <div className="n">Transparent</div>
                    <p>A live, penny-accurate total.</p>
                  </div>
                  <div className="about-point">
                    <div className="n">Coordinated</div>
                    <p>One team, end to end.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="clap-hint">click to clap the board</p>
        </div>
      </section>

      <section className="stats">
        <div className="wrap">
          <div className="stats-grid stagger">
            {stats.map((st) => (
              <div className="stat" key={st.key}>
                {/* The counter reads data-count / data-prefix / data-suffix off the
                    node, so the optional attributes are only emitted when set. */}
                <div
                  className="n"
                  data-count={st.value}
                  {...(st.prefix ? { "data-prefix": st.prefix } : {})}
                  {...(st.suffix ? { "data-suffix": st.suffix } : {})}
                >
                  0
                </div>
                <div className="k">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="events" id="events">
        <div className="wrap">
          <div className="sec-head rise">
            <div>
              <p className="eyebrow">Built with Events &amp; Media</p>
              <h2 style={{ marginTop: 12 }}>Featured events</h2>
              <p className="ev-hint">drag to explore →</p>
            </div>
            <span style={{ fontFamily: "var(--fmono)", fontSize: 12, color: "var(--tx3)" }}>[ sample packages ]</span>
          </div>
        </div>
        <div className="wrap">
          <div className={`ev-track${dragging ? " drag" : ""}`} id="evTrack" ref={evTrackRef}>
            {events.map((e) => (
              <div className="ev" data-cursor="view" key={e.slug}>
                <div className="still">
                  <img className="img" data-parallax="0.1" src={e.imagePath} alt={e.imageAlt} />
                </div>
                <span className="tot">{e.totalLabel}</span>
                <div className="meta">
                  <span className="nm">{e.name}</span>
                  <span className="yr">{e.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tmb" id="testimonials">
        <div className="wrap">
          <div className="sec-head rise">
            <div>
              <p className="eyebrow">Dailies</p>
              <h2 style={{ marginTop: 12 }}>What people say</h2>
            </div>
            <span style={{ fontFamily: "var(--fmono)", fontSize: 12, color: "var(--tx3)" }}>[ sample reviews ]</span>
          </div>
          <div
            className={`monitor rise${flick ? " flick" : ""}`}
            id="monitor"
            onMouseEnter={() => setMonPaused(true)}
            onMouseLeave={() => setMonPaused(false)}
          >
            <div className="mon-screen">
              <div className="mon-rec" aria-hidden="true">
                <span className="dot" /> REC
              </div>
              <div className="mon-time" id="monTime" aria-hidden="true">
                {`0${monIdx + 1}`.slice(-2)}/0{testimonials.length}
              </div>
              <div className="mon-scan" aria-hidden="true" />
              <div className="mon-content" id="monContent">
                <div className="stars">★★★★★</div>
                <p className="q" id="monQuote">
                  {`“${t.quote}”`}
                </p>
                <div className="who">
                  <span className="av" id="monAv">
                    {t.initials}
                  </span>
                  <div>
                    <div className="nm" id="monName">
                      {t.name}
                    </div>
                    <div className="rl" id="monRole">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mon-controls">
              <button
                id="monPrev"
                aria-label="Previous review"
                onClick={() => {
                  go(monIdx - 1);
                  restart();
                }}
              >
                ‹
              </button>
              <div className="mon-dots" id="monDots">
                {testimonials.map((_, k) => (
                  <i
                    key={k}
                    className={k === monIdx ? "on" : undefined}
                    onClick={() => {
                      go(k);
                      restart();
                    }}
                  />
                ))}
              </div>
              <button
                id="monNext"
                aria-label="Next review"
                onClick={() => {
                  go(monIdx + 1);
                  restart();
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="foot" id="contact">
        <div className="wrap">
          <div className="cols">
            <div>
              <div className="logo">
                <Logo />
              </div>
              <p className="desc">
                One request. Whole event covered. A Raleigh marketplace for celebrations and commercial media.
              </p>
            </div>
            <div>
              <h4>Services</h4>
              {["Party rentals", "Entertainers", "DJ + music", "Photo + video"].map((l) => (
                <a className="fl" href="#" data-cursor="link" key={l}>
                  {l}
                </a>
              ))}
            </div>
            <div>
              <h4>Commercial</h4>
              {["Virtual tours", "Drone video", "For realtors"].map((l) => (
                <a className="fl" href="#" data-cursor="link" key={l}>
                  {l}
                </a>
              ))}
            </div>
            <div>
              <h4>Company</h4>
              {["How it works", "Become a vendor", "About", "FAQ"].map((l) => (
                <a className="fl" href="#" data-cursor="link" key={l}>
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div className="fine">
            <span>© 2026 Events &amp; Media · Demo build · noindex</span>
            <span>Privacy · Terms · Synthetic data only</span>
          </div>
        </div>
      </footer>

      <div className={`menu-overlay${menuOpen ? " open" : ""}`} id="menuOverlay" aria-hidden={!menuOpen}>
        <p className="menu-eyebrow">Now showing — Events &amp; Media</p>
        <nav className="menu-nav" id="menuNav" aria-label="Menu">
          <a href="#services" onClick={() => setMenu(false)}>
            <span className="idx">01</span>Services
          </a>
          <a href="#events" onClick={() => setMenu(false)}>
            <span className="idx">02</span>Events
          </a>
          <a href="#contact" onClick={() => setMenu(false)}>
            <span className="idx">03</span>Contact
          </a>
          <a
            href="#"
            className="build"
            onClick={(e) => {
              e.preventDefault();
              setMenu(false);
              setTimeout(openM, 360);
            }}
          >
            <span className="idx">04</span>Build my event
          </a>
        </nav>
        <p className="menu-foot">Raleigh, NC · one request, whole event covered</p>
      </div>

      <div
        className={`modal${modalOpen ? " open" : ""}`}
        id="modal"
        aria-hidden={!modalOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeM();
        }}
      >
        <div className="modal-card" role="dialog" aria-modal="true" aria-label="Build my event">
          <button className="modal-x" id="modalX" aria-label="Close" onClick={closeM}>
            ×
          </button>
          <p className="eyebrow" style={{ color: "var(--txacc)" }}>
            Ready when you are
          </p>
          <h3>Tell us about the day.</h3>
          <p className="mtxt">We&apos;ll bring the rest — one consolidated request, one business day to reply.</p>
          <a className="btn btn-primary btn-lg" href="#">
            <span className="t">
              Start building <span className="ar">→</span>
            </span>
          </a>
          <p className="modal-note">No account needed · demo build</p>
        </div>
      </div>
    </div>
  );
}
