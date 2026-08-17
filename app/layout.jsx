// Root layout. Deliberately imports NO global stylesheet: each page owns its
// own CSS (app/home.css, app/signin/signin.css) copied verbatim from the
// reference documents, including their `html`/`body`/`h1,h2,h3` element rules,
// which differ between the two pages. Keeping them per-route stops one page's
// resets (e.g. the landing page's `body{line-height:1.6}` and
// `img,svg{display:block}`) from altering the other page's layout.
//
// Fonts stay a plain Google Fonts <link> with the exact URL from both
// references so the `--fdisp` / `--fsans` / `--fmono` variables resolve to the
// same family names and render identically.

export const metadata = {
  title: "Events & Media",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
