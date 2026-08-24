"use client";

// DJ + music service page — ported from designs/dj-music-SHARE.html
// (de-inlined copy: designs/dj-music-extracted.html).
// dj-music.css is that document's <style> block copied verbatim, so every
// token, breakpoint and transition comes from the reference rather than a
// redraw. The reference's vanilla JS is reimplemented below with the same
// numbers: IntersectionObserver threshold .15, nav "scrolled" at y > 40,
// Lenis duration 1.1, magnetic offsets .25/.4, the cent-based calculator and
// the 16-step Web Audio sequencer.
//
// Deliberately not ported (all no-ops in the reference itself):
//  - the DJ-booth script (#eq / #vinyl / .pad) and the energy-curve script
//    (#curve / #scrub): the reference deleted that markup but kept the
//    scripts, which bail on the missing canvas. Their CSS stays in
//    dj-music.css, unused, exactly as in the reference.
//  - the parallax loop over [data-parallax]: this page has no such element.

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import "./dj-music.css";

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

const HERE = "/services/dj-music";

const SERVICE_LINKS = [
  { href: "/services/party-rentals", label: "Party rentals" },
  { href: "/services/entertainers", label: "Entertainers" },
  { href: HERE, label: "DJ + music" },
  { href: "/services/photo-video", label: "Photo + video" },
  { href: "/services/virtual-tours", label: "Virtual tours" },
  { href: "/services/drone-video", label: "Drone video" },
];

const MENU_LINKS = [
  { href: "/", idx: "00", label: "Home" },
  { href: "/services/party-rentals", idx: "01", label: "Party rentals" },
  { href: "/services/entertainers", idx: "02", label: "Entertainers" },
  { href: HERE, idx: "03", label: "DJ + music" },
  { href: "/services/photo-video", idx: "04", label: "Photo + video" },
  { href: "/services/virtual-tours", idx: "05", label: "Virtual tours" },
  { href: "/services/drone-video", idx: "06", label: "Drone video" },
  { href: "/#testimonials", idx: "→", label: "Reviews" },
];

const INTRO_POINTS = [
  { n: "Pro local DJs", p: "Reviewed, reliable, genre-flexible." },
  { n: "By the hour", p: "2–8 hour sets to match your timeline." },
  { n: "Full add-ons", p: "Uplighting, fog, MC and photo booth." },
];

const FAQS = [
  {
    q: "Can the DJ MC the event too?",
    a: "Yes — add MC services and your DJ handles announcements and the run of show.",
  },
  {
    q: "Do you provide the sound system?",
    a: "A full PA suited to your headcount and venue is included.",
  },
  {
    q: "Can we send a playlist?",
    a: "Of course — share must-plays and do-not-plays in your request notes.",
  },
];

/* ---------------- pricing calculator (cents, like the reference) ------------- */

const HOURLY = 12500;
const MIN_HOURS = 2;
const MAX_HOURS = 8;

const ADDONS = [
  { id: "uplighting", name: "Uplighting", cents: 9500, label: "+$95" },
  { id: "fog", name: "Fog machine", cents: 4500, label: "+$45" },
  { id: "mc", name: "MC services", cents: 11000, label: "+$110" },
  { id: "booth", name: "Photo booth", cents: 25000, label: "+$250" },
];

const money = (c) =>
  `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ---------------- beat lab --------------------------------------------------- */

const TRACKS = [
  { n: "Kick", c: "#97c459" },
  { n: "Snare", c: "#f4b740" },
  { n: "Hat", c: "#4fd1c5" },
  { n: "Clap", c: "#f472b6" },
  { n: "Bass", c: "#a78bfa" },
  { n: "Synth", c: "#63b3ff" },
];

const STEPS = 16;

const PRESETS = {
  house: { 0: [0, 4, 8, 12], 2: [2, 6, 10, 14], 3: [4, 12], 4: [0, 3, 8, 11], 5: [0, 8] },
  hiphop: { 0: [0, 6, 10], 1: [4, 12], 2: [0, 2, 4, 6, 8, 10, 12, 14], 4: [0, 10] },
  pop: {
    0: [0, 8],
    1: [4, 12],
    2: [0, 2, 4, 6, 8, 10, 12, 14],
    3: [4, 12],
    4: [0, 8],
    5: [2, 6, 10, 14],
  },
};

const emptyPattern = () => TRACKS.map(() => new Array(STEPS).fill(false));

const patternFromPreset = (name) => {
  const grid = emptyPattern();
  const p = PRESETS[name] || {};
  Object.keys(p).forEach((r) => {
    p[r].forEach((c) => {
      grid[+r][c] = true;
    });
  });
  return grid;
};

// One-shot synth voices — same waveforms, envelopes and filter values as the
// reference, so the kit sounds identical.
function noise(a, dur) {
  const b = a.createBuffer(1, Math.max(1, a.sampleRate * dur), a.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource();
  s.buffer = b;
  return s;
}

function trig(a, name, t) {
  const g = a.createGain();
  g.connect(a.destination);

  if (name === "Kick") {
    const o = a.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(155, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.42);
    return;
  }

  if (name === "Bass") {
    const o = a.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(65, t);
    const f = a.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 520;
    g.gain.setValueAtTime(0.45, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.connect(f);
    f.connect(g);
    o.start(t);
    o.stop(t + 0.3);
    return;
  }

  if (name === "Synth") {
    const o = a.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(392, t);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.32);
    return;
  }

  const dur = name === "Hat" ? 0.05 : name === "Snare" ? 0.2 : 0.16;
  const s = noise(a, dur);
  const f = a.createBiquadFilter();
  if (name === "Hat") {
    f.type = "highpass";
    f.frequency.value = 7500;
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  } else if (name === "Snare") {
    f.type = "bandpass";
    f.frequency.value = 1900;
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  } else {
    f.type = "bandpass";
    f.frequency.value = 1200;
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  }
  s.connect(f);
  f.connect(g);
  s.start(t);
  s.stop(t + dur + 0.05);
}

export default function DjMusicView() {
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

  /* ---------- pricing calculator ---------- */
  const [hours, setHours] = useState(4);
  const [picked, setPicked] = useState(() => new Set());

  const total =
    HOURLY * hours + ADDONS.reduce((sum, a) => (picked.has(a.id) ? sum + a.cents : sum), 0);

  const toggleAddon = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* ---------- beat lab ---------- */
  const [pattern, setPattern] = useState(() => patternFromPreset("house"));
  const [preset, setPreset] = useState("house");
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(112);

  // The sequencer runs off the audio clock rather than React's render cycle, so
  // it reads the live pattern and tempo through refs.
  const patternRef = useRef(pattern);
  const bpmRef = useRef(bpm);
  patternRef.current = pattern;
  bpmRef.current = bpm;

  const actxRef = useRef(null);
  const cellsRef = useRef([]);
  const timerRef = useRef(null);
  const rafRef = useRef(0);
  const curRef = useRef(0);
  const nextTRef = useRef(0);
  const queueRef = useRef([]);
  const playColRef = useRef(-1);
  const hitTimersRef = useRef([]);

  const ac = useCallback(() => {
    if (!actxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      actxRef.current = new Ctx();
    }
    return actxRef.current;
  }, []);

  // Browsers hand back a suspended context until a gesture resumes it, so every
  // entry point into audio goes through here.
  const ensure = useCallback(() => {
    const a = ac();
    if (a.state === "suspended") a.resume();
    return a;
  }, [ac]);

  // The playhead column and its hit flashes are painted straight onto the DOM:
  // they change at audio rate, which is no place for a React re-render.
  const paintCol = useCallback(() => {
    const col = playColRef.current;
    cellsRef.current.forEach((b, i) => {
      if (b) b.classList.toggle("ph", i % STEPS === col);
    });
    if (col < 0) return;
    for (let r = 0; r < TRACKS.length; r++) {
      if (!patternRef.current[r][col]) continue;
      const cell = cellsRef.current[r * STEPS + col];
      if (!cell) continue;
      cell.classList.add("hit");
      hitTimersRef.current.push(setTimeout(() => cell.classList.remove("hit"), 110));
    }
  }, []);

  const stop = useCallback(() => {
    setPlaying(false);
    clearInterval(timerRef.current);
    timerRef.current = null;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    queueRef.current = [];
    playColRef.current = -1;
    hitTimersRef.current.forEach(clearTimeout);
    hitTimersRef.current = [];
    cellsRef.current.forEach((b) => {
      if (b) b.classList.remove("ph", "hit");
    });
  }, []);

  const start = useCallback(() => {
    const a = ensure();
    setPlaying(true);
    curRef.current = 0;
    nextTRef.current = a.currentTime + 0.08;
    queueRef.current = [];

    const stepDur = () => 60 / bpmRef.current / 4;

    // Queue notes 100ms ahead of the audio clock so their timing does not
    // depend on when the interval happens to fire.
    const schedule = () => {
      while (nextTRef.current < a.currentTime + 0.1) {
        for (let r = 0; r < TRACKS.length; r++) {
          if (patternRef.current[r][curRef.current]) trig(a, TRACKS[r].n, nextTRef.current);
        }
        queueRef.current.push({ step: curRef.current, time: nextTRef.current });
        nextTRef.current += stepDur();
        curRef.current = (curRef.current + 1) % STEPS;
      }
    };
    timerRef.current = setInterval(schedule, 25);

    const raf = () => {
      const now = a.currentTime;
      let changed = false;
      while (queueRef.current.length && queueRef.current[0].time <= now) {
        playColRef.current = queueRef.current.shift().step;
        changed = true;
      }
      if (changed) paintCol();
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);
  }, [ensure, paintCol]);

  useEffect(() => stop, [stop]);

  const toggleCell = (r, c) => {
    const on = !patternRef.current[r][c];
    setPattern((prev) =>
      prev.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? !v : v)) : row)),
    );
    // Switching a pad on auditions it, so the grid is playable while stopped.
    if (on) {
      const a = ensure();
      trig(a, TRACKS[r].n, a.currentTime);
    }
    setPreset(null);
  };

  const loadPreset = (name) => {
    setPreset(name);
    setPattern(patternFromPreset(name));
  };

  const clearGrid = () => {
    setPattern(emptyPattern());
    setPreset(null);
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
          <video autoPlay muted loop playsInline poster="/assets/dj-music/hero-poster.jpg">
            <source src="/assets/dj-music/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="wrap">
          <p className="crumb">
            <a href="/">Home</a> / <a href="/#services">Services</a> / DJ + music
          </p>

          <div className="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="2.4" />
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
            </svg>
          </div>
          <h1>DJ + music</h1>
          <p className="tag">
            A pro DJ for your event, by the hour — with uplighting, MC and photo-booth add-ons.
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

      <section className="s-intro">
        <div className="wrap grid">
          <div className="rise">
            <p className="eyebrow">What it is</p>
            <div className="intro-media">
              <img src="/assets/dj-music/intro-dj.jpg" alt="DJ playing a live set" />
            </div>
          </div>
          <div className="rise">
            <p className="lead">
              Set the energy for the whole night. Book a DJ by the hour, then layer on the extras
              that make the room — uplighting, fog, an MC, or a photo booth.
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
          <div className="dj-calc rise">
            <div className="calc-hours">
              <div>
                <div style={{ fontWeight: 600 }}>DJ set</div>
                <div style={{ fontSize: ".85rem", color: "var(--tx2)" }}>
                  {money(HOURLY)} / hour
                </div>
              </div>
              <div className="step">
                <button
                  type="button"
                  aria-label="fewer hours"
                  onClick={() => setHours((h) => Math.max(MIN_HOURS, h - 1))}
                >
                  −
                </button>
                <span className="val">{hours} hrs</span>
                <button
                  type="button"
                  aria-label="more hours"
                  onClick={() => setHours((h) => Math.min(MAX_HOURS, h + 1))}
                >
                  +
                </button>
              </div>
            </div>
            <div className="addons">
              {ADDONS.map((a) => {
                const on = picked.has(a.id);
                return (
                  <div
                    key={a.id}
                    className={`addon${on ? " on" : ""}`}
                    role="checkbox"
                    aria-checked={on}
                    tabIndex={0}
                    onClick={() => toggleAddon(a.id)}
                    onKeyDown={(e) => {
                      if (e.key !== " " && e.key !== "Enter") return;
                      e.preventDefault();
                      toggleAddon(a.id);
                    }}
                  >
                    <span className="nm">{a.name}</span>
                    <span className="rt">
                      <span className="pr">{a.label}</span>
                      <span className="chk">
                        <span>✓</span>
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="calc-total">
              <span className="lbl">Estimated total</span>
              <span className="amt">{money(total)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="s-lab" id="beatlab">
        <div className="wrap">
          <div className="booth-head rise">
            <p className="eyebrow">Play the room</p>
            <h2>Make a beat</h2>
            <p className="sub">
              Tap the pads to switch them on, hit play, and build a loop. Load a preset to hear a
              house, hip-hop or pop groove — then make it yours.
            </p>
          </div>
          <div className="lab-panel rise">
            <div className="lab-controls">
              <button
                className={`lab-play${playing ? " playing" : ""}`}
                type="button"
                onClick={() => (playing ? stop() : start())}
              >
                <span className="pi">{playing ? "❚❚" : "▶"}</span>{" "}
                <span>{playing ? "Stop" : "Play"}</span>
              </button>
              <div className="lab-tempo">
                <span>Tempo</span>
                <input
                  type="range"
                  min="80"
                  max="140"
                  value={bpm}
                  aria-label="tempo"
                  onChange={(e) => setBpm(+e.target.value)}
                />
                <span className="bpmv">{bpm} BPM</span>
              </div>
              <div className="lab-presets">
                {[
                  ["house", "House"],
                  ["hiphop", "Hip-hop"],
                  ["pop", "Pop"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={preset === key ? "on" : undefined}
                    onClick={() => loadPreset(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button className="lab-clear" type="button" onClick={clearGrid}>
                Clear
              </button>
            </div>
            <div className="lab-grid">
              {TRACKS.map((tk, r) => (
                <div className="lab-row" key={tk.n}>
                  <div className="rl">{tk.n}</div>
                  {pattern[r].map((on, c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`${tk.n} step ${c + 1}`}
                      aria-pressed={on}
                      className={`cell${Math.floor(c / 4) % 2 ? " alt" : ""}${on ? " on" : ""}`}
                      style={{ "--c": tk.c }}
                      ref={(el) => {
                        cellsRef.current[r * STEPS + c] = el;
                      }}
                      onClick={() => toggleCell(r, c)}
                    />
                  ))}
                </div>
              ))}
            </div>
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
          style={{ backgroundImage: "url('/assets/dj-music/cta-bg.jpg')" }}
        />
        <div className="cta-veil" />
        <div className="glow" />
        <div className="wrap">
          <p className="eyebrow rise">Ready when you are</p>
          <h2 className="rise" style={{ marginTop: "12px" }}>
            Add DJ + music to your event.
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
