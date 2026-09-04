"use client";

// Build my event — ported from public/assets/no-asset-pages/build.html.
// build.css is that document's <style> block copied verbatim. The reference's
// vanilla JS is reimplemented below with the same numbers: nav "scrolled" at
// y > 30, every service price in cents, the 450ms 1-(1-p)³ tween on the
// running total, and the 160-particle burst on send (gravity .3, alpha
// -.009/frame).
//
// One fix rather than a faithful copy. The reference writes three of its four
// bundle emoji as "\U0001F48D"-style escapes, which JavaScript does not
// recognise — `\U` is not an escape, so the chips render the literal text
// "U0001F48D Wedding essentials". The intended characters are obvious from the
// code points, so they are used directly here.
//
// Two of the detail fields are inert, as they are in the reference: location
// and name/email are collected but never read — only the date reaches the
// summary. Kept as authored rather than wired into copy that does not exist.
//
// Nothing is submitted. The reference shows its confirmation overlay and
// stops there, and although the backend does expose POST /api/v1/requests,
// sending a real quote request means handling auth, server-side validation and
// its error states — a larger change than porting the builder.

import { useEffect, useMemo, useRef, useState } from "react";
import "./build.css";

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

const SERVICE_LINKS = [
  { href: "/services/party-rentals", label: "Party rentals" },
  { href: "/services/entertainers", label: "Entertainers" },
  { href: "/services/dj-music", label: "DJ + music" },
  { href: "/services/photo-video", label: "Photo + video" },
  { href: "/services/virtual-tours", label: "Virtual tours" },
  { href: "/services/drone-video", label: "Drone video" },
];

// All prices in cents, exactly as the reference's SVC table.
const SVC = [
  {
    id: "party",
    name: "Party rentals",
    desc: "Tables, chairs, lounge & lighting",
    base: 25000,
    addons: [
      { name: "Lounge set", price: 18000 },
      { name: "Uplighting", price: 9500 },
      { name: "Dance floor", price: 30000 },
      { name: "Fog machine", price: 4500 },
    ],
    icon: (
      <>
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M5 12v8M19 12v8M9 12v8M15 12v8" />
      </>
    ),
  },
  {
    id: "ent",
    name: "Entertainers",
    desc: "Magicians, face paint, balloons",
    base: 15000,
    hours: { rate: 9000, min: 1, max: 6, def: 2 },
    addons: [
      { name: "Face painting", price: 9000 },
      { name: "Balloon artist", price: 8000 },
      { name: "Caricaturist", price: 12000 },
    ],
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M12 12l2 9-2-2-2 2 2-9" />
      </>
    ),
  },
  {
    id: "dj",
    name: "DJ + music",
    desc: "Pro DJ by the hour, plus extras",
    hours: { rate: 12500, min: 2, max: 8, def: 4 },
    addons: [
      { name: "Uplighting", price: 9500 },
      { name: "MC services", price: 11000 },
      { name: "Photo booth", price: 25000 },
    ],
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.4" />
      </>
    ),
  },
  {
    id: "photo",
    name: "Photo + video",
    desc: "From a session to a cinematic film",
    choose: [
      { name: "Photo · 2h", price: 39500 },
      { name: "Photo · 4h", price: 69500 },
      { name: "Photo + video", price: 125000 },
      { name: "Cinematic", price: 210000 },
    ],
    addons: [
      { name: "Second shooter", price: 30000 },
      { name: "Same-day teaser", price: 18000 },
    ],
    icon: (
      <>
        <rect x="2.5" y="6.5" width="14" height="11" rx="2.5" />
        <path d="M16.5 10l5-2.5v9l-5-2.5" />
        <circle cx="8.5" cy="12" r="2.3" />
      </>
    ),
  },
  {
    id: "tours",
    name: "Virtual tours",
    desc: "3D walkthroughs, priced by size",
    choose: [
      { name: "Under 1,500 sqft", price: 19900 },
      { name: "1,500–3,000", price: 29900 },
      { name: "3,000–5,000", price: 44900 },
      { name: "5,000+ sqft", price: 64900 },
    ],
    addons: [
      { name: "Floor plan", price: 7900 },
      { name: "Aerial exterior", price: 14900 },
    ],
    icon: (
      <>
        <path d="M3 10.5 12 4l9 6.5" />
        <path d="M5 9.5V20h14V9.5" />
      </>
    ),
  },
  {
    id: "drone",
    name: "Drone video",
    desc: "Aerial footage, add-on or solo",
    choose: [
      { name: "Add-on to a shoot", price: 17500 },
      { name: "Standalone flight", price: 45000 },
    ],
    addons: [
      { name: "Highlight reel", price: 15000 },
      { name: "Twilight flight", price: 9000 },
    ],
    icon: (
      <>
        <circle cx="5" cy="6" r="2.4" />
        <circle cx="19" cy="6" r="2.4" />
        <rect x="9" y="10" width="6" height="4.5" rx="1.3" />
        <path d="M6.6 7.6 9.6 11M17.4 7.6 14.4 11" />
      </>
    ),
  },
];

const TYPES = ["Wedding", "Birthday", "Corporate", "Gala", "Community", "Other"];

const STAR = (
  <svg
    viewBox="0 0 24 24"
    style={{ width: "1em", height: "1em", verticalAlign: "-.12em" }}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
  </svg>
);

const BUNDLES = [
  {
    emo: "💍",
    name: "Wedding essentials",
    type: "Wedding",
    cfg: {
      party: { addons: [0, 1, 2] },
      photo: { choose: 2, addons: [0] },
      dj: { hours: 5, addons: [1] },
      drone: { choose: 0, addons: [0] },
    },
  },
  {
    emo: "🚀",
    name: "Corporate launch",
    type: "Corporate",
    cfg: {
      photo: { choose: 3, addons: [0] },
      tours: { choose: 2, addons: [1] },
      drone: { choose: 1, addons: [0] },
      party: { addons: [0, 1] },
    },
  },
  {
    emo: "🎈",
    name: "Kids party",
    type: "Birthday",
    cfg: {
      party: { addons: [3] },
      ent: { hours: 3, addons: [0, 1] },
      dj: { hours: 3, addons: [] },
      photo: { choose: 0, addons: [] },
    },
  },
  {
    emo: STAR,
    name: "Gala night",
    type: "Gala",
    cfg: {
      party: { addons: [0, 1, 2] },
      dj: { hours: 5, addons: [0, 1] },
      photo: { choose: 3, addons: [] },
      drone: { choose: 0, addons: [1] },
    },
  },
];

const CONFETTI_COLORS = ["#639922", "#97c459", "#e0b341", "#fff", "#6fb0d6"];

// Whole dollars — the builder quotes in round numbers.
const money = (c) => `$${Math.round(c / 100).toLocaleString("en-US")}`;

const initialState = () =>
  Object.fromEntries(
    SVC.map((s) => [
      s.id,
      { on: false, choose: 0, hours: s.hours ? s.hours.def : 0, addons: [], other: "" },
    ]),
  );

const priceOf = (s, c) => {
  if (!c.on) return 0;
  let p = 0;
  if (s.base) p += s.base;
  if (s.hours) p += c.hours * s.hours.rate;
  if (s.choose) p += s.choose[c.choose].price;
  (s.addons ?? []).forEach((a, i) => {
    if (c.addons.includes(i)) p += a.price;
  });
  return p;
};

export default function BuildView() {
  const navRef = useRef(null);
  const cfgRefs = useRef({});
  const sendRef = useRef(null);
  const canvasRef = useRef(null);
  const dispRef = useRef(0);
  const rafRef = useRef(0);

  const [dropOpen, setDropOpen] = useState(false);
  const [basics, setBasics] = useState({
    type: "Wedding",
    guests: 50,
    date: "",
    location: "Raleigh, NC",
    contact: "",
  });
  const [svc, setSvc] = useState(initialState);
  const [notes, setNotes] = useState("");
  const [bundle, setBundle] = useState(null);
  const [sent, setSent] = useState(false);
  const [disp, setDisp] = useState(0);

  /* ---------- nav background on scroll ---------- */
  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) navRef.current.classList.toggle("scrolled", window.scrollY > 30);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- services dropdown ---------- */
  useEffect(() => {
    if (!dropOpen) return undefined;
    const onDoc = () => setDropOpen(false);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [dropOpen]);

  /* ---------- service cards ---------- */
  const patch = (id, next) =>
    setSvc((prev) => ({ ...prev, [id]: { ...prev[id], ...next } }));

  const toggleService = (id) => patch(id, { on: !svc[id].on });

  const toggleAddon = (id, i) =>
    setSvc((prev) => {
      const c = prev[id];
      const addons = c.addons.includes(i)
        ? c.addons.filter((x) => x !== i)
        : [...c.addons, i];
      return { ...prev, [id]: { ...c, addons } };
    });

  const stepHours = (s, d) => {
    const c = svc[s.id];
    const next = c.hours + d;
    if (next < s.hours.min || next > s.hours.max) return;
    patch(s.id, { hours: next });
  };

  // The reference animates the config panel by measuring it and adding 400px
  // of slack, so a panel that grows while open is not clipped.
  useEffect(() => {
    SVC.forEach((s) => {
      const el = cfgRefs.current[s.id];
      if (!el) return;
      el.style.maxHeight = svc[s.id].on ? `${el.scrollHeight + 400}px` : "0";
    });
  }, [svc]);

  /* ---------- bundles ---------- */
  const applyBundle = (b) => {
    setSvc((prev) => {
      const next = { ...prev };
      SVC.forEach((s) => {
        const cfg = b.cfg[s.id];
        if (cfg) {
          next[s.id] = {
            ...prev[s.id],
            on: true,
            choose: "choose" in cfg ? cfg.choose : prev[s.id].choose,
            hours: "hours" in cfg ? cfg.hours : prev[s.id].hours,
            addons: cfg.addons ?? [],
          };
        } else {
          next[s.id] = { ...prev[s.id], on: false, addons: [] };
        }
      });
      return next;
    });
    setBasics((prev) => ({ ...prev, type: b.type }));
    setBundle(b.name);
  };

  const clearAll = () => {
    setSvc((prev) => {
      const next = { ...prev };
      SVC.forEach((s) => {
        next[s.id] = { ...prev[s.id], on: false, addons: [] };
      });
      return next;
    });
    setBundle(null);
  };

  /* ---------- running total ---------- */
  const lines = useMemo(
    () =>
      SVC.filter((s) => svc[s.id].on).map((s) => ({
        name: s.name,
        price: priceOf(s, svc[s.id]),
      })),
    [svc],
  );

  const total = lines.reduce((sum, l) => sum + l.price, 0);

  const hasNotes =
    notes.trim().length > 0 || SVC.some((s) => svc[s.id].on && svc[s.id].other.trim());

  // Tween the displayed total rather than snapping it, 450ms on a cubic
  // ease-out, picking up from wherever the last tween had reached.
  useEffect(() => {
    const from = dispRef.current;
    const t0 = performance.now();
    cancelAnimationFrame(rafRef.current);
    const frame = (now) => {
      const p = Math.min(1, (now - t0) / 450);
      const eased = 1 - (1 - p) ** 3;
      const v = from + (total - from) * eased;
      dispRef.current = p < 1 ? v : total;
      setDisp(dispRef.current);
      if (p < 1) rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [total]);

  const dateLabel = basics.date
    ? new Date(`${basics.date}T00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "date TBD";

  /* ---------- send ---------- */
  const burst = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const P = Array.from({ length: 160 }, (_, i) => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15 - 4,
      r: 3 + Math.random() * 4,
      c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      a: 1,
    }));
    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      let alive = false;
      P.forEach((p) => {
        p.vy += 0.3;
        p.x += p.vx;
        p.y += p.vy;
        p.a -= 0.009;
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
  };

  const send = () => {
    if (!lines.length) {
      // Nothing picked yet: nudge the button instead of opening an empty
      // confirmation, retriggering the keyframe the way the reference does.
      const el = sendRef.current;
      if (el) {
        el.classList.remove("shake");
        void el.offsetWidth;
        el.classList.add("shake");
      }
      return;
    }
    setSent(true);
    burst();
  };

  return (
    <div>
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
                  <a key={l.href} href={l.href}>
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
            <a className="pn-item pn-cta" href="/build">
              Build my event
            </a>
          </div>
        </div>
      </nav>

      <header className="bd-head">
        <div className="wrap">
          <p className="eyebrow">Build my event</p>
          <h1>One request. Whole event covered.</h1>
          <p>
            Tell us the basics, add the services you want, and watch your estimate build in real
            time. Send one request — we match you with vetted local pros.
          </p>
        </div>
      </header>

      <main className="bd-main">
        <div className="wrap">
          <div className="bd-grid">
            <div>
              <div className="card blk-card">
                <div className="blk">
                  <div className="lab">Quick start · tap to prefill</div>
                  <div className="chips">
                    {BUNDLES.map((b) => (
                      <button
                        type="button"
                        key={b.name}
                        className={`chip bundle${bundle === b.name ? " act" : ""}`}
                        onClick={() => applyBundle(b)}
                      >
                        {b.emo} {b.name}
                      </button>
                    ))}
                    <button type="button" className="chip" onClick={clearAll}>
                      Clear
                    </button>
                  </div>
                </div>
                <div className="blk">
                  <div className="lab">1 · What’s the occasion?</div>
                  <div className="chips">
                    {TYPES.map((t) => (
                      <button
                        type="button"
                        key={t}
                        className={`chip${basics.type === t ? " on" : ""}`}
                        onClick={() => setBasics((prev) => ({ ...prev, type: t }))}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="blk">
                  <div className="lab">2 · The details</div>
                  <div className="fields">
                    <div className="field">
                      <label htmlFor="bd-date">Event date</label>
                      <input
                        id="bd-date"
                        type="date"
                        value={basics.date}
                        onChange={(e) => setBasics((prev) => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="bd-loc">Location</label>
                      <input
                        id="bd-loc"
                        type="text"
                        placeholder="Raleigh, NC"
                        value={basics.location}
                        onChange={(e) =>
                          setBasics((prev) => ({ ...prev, location: e.target.value }))
                        }
                      />
                    </div>
                    <div className="field">
                      <label>Guests</label>
                      <div className="stepper">
                        <button
                          type="button"
                          aria-label="Fewer guests"
                          onClick={() =>
                            setBasics((prev) =>
                              prev.guests > 10 ? { ...prev, guests: prev.guests - 10 } : prev,
                            )
                          }
                        >
                          −
                        </button>
                        <span className="v">{basics.guests} guests</span>
                        <button
                          type="button"
                          aria-label="More guests"
                          onClick={() =>
                            setBasics((prev) => ({ ...prev, guests: prev.guests + 10 }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="bd-contact">Your name / email</label>
                      <input
                        id="bd-contact"
                        type="text"
                        placeholder="you@email.com"
                        value={basics.contact}
                        onChange={(e) =>
                          setBasics((prev) => ({ ...prev, contact: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="lab"
                style={{
                  fontFamily: "var(--fmono)",
                  fontSize: "11px",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--tx3)",
                  margin: "26px 0 4px",
                }}
              >
                3 · Add your services
              </div>
              <div className="svc-list">
                {SVC.map((s) => {
                  const c = svc[s.id];
                  return (
                    <div className={`svc${c.on ? " on" : ""}`} key={s.id}>
                      <div className="svc-head" onClick={() => toggleService(s.id)}>
                        <div className="svc-ic">
                          <svg viewBox="0 0 24 24">{s.icon}</svg>
                        </div>
                        <div className="svc-h">
                          <b>{s.name}</b>
                          <span>{s.desc}</span>
                        </div>
                        <div className="svc-price">{c.on ? money(priceOf(s, c)) : ""}</div>
                        <button
                          className="svc-add"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleService(s.id);
                          }}
                        >
                          {c.on ? "Added ✓" : "Add"}
                        </button>
                      </div>
                      <div
                        className="svc-cfg"
                        ref={(el) => {
                          cfgRefs.current[s.id] = el;
                        }}
                      >
                        <div className="svc-cfg-in">
                          {s.choose ? (
                            <div className="cfg-row">
                              <div className="rl">Choose a package</div>
                              <div className="opts">
                                {s.choose.map((o, i) => (
                                  <button
                                    type="button"
                                    key={o.name}
                                    className={`opt${c.choose === i ? " on" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      patch(s.id, { choose: i });
                                    }}
                                  >
                                    {o.name}
                                    <span className="p">{money(o.price)}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          {s.hours ? (
                            <div className="cfg-row">
                              <div className="rl">Hours · {money(s.hours.rate)}/hr</div>
                              <div className="stepper">
                                <button
                                  type="button"
                                  aria-label={`Fewer hours of ${s.name}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    stepHours(s, -1);
                                  }}
                                >
                                  −
                                </button>
                                <span className="v">{c.hours} hrs</span>
                                <button
                                  type="button"
                                  aria-label={`More hours of ${s.name}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    stepHours(s, 1);
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ) : null}
                          {s.addons ? (
                            <div className="cfg-row">
                              <div className="rl">Add-ons</div>
                              <div className="opts">
                                {s.addons.map((a, i) => (
                                  <div
                                    className={`addon${c.addons.includes(i) ? " on" : ""}`}
                                    key={a.name}
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleAddon(s.id, i);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key !== " " && e.key !== "Enter") return;
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleAddon(s.id, i);
                                    }}
                                  >
                                    <span className="ck">
                                      <span>✓</span>
                                    </span>
                                    {a.name}
                                    <span className="p">+{money(a.price)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          <div className="cfg-row">
                            <div className="rl">Other / custom request</div>
                            <input
                              className="svc-other"
                              type="text"
                              placeholder="Optional — anything specific for this service"
                              aria-label={`Custom request for ${s.name}`}
                              value={c.other}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => patch(s.id, { other: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className="lab"
                style={{
                  fontFamily: "var(--fmono)",
                  fontSize: "11px",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--tx3)",
                  margin: "26px 0 4px",
                }}
              >
                4 · Anything else?
              </div>
              <div className="card">
                <textarea
                  className="gnotes"
                  aria-label="Anything else we should know"
                  placeholder="Parking notes, must-play songs, accessibility needs, exact timing, a theme — anything we should know."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <aside className="summary">
              <div className="sm-card">
                <h3>Your request</h3>
                <div className="sm-ev">
                  <b>{basics.type}</b> · {dateLabel} · {basics.guests} guests
                </div>
                <div className="sm-lines">
                  {lines.length ? (
                    <>
                      {lines.map((l) => (
                        <div className="sm-line" key={l.name}>
                          <span className="n">{l.name}</span>
                          <b>{money(l.price)}</b>
                        </div>
                      ))}
                      {hasNotes ? (
                        <div className="sm-line">
                          <span className="n">Custom requests</span>
                          <b>noted</b>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="sm-empty">Add a service to start your quote.</div>
                  )}
                </div>
                <div className="sm-total">
                  <span>Estimated total</span>
                  <b>{money(disp)}</b>
                </div>
                <p className="sm-note">
                  Estimate only — you’ll confirm every detail before anything is booked. No payment
                  now.
                </p>
                <button className="sm-send" type="button" ref={sendRef} onClick={send}>
                  Send my request →
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <div className={`ok${sent ? " show" : ""}`}>
        <div className="ok-card">
          <div className="ok-check">✓</div>
          <h3>Request sent!</h3>
          <p>
            We’ll match you with vetted local pros and reply within 24 hours with a firm quote.
          </p>
          <div className="ok-total">Estimated total: {money(total)}</div>
          <button
            className="sm-send"
            style={{
              background: "var(--ink-900)",
              color: "#fff",
              maxWidth: "200px",
              margin: "0 auto",
            }}
            type="button"
            onClick={() => setSent(false)}
          >
            Done
          </button>
        </div>
      </div>
      <canvas id="okCf" aria-hidden="true" ref={canvasRef} />

      <footer className="foot">
        <div className="wrap">© 2026 Events &amp; Media · Demo build · Synthetic data only</div>
      </footer>
    </div>
  );
}
