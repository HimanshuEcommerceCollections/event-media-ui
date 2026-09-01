"use client";

// Legal document shell — ported from public/assets/legal-pages/privacy.html
// and terms.html. Those two references are identical apart from the <title>,
// the <h1> and the body sections, so both routes render this one component
// with their own document from ./documents. legal.css is their (byte-identical)
// <style> block copied verbatim.
//
// The reference's vanilla JS is reimplemented below with the same numbers:
// nav "scrolled" at y > 30, and the table-of-contents scroll-spy at
// IntersectionObserver rootMargin "-40% 0px -55% 0px".
//
// Deliberately not ported (a no-op in the reference itself): the `.rise`
// scroll-reveal observer. Neither document puts that class on any element, so
// the reference observes nothing. See legal.css for the same note.
//
// Link mapping follows the other ported pages: the reference's relative
// document links become app routes — home and "Build my event" → "/", the
// services menu → "/services/*", Events/About/Contact → the matching landing
// page anchors. "Commercial" is dropped from the footer because this app has
// no such route or anchor to point it at.

import { useEffect, useRef, useState } from "react";
import "./legal.css";

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

export default function LegalView({ doc }) {
  const navRef = useRef(null);
  const bodyRef = useRef(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [activeId, setActiveId] = useState(doc.sections[0]?.id ?? "");

  /* ---------- nav background on scroll ---------- */
  useEffect(() => {
    const apply = () => {
      if (navRef.current) navRef.current.classList.toggle("scrolled", window.scrollY > 30);
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    return () => window.removeEventListener("scroll", apply);
  }, []);

  /* ---------- services dropdown ---------- */
  useEffect(() => {
    if (!dropOpen) return undefined;
    const onDoc = () => setDropOpen(false);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [dropOpen]);

  /* ---------- table-of-contents scroll-spy ---------- */
  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return undefined;
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    root.querySelectorAll("section[id]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [doc]);

  return (
    <div>
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
                  <a href={l.href} key={l.href}>
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
            <a className="pn-item" href="/signin">
              Sign in
            </a>
            <a className="pn-item pn-cta" href="/">
              Build my event
            </a>
          </div>
        </div>
      </nav>

      <header className="l-head">
        <div className="wrap">
          <p className="eyebrow">Legal</p>
          <h1>{doc.title}</h1>
          <p>{doc.updated}</p>
        </div>
      </header>

      <main className="l-main">
        <div className="wrap">
          <div className="l-grid">
            <nav className="l-toc">
              <div className="lab">On this page</div>
              {doc.sections.map((s) => (
                <a
                  className={activeId === s.id ? "on" : undefined}
                  href={`#${s.id}`}
                  key={s.id}
                >
                  {s.title}
                </a>
              ))}
            </nav>
            <div className="l-body" ref={bodyRef}>
              <div className="l-note">
                This is a demo page with placeholder content for layout purposes only.
              </div>
              {doc.sections.map((s) => (
                <section id={s.id} key={s.id}>
                  <h2>{s.title}</h2>
                  {s.body}
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>

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
              <a className="fl" href="/#events">
                Events
              </a>
              <a className="fl" href="/reviews">
                Reviews
              </a>
              <a className="fl" href="/#contact">
                Contact
              </a>
            </div>
            <div>
              <h4>Get started</h4>
              <a className="fl" href="/">
                Build my event
              </a>
              <a className="fl" href="/signin">
                Sign in
              </a>
              <a className="fl" href="/legal/privacy">
                Privacy
              </a>
              <a className="fl" href="/legal/terms">
                Terms
              </a>
            </div>
          </div>
          <div className="fine">
            <span>© 2026 Events &amp; Media · Demo build · noindex</span>
            <span>Synthetic data only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
