// Shared site footer, rendered by every route. The markup and link lists are
// the landing page's footer (the four-column block); the routes that used to
// ship their own variant — a different column set, or the single mono line on
// /about, /build, /contact and /dashboard — now render this instead.
//
// A plain server component: no state, no effects, so it costs each route
// nothing. `data-cursor="link"` is kept on the links because the landing page's
// custom cursor keys off it; on routes without that script it is inert.

import "./site-footer.css";

const SERVICES = [
  { href: "/services/party-rentals", label: "Party rentals" },
  { href: "/services/entertainers", label: "Entertainers" },
  { href: "/services/dj-music", label: "DJ + music" },
  { href: "/services/photo-video", label: "Photo + video" },
];

const COMMERCIAL = [
  { href: "/services/virtual-tours", label: "Virtual tours" },
  { href: "/services/drone-video", label: "Drone video" },
  { href: "/realtors", label: "For realtors" },
];

const COMPANY = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/vendors", label: "Become a vendor" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

function Column({ heading, links }) {
  return (
    <div>
      <h4>{heading}</h4>
      {links.map((l) => (
        <a className="sf-link" href={l.href} data-cursor="link" key={l.href}>
          {l.label}
        </a>
      ))}
    </div>
  );
}

export default function SiteFooter({ id }) {
  return (
    <footer className="site-foot" id={id}>
      <div className="sf-wrap">
        <div className="sf-cols">
          <div>
            <div className="sf-logo">
              <span className="sf-rings">
                <i />
                <i />
              </span>
              <b>events &amp; media</b>
            </div>
            <p className="sf-desc">
              One request. Whole event covered. A Raleigh marketplace for celebrations and
              commercial media.
            </p>
          </div>
          <Column heading="Services" links={SERVICES} />
          <Column heading="Commercial" links={COMMERCIAL} />
          <Column heading="Company" links={COMPANY} />
        </div>
        <div className="sf-fine">
          <span>© 2026 Events &amp; Media · Demo build · noindex</span>
          <span>
            <a href="/legal/privacy" data-cursor="link">
              Privacy
            </a>{" "}
            ·{" "}
            <a href="/legal/terms" data-cursor="link">
              Terms
            </a>{" "}
            · Synthetic data only
          </span>
        </div>
      </div>
    </footer>
  );
}
