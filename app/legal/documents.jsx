// Body copy for the two legal routes, lifted verbatim from
// public/assets/legal-pages/privacy.html and terms.html. Section `title` doubles
// as the <h2> and the table-of-contents label — the references use the same
// wording for both.
//
// These are plain elements passed from the server pages into the client
// LegalView, so keep them free of handlers and other non-serialisable props.

const CONTACT_LINK_STYLE = { color: "var(--txacc)", fontWeight: 600 };

const UPDATED = "Last updated August 2026 · Demo — synthetic placeholder text, not legal advice.";

export const PRIVACY = {
  title: "Privacy Policy",
  updated: UPDATED,
  sections: [
    {
      id: "intro",
      title: "Overview",
      body: (
        <p>
          Events &amp; Media (“we”) connects people with local event and media professionals. This
          policy explains what we collect and how we use it.
        </p>
      ),
    },
    {
      id: "collect",
      title: "Information we collect",
      body: (
        <>
          <p>We collect what you share when you build a request or create an account:</p>
          <ul>
            <li>Contact details (name, email, phone).</li>
            <li>Event details you enter into the builder.</li>
            <li>Usage data to improve the product.</li>
          </ul>
        </>
      ),
    },
    {
      id: "use",
      title: "How we use it",
      body: (
        <p>
          To match you with vetted pros, send quotes, and improve our service. We never sell your
          personal data.
        </p>
      ),
    },
    {
      id: "share",
      title: "Sharing",
      body: (
        <p>
          We share only the details a matched pro needs to serve your event, and with providers that
          run our platform.
        </p>
      ),
    },
    {
      id: "rights",
      title: "Your rights",
      body: (
        <p>
          You can access, correct or delete your data anytime by contacting us. You control marketing
          preferences from your account.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <p>
          Questions? Email hello@eventsandmedia.demo or use our{" "}
          <a href="/#contact" style={CONTACT_LINK_STYLE}>
            contact page
          </a>
          .
        </p>
      ),
    },
  ],
};

export const TERMS = {
  title: "Terms of Service",
  updated: UPDATED,
  sections: [
    {
      id: "intro",
      title: "Agreement",
      body: <p>By using Events &amp; Media you agree to these terms. Please read them.</p>,
    },
    {
      id: "service",
      title: "The service",
      body: (
        <p>
          We are a marketplace that connects you with independent local pros. We facilitate requests
          and quotes; the pros deliver the services.
        </p>
      ),
    },
    {
      id: "accounts",
      title: "Accounts",
      body: (
        <p>
          You’re responsible for your account and for the accuracy of the details you submit.
        </p>
      ),
    },
    {
      id: "pricing",
      title: "Pricing & quotes",
      body: (
        <p>
          All prices shown are sample estimates. Final pricing is confirmed in your quote before
          anything is booked.
        </p>
      ),
    },
    {
      id: "conduct",
      title: "Acceptable use",
      body: (
        <p>Don’t misuse the platform, submit false requests, or infringe others’ rights.</p>
      ),
    },
    {
      id: "liability",
      title: "Liability",
      body: (
        <p>
          The service is provided “as is” for this demo. We are not liable for third-party services
          in this placeholder build.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <p>
          Reach us anytime via the{" "}
          <a href="/#contact" style={CONTACT_LINK_STYLE}>
            contact page
          </a>
          .
        </p>
      ),
    },
  ],
};
