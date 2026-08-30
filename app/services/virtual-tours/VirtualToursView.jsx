"use client";

// Virtual tours service page — ported from
// public/assets/virtual-tours-extracted/virtual-tours.html.
// virtual-tours.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// IntersectionObserver threshold .15, nav "scrolled" at y > 40, Lenis
// duration 1.1, magnetic offsets .25/.4, the cent-based sq-ft calculator,
// and the Three.js (r128) first-person venue walk.
//
// Deliberately not ported (both are no-ops in the reference itself): the
// `.s-tour` 360-panorama viewer and `.s-lt` time-of-day light slider. Both
// have full CSS blocks (and, for the panorama viewer, a JS module) but no
// matching markup in the reference body — the design settled on the
// Three.js walk as its "step inside" section and never swept up the
// earlier iterations' leftovers. See virtual-tours.css for the same note.

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

  /* ---------- 3D venue walk (Three.js r128, same CDN build as the reference) ---------- */
  const walkStageRef = useRef(null);
  const hintRef = useRef(null);
  const [threeReady, setThreeReady] = useState(false);
  const [walkStatus, setWalkStatus] = useState("loading"); // loading | ready | unavailable
  const bootedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.THREE) setThreeReady(true);
  }, []);

  useEffect(() => {
    if (!threeReady || bootedRef.current) return undefined;
    const stage = walkStageRef.current;
    const THREE = window.THREE;
    if (!stage || !THREE) {
      setWalkStatus("unavailable");
      return undefined;
    }
    bootedRef.current = true;
    setWalkStatus("ready");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d0c);
    scene.fog = new THREE.Fog(0x0d0d0c, 16, 40);
    const camera = new THREE.PerspectiveCamera(68, 16 / 9, 0.1, 120);
    camera.position.set(0, 1.7, 11);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    stage.appendChild(renderer.domElement);

    const size = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    size();
    window.addEventListener("resize", size);

    const loader = new THREE.TextureLoader();
    const tex = (u) => {
      const t = loader.load(u);
      t.encoding = THREE.sRGBEncoding;
      return t;
    };

    const W = 12;
    const D = 26;
    const H = 6.2;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xefece3, roughness: 0.92 });

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(W, D),
      new THREE.MeshStandardMaterial({ color: 0xe9e5d9, roughness: 0.35, metalness: 0.2 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const runner = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, D),
      new THREE.MeshStandardMaterial({ color: 0x14120f, roughness: 0.25, metalness: 0.35 }),
    );
    runner.rotation.x = -Math.PI / 2;
    runner.position.y = 0.012;
    scene.add(runner);

    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(W, D),
      new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.95 }),
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = H;
    scene.add(ceil);

    const lw = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
    lw.rotation.y = Math.PI / 2;
    lw.position.set(-W / 2, H / 2, 0);
    scene.add(lw);

    const rw = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
    rw.rotation.y = -Math.PI / 2;
    rw.position.set(W / 2, H / 2, 0);
    scene.add(rw);

    const bw = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
    bw.position.set(0, H / 2, D / 2);
    bw.rotation.y = Math.PI;
    scene.add(bw);

    const ew = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
    ew.position.set(0, H / 2, -D / 2);
    scene.add(ew);

    const frameMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 5.3),
      new THREE.MeshStandardMaterial({ color: 0x141210 }),
    );
    frameMesh.position.set(0, 2.7, -D / 2 + 0.05);
    scene.add(frameMesh);

    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(8.2, 4.6),
      new THREE.MeshBasicMaterial({ map: tex(ASSET("room-window.jpg")) }),
    );
    win.position.set(0, 2.7, -D / 2 + 0.1);
    scene.add(win);

    const art = (map, x, z, rotY) => {
      const g = new THREE.Group();
      const fr = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x1a1a18 }),
      );
      const p = new THREE.Mesh(
        new THREE.PlaneGeometry(3.1, 2.1),
        new THREE.MeshBasicMaterial({ map: tex(map) }),
      );
      p.position.z = 0.03;
      g.add(fr);
      g.add(p);
      g.position.set(x, 2.6, z);
      g.rotation.y = rotY;
      scene.add(g);
    };
    art(ASSET("room-art-1.jpg"), -W / 2 + 0.08, 4, Math.PI / 2);
    art(ASSET("room-art-2.jpg"), -W / 2 + 0.08, -3, Math.PI / 2);
    art(ASSET("room-art-3.jpg"), W / 2 - 0.08, 4, -Math.PI / 2);
    art(ASSET("room-art-1.jpg"), W / 2 - 0.08, -3, -Math.PI / 2);

    const plinth = (x, z) => {
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.1, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xdedad0, roughness: 0.6 }),
      );
      b.position.set(x, 0.55, z);
      scene.add(b);
      const c = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffd79a }),
      );
      c.position.set(x, 1.2, z);
      scene.add(c);
      const pl = new THREE.PointLight(0xffca85, 0.5, 6);
      pl.position.set(x, 1.3, z);
      scene.add(pl);
    };
    plinth(-4.2, 7);
    plinth(4.2, 7);
    plinth(-4.2, -6);
    plinth(4.2, -6);

    [6, 0, -7].forEach((z) => {
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffe9c6 }),
      );
      s.position.set(0, 5.2, z);
      scene.add(s);
      const pl = new THREE.PointLight(0xffe0b0, 0.9, 18);
      pl.position.set(0, 5, z);
      scene.add(pl);
    });

    scene.add(new THREE.AmbientLight(0xfff2e0, 0.55));
    const day = new THREE.PointLight(0xcfe2ff, 1.4, 34);
    day.position.set(0, 3, -9);
    scene.add(day);

    let yaw = 0;
    let pitch = 0;
    const keys = {};
    let dragging = false;
    let px = 0;
    let py = 0;
    let active = false;
    let moved = false;
    let raf = 0;
    let stopped = false;

    const onPointerDown = (e) => {
      dragging = true;
      px = e.clientX;
      py = e.clientY;
      stage.classList.add("drag");
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        // Safari/older browsers may not support pointer capture — dragging
        // still works via the window-level pointermove.
      }
    };
    const fade = () => {
      if (!moved) {
        moved = true;
        if (hintRef.current) hintRef.current.style.opacity = "0";
      }
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      yaw -= (e.clientX - px) * 0.005;
      pitch -= (e.clientY - py) * 0.005;
      pitch = Math.max(-0.9, Math.min(0.9, pitch));
      px = e.clientX;
      py = e.clientY;
      fade();
    };
    const onPointerUp = () => {
      dragging = false;
      stage.classList.remove("drag");
    };
    const onMouseEnter = () => {
      active = true;
    };
    const onMouseLeave = () => {
      active = false;
    };
    const onKeyDown = (e) => {
      if (!active) return;
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].indexOf(k) >= 0) e.preventDefault();
      fade();
    };
    const onKeyUp = (e) => {
      keys[e.key.toLowerCase()] = false;
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointerleave", onPointerUp);
    stage.addEventListener("mouseenter", onMouseEnter);
    stage.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const frame3 = () => {
      if (stopped) return;
      const sp = 0.075;
      const fx = Math.sin(yaw);
      const fz = -Math.cos(yaw);
      const rx = Math.cos(yaw);
      const rz = Math.sin(yaw);
      if (active) {
        if (keys.w || keys.arrowup) {
          camera.position.x += fx * sp;
          camera.position.z += fz * sp;
        }
        if (keys.s || keys.arrowdown) {
          camera.position.x -= fx * sp;
          camera.position.z -= fz * sp;
        }
        if (keys.a || keys.arrowleft) {
          camera.position.x -= rx * sp;
          camera.position.z -= rz * sp;
        }
        if (keys.d || keys.arrowright) {
          camera.position.x += rx * sp;
          camera.position.z += rz * sp;
        }
      }
      camera.position.x = Math.max(-W / 2 + 0.8, Math.min(W / 2 - 0.8, camera.position.x));
      camera.position.z = Math.max(-D / 2 + 1.2, Math.min(D / 2 - 1, camera.position.z));
      const cp = Math.cos(pitch);
      camera.lookAt(
        camera.position.x + Math.sin(yaw) * cp,
        camera.position.y + Math.sin(pitch),
        camera.position.z - Math.cos(yaw) * cp,
      );
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame3);
    };
    frame3();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointerleave", onPointerUp);
      stage.removeEventListener("mouseenter", onMouseEnter);
      stage.removeEventListener("mouseleave", onMouseLeave);
      renderer.dispose();
      if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement);
      bootedRef.current = false;
    };
  }, [threeReady]);

  return (
    <div ref={rootRef}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lenis/1.1.13/lenis.min.js"
        strategy="afterInteractive"
        onLoad={initLenis}
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        strategy="afterInteractive"
        onLoad={() => setThreeReady(true)}
        onError={() => setWalkStatus("unavailable")}
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

      <section className="s-walk" id="walk">
        <div className="wrap">
          <div className="booth-head rise">
            <p className="eyebrow">Step inside</p>
            <h2>Walk the venue</h2>
            <p className="sub">
              Explore the hall in real-time 3D — drag to look around, and use W A S D or the arrow
              keys to walk toward the light. This is what a tour really feels like.
            </p>
          </div>
          <div className="walk-stage rise" ref={walkStageRef}>
            <div className="walk-badge">
              <b>●</b> The Grand Hall · live 3D
            </div>
            <div className="walk-keys">
              <span>W</span>
              <span>A</span>
              <span>S</span>
              <span>D</span>
            </div>
            <div className="walk-hint" ref={hintRef}>
              drag to look · W A S D / arrows to move
            </div>
            {walkStatus !== "ready" && (
              <div className="walk-load">
                {walkStatus === "unavailable" ? "3D unavailable" : "entering the hall…"}
              </div>
            )}
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
