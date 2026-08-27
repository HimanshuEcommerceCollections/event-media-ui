"use client";

// Virtual tours service page — ported from
// public/assets/virtual-tours-extracted/virtual-tours.html.
// virtual-tours.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// IntersectionObserver threshold .15, nav "scrolled" at y > 40, Lenis
// duration 1.1, magnetic offsets .25/.4.

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import "./virtual-tours.css";

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

const HERE = "/services/virtual-tours";

const SERVICE_LINKS = [
  { href: "/services/party-rentals", label: "Party rentals" },
  { href: "/services/entertainers", label: "Entertainers" },
  { href: "/services/dj-music", label: "DJ + music" },
  { href: "/services/photo-video", label: "Photo + video" },
  { href: HERE, label: "Virtual tours" },
  { href: "/services/drone-video", label: "Drone video" },
];

const MENU_LINKS = [
  { href: "/", idx: "00", label: "Home" },
  { href: "/services/party-rentals", idx: "01", label: "Party rentals" },
  { href: "/services/entertainers", idx: "02", label: "Entertainers" },
  { href: "/services/dj-music", idx: "03", label: "DJ + music" },
  { href: "/services/photo-video", idx: "04", label: "Photo + video" },
  { href: HERE, idx: "05", label: "Virtual tours" },
  { href: "/services/drone-video", idx: "06", label: "Drone video" },
  { href: "/#testimonials", idx: "→", label: "Reviews" },
];

const INTRO_POINTS = [
  { n: "For realtors", p: "Volume-friendly for repeat listings." },
  { n: "Priced by sq ft", p: "Straightforward tiers, no guesswork." },
  { n: "Fast delivery", p: "Hosted tour link back the next day." },
];

const FAQS = [
  {
    q: "How is the tour delivered?",
    a: "As a hosted link you can embed on your listing and MLS.",
  },
  {
    q: "Do you offer volume rates?",
    a: "Yes — recurring-shoot volume routes to a coordinator for a custom rate.",
  },
  {
    q: "How large a property can you scan?",
    a: "Any size; tiers scale to 5,000+ sq ft with custom pricing above.",
  },
];

// cents, exactly as the reference's #pvPacks data-price buttons.
const PACKS = [
  { name: "Under 1,500 sq ft", price: 19900 },
  { name: "1,500–3,000", price: 29900 },
  { name: "3,000–5,000", price: 44900 },
  { name: "5,000+ sq ft", price: 64900 },
];

// cents, exactly as the reference's #pvAdd data-add buttons.
const ADDONS = [
  { name: "2D floor plan", price: 7900 },
  { name: "Aerial exterior", price: 14900 },
  { name: "Dollhouse 3D view", price: 9900 },
  { name: "12-mo hosting", price: 6000 },
];

const INCLUDED = [
  "Hosted, shareable tour link",
  "Unlimited walk-through views",
  "Mobile & VR ready",
  "Delivered next business day",
];

const money = (c) =>
  `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ASSET = (name) => `/assets/virtual-tours/${name}`;

export default function VirtualToursView() {
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

  /* ---------- sq-ft calculator ---------- */
  const [packIdx, setPackIdx] = useState(0);
  const [addonsOn, setAddonsOn] = useState(() => new Set());

  const total = PACKS[packIdx].price + [...addonsOn].reduce((sum, i) => sum + ADDONS[i].price, 0);

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
                  <a key={l.href} href={l.href} aria-current={l.href === HERE ? "page" : undefined}>
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
          <video autoPlay muted loop playsInline poster={ASSET("hero-poster.jpg")}>
            <source src={ASSET("hero-bg.mp4")} type="video/mp4" />
          </video>
        </div>
        <div className="wrap">
          <p className="crumb">
            <a href="/">Home</a> / <a href="/#services">Services</a> / Virtual tours
          </p>
          <span className="b2b-badge">B2B · Commercial</span>
          <div className="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3 10.5 12 4l9 6.5" />
              <path d="M5 9.5V20h14V9.5" />
              <path d="M9.5 20v-5h5v5" />
            </svg>
          </div>
          <h1>Virtual tours</h1>
          <p className="tag">Interactive 3D walkthroughs for realtors, priced by square footage.</p>
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
              <img src={ASSET("intro.jpg")} alt="Interior of an event venue" />
            </div>
          </div>
          <div className="rise">
            <p className="lead">
              Give buyers a true walk-through before they visit. Immersive 3D tours priced simply by
              square footage, built for realtors with repeat listings.
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
              <div className="pv-sub">Property size</div>
              <div className="pv-packs">
                {PACKS.map((p, i) => (
                  <button
                    type="button"
                    key={p.name}
                    className={`pv-pack${packIdx === i ? " on" : ""}`}
                    onClick={() => setPackIdx(i)}
                  >
                    <span className="nm">{p.name}</span>
                    <span className="pr">{money(p.price)}</span>
                  </button>
                ))}
              </div>
              <div className="pv-sub">Add-ons</div>
              <div className="addons">
                {ADDONS.map((a, i) => (
                  <div
                    key={a.name}
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
                      <span className="pr">+{money(a.price)}</span>
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
              <img src={ASSET("tour-lounge.jpg")} alt="Listing interior" />
              <div className="pv-inc">
                <h4>Every tour includes</h4>
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
        <div className="cta-bg" style={{ backgroundImage: `url('${ASSET("cta-bg.jpg")}')` }} />
        <div className="cta-veil" />
        <div className="glow" />
        <div className="wrap">
          <p className="eyebrow rise">Ready when you are</p>
          <h2 className="rise" style={{ marginTop: "12px" }}>
            Add Virtual tours to your event.
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
              <a className="fl" href="/#testimonials">
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
