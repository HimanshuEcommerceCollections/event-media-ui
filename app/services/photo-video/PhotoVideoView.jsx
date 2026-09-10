"use client";

// Photo + video service page — ported from
// public/assets/photo-video-extracted/photo-video.html.
// photo-video.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// IntersectionObserver threshold .15, nav "scrolled" at y > 40, Lenis
// duration 1.1, magnetic offsets .25/.4, the cent-based package calculator,
// and the pinned scroll gallery (80vh of track per frame, shutter fx on
// every frame change, timecode ticking at 8fps).
//
// Deliberately not ported (all three are no-ops in the reference itself):
// the `.s-vf` viewfinder with look/aspect chips, the `.s-cs` contact sheet
// with a magnifying loupe, and the `.s-gal` image strip. Each has a full CSS
// block — and the first two a JS module — with no matching markup in the
// reference body; the design settled on the pinned gallery as its signature
// section and never swept up the earlier iterations. Their JS bails on the
// missing `#vfMedia` / `#csSheet`, so the reference renders exactly what this
// component does. See photo-video.css for the same note.
//
// The gallery drives the pin class, timecode and shutter fx through refs
// rather than state: those change on every scroll frame, and routing them
// through React would re-render the page continuously. Only the frame index
// — which changes a handful of times per scroll — is state.

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import "./photo-video.css";
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

const pad = (n) => (n < 10 ? `0${n}` : String(n));

const ASSET = (name) => `/assets/photo-video/${name}`;

export default function PhotoVideoView({ content }) {
  // Named locally so the render below reads the way it did when these were
  // module constants.
  const { pricing, blocks, navigation } = content;
  const SERVICE_LINKS = navigation.services;
  const MENU_LINKS = navigation.menu;
  const INTRO_POINTS = blocks.intro ?? [];
  const FAQS = blocks.faq ?? [];
  const INCLUDED = (blocks.included ?? []).map((i) => i.text);
  const { packs: PACKS, addons: ADDONS } = pricing;
  const FRAMES = blocks.frame ?? [];

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

  /* ---------- package calculator ---------- */
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

  /* ---------- pinned scroll gallery ---------- */
  const N = FRAMES.length;
  const trackRef = useRef(null);
  const pinRef = useRef(null);
  const flashRef = useRef(null);
  const bladeTopRef = useRef(null);
  const bladeBotRef = useRef(null);
  const tcRef = useRef(null);

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  // Re-triggers the CSS animations by removing the class and forcing a reflow,
  // exactly as the reference's shoot().
  const shoot = useCallback(() => {
    [flashRef.current, bladeTopRef.current, bladeBotRef.current].forEach((el) => {
      if (!el) return;
      el.classList.remove("fire");
      void el.offsetWidth;
      el.classList.add("fire");
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!track || !pin) return undefined;

    const update = () => {
      const r = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = track.offsetHeight - vh;

      if (r.top <= 0 && r.bottom >= vh) {
        pin.classList.add("fixed");
        pin.classList.remove("bottom");
      } else if (r.bottom < vh) {
        pin.classList.remove("fixed");
        pin.classList.add("bottom");
      } else {
        pin.classList.remove("fixed", "bottom");
      }

      let p = span > 0 ? -r.top / span : 0;
      p = Math.min(1, Math.max(0, p));
      const i = Math.round(p * (N - 1));
      if (i !== activeRef.current) {
        activeRef.current = i;
        setActive(i);
        shoot();
      }
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [N, shoot]);

  // Free-running timecode, 8 ticks a second as in the reference.
  useEffect(() => {
    let fr = 0;
    const id = setInterval(() => {
      fr += 1;
      const s = fr % 60;
      const m = Math.floor(fr / 60) % 60;
      const f = Math.floor((fr * 7) % 24);
      if (tcRef.current) tcRef.current.textContent = `${pad(m)}:${pad(s)}:${pad(f)}`;
    }, 1000 / 8);
    return () => clearInterval(id);
  }, []);

  const scrollToIndex = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const span = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: track.offsetTop + (i / (N - 1)) * span, behavior: "smooth" });
  };

  const exif = FRAMES[active].exif;

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
            <a href="/">Home</a> / <a href="/#services">Services</a> / Photo + video
          </p>
          <div className="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="2.5" y="6.5" width="14" height="11" rx="2.5" />
              <path d="M16.5 10l5-2.5v9L16.5 14" />
              <circle cx="8.5" cy="12" r="2.3" />
            </svg>
          </div>
          <h1>Photo + video</h1>
          <p className="tag">From a two-hour photo session to a full cinematic package.</p>
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
              <img src={ASSET("intro.jpg")} alt="Videographer on a shoot" />
            </div>
          </div>
          <div className="rise">
            <p className="lead">
              Capture the day properly. Choose a fixed-price package — from a quick photo session to
              a cinematic photo-and-video production — and get an edited gallery back fast.
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
              <div className="pv-sub">Choose a package</div>
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
              <img src={ASSET("pv-aside.jpg")} alt="Photographer at an event" />
              <div className="pv-inc">
                <h4>Every booking includes</h4>
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

      <section className="s-cf" id="coverflow">
        <div className="cf-track" ref={trackRef} style={{ height: `${N * 80}vh` }}>
          <div className="cf-pin" ref={pinRef}>
            <div className="cf-imgs">
              {FRAMES.map((f, i) => (
                <img
                  key={f.imageFile}
                  src={ASSET(f.imageFile)}
                  className={i === active ? "on" : undefined}
                  alt=""
                />
              ))}
            </div>
            <div className="cf-veil" />
            <div className="cf-head">
              <p className="eyebrow">The gallery</p>
              <h2>Flip through the set</h2>
              <p className="sub">Scroll down — the frame changes with the click of the shutter.</p>
            </div>
            <div className="cf-foot">
              <div className="cf-count">
                {pad(active + 1)} / {pad(N)}
              </div>
              <div className="cf-cap">{FRAMES[active].caption}</div>
              <div className="cf-dots">
                {FRAMES.map((f, i) => (
                  <i
                    key={f.imageFile}
                    className={i === active ? "on" : undefined}
                    onClick={() => scrollToIndex(i)}
                  />
                ))}
              </div>
            </div>
            <div className="cf-hud">
              <div className="cf-rec">
                <i />
                REC · <span ref={tcRef}>00:00:00</span>
              </div>
              <div className="cf-cam">A‑CAM · 4K · 24fps</div>
              <div className="cf-specs">
                <div className="row">
                  <span className="k">LENS</span>
                  <span className="v">{exif.lens}</span>
                </div>
                <div className="row">
                  <span className="k">APERTURE</span>
                  <span className="v">{exif.aperture}</span>
                </div>
                <div className="row">
                  <span className="k">SHUTTER</span>
                  <span className="v">{exif.shutter}</span>
                </div>
                <div className="row">
                  <span className="k">ISO</span>
                  <span className="v">{exif.iso}</span>
                </div>
                <div className="row">
                  <span className="k">WB</span>
                  <span className="v">{exif.whiteBalance}</span>
                </div>
              </div>
            </div>
            <span className="cf-cor tl" />
            <span className="cf-cor tr" />
            <span className="cf-cor bl" />
            <span className="cf-cor br" />
            <div className="cf-fx">
              <div className="cf-blade top" ref={bladeTopRef} />
              <div className="cf-blade bot" ref={bladeBotRef} />
              <div className="cf-flash" ref={flashRef} />
            </div>
            <div className="cf-scrollcue">scroll ↓</div>
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
            Add Photo + video to your event.
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
