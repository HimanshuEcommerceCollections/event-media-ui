"use client";

// Become a vendor — ported from
// public/assets/vendors-extracted/vendors.html.
// vendors.css is that document's <style> block copied verbatim. The
// reference's vanilla JS is reimplemented below with the same numbers:
// reveal IntersectionObserver threshold .14, nav "scrolled" at y > 30, the
// earnings estimator's craft rates and its .88 take-home multiplier, and the
// same submit-time validation — name non-empty, email against
// /^[^@\s]+@[^@\s]+\.[^@\s]+$/ — painting `.bad` on the offending field.
//
// The application form posts to POST /api/v1/vendors/applications. The
// reference's single "category" select is a multi-select of real service
// slugs, because that is what the endpoint takes and a vendor usually covers
// more than one; the slugs come from GET /vendors/service-types, with the
// reference's own list as the offline fallback. Choosing drone work reveals
// the Part-107 block the endpoint requires — collected as typed and never
// presented as a certification, exactly as the backend stores it.
//
// Link mapping follows the other ported pages: home → "/", the services menu
// → "/services/*", Events → the landing page anchor, and the rest to their
// own routes.

import { useEffect, useRef, useState } from "react";
import { ApiError, getVendorApplication, getVendorServiceTypes, submitVendorApplication } from "../../lib/api";
import { loadSession } from "../../lib/session";
import "./vendors.css";
import NavAuth from "../components/NavAuth";
import SiteFooter from "../components/SiteFooter";

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

// The reference sets these attributes inline on every icon in the page.
const LineIcon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    style={{ width: "1em", height: "1em", verticalAlign: "-.12em" }}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
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

const BENEFITS = [
  {
    h: "Steady local leads",
    p: "Matched requests from real clients in your area — no cold outreach.",
    icon: (
      <>
        <path d="M3 12V4h8l9 9-8 8z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </>
    ),
  },
  {
    h: "You set your prices",
    p: "Keep control of your rates and your calendar.",
    icon: (
      <>
        <line x1="12" y1="3" x2="12" y2="21" />
        <path d="M16 7.5C16 6.1 14.2 5 12 5S8 6 8 7.5 9.8 10 12 10s4 1 4 2.5S14.2 15 12 15s-4-1.1-4-2.5" />
      </>
    ),
  },
  {
    h: "We handle the busywork",
    p: "Scheduling, reminders and payments, sorted.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </>
    ),
  },
  {
    h: "Keep your brand",
    p: "Reviews and repeat clients build your reputation, not ours.",
    icon: <path d="M12 3l2.6 6.3L21 10l-5 4.2L17.5 21 12 17.3 6.5 21 8 14.2 3 10l6.4-.7z" />,
  },
];

const STEPS = [
  { n: "1", h: "Apply in minutes", p: "Tell us your craft, your area and your rates." },
  { n: "2", h: "Get verified", p: "We check references and insurance — quality matters." },
  { n: "3", h: "Start getting matched", p: "Accept the requests that fit. Get paid on time." },
];

// cents per booking, exactly as the reference's CRAFT table.
const CRAFTS = [
  { name: "DJ", rate: 90000 },
  { name: "Photo/Video", rate: 140000 },
  { name: "Entertainer", rate: 70000 },
  { name: "Rentals", rate: 110000 },
  { name: "Drone", rate: 45000 },
];

// What a pro keeps after the platform fee the note mentions.
const TAKE_HOME = 0.88;

// What the form falls back to when /vendors/service-types cannot be reached.
// The slugs are the catalogue's own, so an application submitted offline-ish
// still names services the server will recognise.
const FALLBACK_SERVICES = [
  { key: "dj-music", label: "DJ + music", requiresPart107: false, isB2b: false },
  { key: "photo-video", label: "Photo + video", requiresPart107: false, isB2b: false },
  { key: "entertainers", label: "Entertainers", requiresPart107: false, isB2b: false },
  { key: "party-rentals", label: "Party rentals", requiresPart107: false, isB2b: false },
  { key: "drone-video", label: "Drone video", requiresPart107: true, isB2b: false },
  { key: "virtual-tours", label: "Virtual tours", requiresPart107: false, isB2b: true },
];

const REFERENCE = /^EVV-\d{4}-\d{4,}$/;

const BLANK_FORM = {
  contactName: "",
  businessName: "",
  email: "",
  phone: "",
  website: "",
  serviceArea: "",
  yearsActive: "",
  portfolioUrl: "",
  notes: "",
  certificateNumber: "",
  expiresOn: "",
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Whole dollars — the estimator deals in monthly earnings, where cents are
// noise.
const money = (c) => `$${Math.round(c / 100).toLocaleString("en-US")}`;

const ASSET = (name) => `/assets/vendors/${name}`;

export default function VendorsView() {
  const rootRef = useRef(null);
  const navRef = useRef(null);

  const [dropOpen, setDropOpen] = useState(false);
  const [craftIdx, setCraftIdx] = useState(0);
  const [jobs, setJobs] = useState(6);
  const [form, setForm] = useState(BLANK_FORM);
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [picked, setPicked] = useState([]);
  const [bad, setBad] = useState({});
  const [hint, setHint] = useState("");
  const [sending, setSending] = useState(false);
  // The submitted application, once the server has it. Carries the EVV
  // reference, which is the only thing the applicant needs to keep.
  const [sent, setSent] = useState(null);

  const [lookup, setLookup] = useState("");
  const [lookupHint, setLookupHint] = useState("");
  const [found, setFound] = useState(null);

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
      { threshold: 0.14 },
    );
    root.querySelectorAll(".rise").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

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

  /* ---------- what can be applied for ---------- */
  useEffect(() => {
    let live = true;
    getVendorServiceTypes()
      .then((rows) => {
        if (live && Array.isArray(rows) && rows.length > 0) setServices(rows);
      })
      .catch(() => {
        // The API is down or blocked. FALLBACK_SERVICES already names the
        // catalogue's slugs, so the form stays usable rather than empty.
      });
    return () => {
      live = false;
    };
  }, []);

  /* ---------- application form ---------- */
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const togglePick = (key) =>
    setPicked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  // The backend asks for Part-107 details when drone work is among the
  // services, so the block appears exactly when the catalogue says it applies.
  const needsPart107 = services.some((s) => s.requiresPart107 && picked.includes(s.key));

  const onSubmit = async (e) => {
    e.preventDefault();

    const next = {
      contactName: form.contactName.trim().length < 2,
      businessName: form.businessName.trim().length < 2,
      email: !EMAIL.test(form.email),
      services: picked.length === 0,
      certificateNumber: needsPart107 && !form.certificateNumber.trim(),
    };
    setBad(next);
    setHint("");
    if (Object.values(next).some(Boolean)) return;

    const trimmed = (v) => {
      const t = v.trim();
      return t === "" ? undefined : t;
    };

    const body = {
      businessName: form.businessName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      serviceTypes: picked,
      phone: trimmed(form.phone),
      website: trimmed(form.website),
      serviceArea: trimmed(form.serviceArea),
      yearsActive: form.yearsActive === "" ? undefined : Number(form.yearsActive),
      portfolioUrl: trimmed(form.portfolioUrl),
      notes: trimmed(form.notes),
      ...(needsPart107
        ? {
            part107: {
              certificateNumber: form.certificateNumber.trim(),
              expiresOn: trimmed(form.expiresOn),
            },
          }
        : {}),
    };

    setSending(true);
    try {
      // A signed-in applicant gets the application tied to their account, so
      // approving it later finds the user that already exists.
      const application = await submitVendorApplication(body, loadSession()?.accessToken);
      setSent(application);
      setForm(BLANK_FORM);
      setPicked([]);
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = err.fieldErrors();
        setBad({
          contactName: "contactName" in fields,
          businessName: "businessName" in fields,
          email: "email" in fields,
          services: "serviceTypes" in fields,
          certificateNumber: Object.keys(fields).some((f) => f.startsWith("part107")),
        });
        setHint(err.message);
      } else {
        setHint("Something went wrong. Try again.");
      }
    } finally {
      setSending(false);
    }
  };

  /* ---------- checking an application already sent ---------- */
  const onLookup = async (e) => {
    e.preventDefault();
    const reference = lookup.trim().toUpperCase();
    setFound(null);
    if (!REFERENCE.test(reference)) {
      setLookupHint("References look like EVV-2026-0001.");
      return;
    }
    setLookupHint("");
    try {
      setFound(await getVendorApplication(reference));
    } catch (err) {
      setLookupHint(
        err instanceof ApiError ? err.message : "Could not check that reference right now.",
      );
    }
  };

  const monthly = CRAFTS[craftIdx].rate * jobs * TAKE_HOME;

  return (
    <div ref={rootRef}>
      <div className="demo">
        Demo build · <b>synthetic data</b> · noindex
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
            <NavAuth />
            <a className="pn-item pn-cta" href="/build">
              Build my event
            </a>
          </div>
        </div>
      </nav>

      <header className="v-hero">
        <div className="bg" style={{ backgroundImage: `url('${ASSET("hero-bg.jpg")}')` }} />
        <div className="wrap">
          <h1 className="rise">Do what you love. We’ll bring the bookings.</h1>
          <p className="rise">
            Join Raleigh’s vetted network of event pros — steady local leads, your prices, your
            brand. We handle the rest.
          </p>
          <div className="v-cta rise">
            <a className="btn btn-primary" href="#apply">
              Apply to join →
            </a>
            <a className="btn btn-ghost" href="#how">
              How it works
            </a>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Why pros join</p>
            <h2>Booked, not buried in admin</h2>
          </div>
          <div className="ben">
            {BENEFITS.map((b) => (
              <div className="b rise" key={b.h}>
                <div className="ic">
                  <LineIcon>{b.icon}</LineIcon>
                </div>
                <h3>{b.h}</h3>
                <p>{b.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="how" style={{ background: "var(--sunken)" }}>
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Getting started</p>
            <h2>Three steps to your first booking</h2>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step rise" key={s.n}>
                <div className="n">{s.n}</div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec est">
        <div className="sec-bg" style={{ backgroundImage: `url('${ASSET("est-bg.jpg")}')` }} />
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Earnings estimator</p>
            <h2 style={{ color: "#fff" }}>See your monthly potential</h2>
          </div>
          <div className="est-card rise">
            <div className="est-l">
              <div className="rl">Your craft</div>
              <div className="est-opts">
                {CRAFTS.map((c, i) => (
                  <button
                    type="button"
                    key={c.name}
                    className={`est-opt${craftIdx === i ? " on" : ""}`}
                    onClick={() => setCraftIdx(i)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <div className="rl">Jobs per month</div>
              <div className="est-slider">
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={jobs}
                  aria-label="Bookings per month"
                  onChange={(e) => setJobs(Number(e.target.value))}
                />
                <div className="v">
                  <span>{jobs}</span> bookings / month
                </div>
              </div>
            </div>
            <div className="est-r">
              <div className="big">{money(monthly)}</div>
              <div className="sub">est. monthly</div>
              <div className="note">You keep your rate — a small platform fee applies.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="apply">
        <div className="wrap">
          <div className="head rise">
            <p className="eyebrow">Apply</p>
            <h2>Join the network</h2>
          </div>
          {sent ? null : (
            <div className="vform rise">
              <form noValidate onSubmit={onSubmit}>
                <div className="frow">
                  <div className={`field${bad.contactName ? " bad" : ""}`}>
                    <label htmlFor="v-name">Your name</label>
                    <input
                      id="v-name"
                      type="text"
                      placeholder="Name"
                      value={form.contactName}
                      onChange={set("contactName")}
                    />
                    <div className="err">Please enter your name.</div>
                  </div>
                  <div className={`field${bad.businessName ? " bad" : ""}`}>
                    <label htmlFor="v-biz">Business name</label>
                    <input
                      id="v-biz"
                      type="text"
                      placeholder="What you trade as"
                      value={form.businessName}
                      onChange={set("businessName")}
                    />
                    <div className="err">Please enter your business name.</div>
                  </div>
                </div>

                <div className="frow">
                  <div className={`field${bad.email ? " bad" : ""}`}>
                    <label htmlFor="v-email">Email</label>
                    <input
                      id="v-email"
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={set("email")}
                    />
                    <div className="err">Enter a valid email.</div>
                  </div>
                  <div className="field">
                    <label htmlFor="v-phone">Phone</label>
                    <input
                      id="v-phone"
                      type="tel"
                      placeholder="Optional"
                      value={form.phone}
                      onChange={set("phone")}
                    />
                  </div>
                </div>

                <div className={`field${bad.services ? " bad" : ""}`}>
                  <label>What do you provide?</label>
                  <div className="va-picks">
                    {services.map((service) => (
                      <label
                        key={service.key}
                        className={`va-pick${picked.includes(service.key) ? " on" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={picked.includes(service.key)}
                          onChange={() => togglePick(service.key)}
                        />
                        {service.label}
                        {service.isB2b ? <span className="b2b">B2B</span> : null}
                      </label>
                    ))}
                  </div>
                  <div className="err">Choose at least one service you provide.</div>
                </div>

                {needsPart107 && (
                  <div className="va-sub">
                    <h4>Part 107</h4>
                    {/* Collected, never checked. The wording says so rather
                        than implying that sending the number verifies it —
                        the same caveat the backend stores the record with. */}
                    <p className="note">
                      Drone work needs your remote pilot certificate on file. We record what you
                      type here for the coordinator to check against your paperwork — we do not
                      verify it against the FAA registry.
                    </p>
                    <div className="frow">
                      <div className={`field${bad.certificateNumber ? " bad" : ""}`}>
                        <label htmlFor="v-cert">Certificate number</label>
                        <input
                          id="v-cert"
                          type="text"
                          placeholder="e.g. 4001234"
                          value={form.certificateNumber}
                          onChange={set("certificateNumber")}
                        />
                        <div className="err">Enter your Part-107 certificate number.</div>
                      </div>
                      <div className="field">
                        <label htmlFor="v-cert-exp">Expires on</label>
                        <input
                          id="v-cert-exp"
                          type="date"
                          value={form.expiresOn}
                          onChange={set("expiresOn")}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="frow">
                  <div className="field">
                    <label htmlFor="v-area">Service area</label>
                    <input
                      id="v-area"
                      type="text"
                      placeholder="Cities or counties you cover"
                      value={form.serviceArea}
                      onChange={set("serviceArea")}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="v-years">Years active</label>
                    <input
                      id="v-years"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Optional"
                      value={form.yearsActive}
                      onChange={set("yearsActive")}
                    />
                  </div>
                </div>

                <div className="frow">
                  <div className="field">
                    <label htmlFor="v-site">Website</label>
                    <input
                      id="v-site"
                      type="url"
                      placeholder="https://"
                      value={form.website}
                      onChange={set("website")}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="v-portfolio">Portfolio</label>
                    <input
                      id="v-portfolio"
                      type="url"
                      placeholder="https://"
                      value={form.portfolioUrl}
                      onChange={set("portfolioUrl")}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="v-about">Tell us about your work</label>
                  <textarea
                    id="v-about"
                    placeholder="Kit you bring, the events you like, anything a coordinator should know..."
                    value={form.notes}
                    onChange={set("notes")}
                  />
                </div>

                <p className={`va-hint${hint ? " error" : ""}`}>
                  {hint ||
                    "We review new pros within 3 business days. You will get a reference to quote."}
                </p>

                <button className="v-send" type="submit" disabled={sending}>
                  {sending ? "Sending…" : "Submit application"}
                </button>
              </form>
            </div>
          )}

          <div className={`vform v-ok${sent ? " on" : ""}`}>
            <div className="ck">
              <LineIcon>
                <path d="M4 12l5 5L20 6" />
              </LineIcon>
            </div>
            <h2>Application received!</h2>
            <p style={{ color: "var(--tx2)", marginTop: "8px" }}>
              Thanks for applying — our team reviews new pros within 3 business days.
            </p>
            {sent?.reference ? (
              <>
                <div className="va-ref">{sent.reference}</div>
                <p style={{ color: "var(--tx2)", fontSize: ".88rem" }}>
                  Keep this reference. Quote it if you follow up, and check on it below. Once you
                  are approved we email you a link that sets a password and opens your vendor
                  dashboard.
                </p>
              </>
            ) : null}
          </div>

          {/* Applying and checking are both public: an applicant has no
              account to sign into until they have been approved. */}
          <div className="va-lookup rise">
            <p className="eyebrow">Already applied?</p>
            <form noValidate onSubmit={onLookup}>
              <input
                type="text"
                placeholder="EVV-2026-0001"
                aria-label="Application reference"
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
              />
              <button type="submit">Check status</button>
            </form>
            {lookupHint ? (
              <p className="found" style={{ color: "#d0492f" }}>
                {lookupHint}
              </p>
            ) : null}
            {found ? (
              <p className="found">
                <b>{found.businessName}</b> — {String(found.status).replace("_", " ")}
                {found.status === "approved"
                  ? " · check your email for the link that opens your dashboard"
                  : ""}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
