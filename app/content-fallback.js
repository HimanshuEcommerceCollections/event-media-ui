/**
 * Static copy of the landing page content, in the exact shape HomeView renders.
 *
 * Used when GET /api/v1/content/home cannot be reached — during `next build`
 * without the API running, or if the backend is down. The landing page is the
 * shop window, so it renders complete content rather than an empty shell.
 *
 * These values are the same ones the API seeds from, so the two agree. Update
 * both together (backend/src/db/seed.ts).
 */
export const FALLBACK_CONTENT = {
  services: [
    {
      slug: "party-rentals",
      no: "01",
      title: "Party rentals",
      blurb: "Chairs, tables, tents — partner-fulfilled.",
      priceLabel: "from $1.75 / chair",
      isB2b: false,
      imagePath: "/assets/svc-01-party-rentals.jpg",
      imageAlt: "Decorated event venue",
      iconKey: "tent",
    },
    {
      slug: "entertainers",
      no: "02",
      title: "Entertainers",
      blurb: "Magicians, face painters and more, by the hour.",
      priceLabel: "from $160",
      isB2b: false,
      imagePath: "/assets/svc-02-entertainers.jpg",
      imageAlt: "Face-painting entertainer",
      iconKey: "star",
    },
    {
      slug: "dj-music",
      no: "03",
      title: "DJ + music",
      blurb: "By the hour with uplighting and booth add-ons.",
      priceLabel: "$125 / hr",
      isB2b: false,
      imagePath: "/assets/svc-03-dj-music.jpg",
      imageAlt: "DJ at a party",
      iconKey: "disc",
    },
    {
      slug: "photo-video",
      no: "04",
      title: "Photo + video",
      blurb: "From a two-hour session to a cinematic package.",
      priceLabel: "from $395",
      isB2b: false,
      imagePath: "/assets/svc-04-photo-video.jpg",
      imageAlt: "Videographer recording",
      iconKey: "camera",
    },
    {
      slug: "virtual-tours",
      no: "05",
      title: "Virtual tours",
      blurb: "3D walkthroughs for realtors, by square footage.",
      priceLabel: "from $199",
      isB2b: true,
      imagePath: "/assets/svc-05-virtual-tours.jpg",
      imageAlt: "Virtual tour with VR",
      iconKey: "house",
    },
    {
      slug: "drone-video",
      no: "06",
      title: "Drone video",
      blurb: "Aerial footage as an add-on or standalone flight.",
      priceLabel: "from $175",
      isB2b: true,
      imagePath: "/assets/svc-06-drone-video.jpg",
      imageAlt: "Drone operator",
      iconKey: "drone",
    },
  ],
  events: [
    {
      slug: "reeves-wedding",
      name: "The Reeves Wedding",
      year: "2026",
      totalLabel: "$6,480",
      imagePath: "/assets/ev-01-reeves-wedding.jpg",
      imageAlt: "Wedding being filmed",
    },
    {
      slug: "downtown-gala",
      name: "Downtown Gala",
      year: "2026",
      totalLabel: "$3,900",
      imagePath: "/assets/ev-02-downtown-gala.jpg",
      imageAlt: "Luxury gala",
    },
    {
      slug: "maple-st-birthday",
      name: "Maple St Birthday",
      year: "2026",
      totalLabel: "$1,240",
      imagePath: "/assets/ev-03-maple-st-birthday.jpg",
      imageAlt: "Celebration venue",
    },
    {
      slug: "elm-st-listing",
      name: "Elm St Listing",
      year: "2026",
      totalLabel: "$624",
      imagePath: "/assets/ev-04-elm-st-listing.jpg",
      imageAlt: "Listing property",
    },
  ],
  marquee: ["Weddings", "Birthdays", "Corporate", "Galas", "Listings", "Drone"],
  testimonials: [
    {
      quote:
        "One form and our whole wedding was handled — DJ, rentals, photographer, all on a single quote. I stopped emailing five vendors.",
      name: "Jordan & Riya",
      role: "Wedding · Raleigh",
      initials: "JR",
    },
    {
      quote:
        "The running total is the best part — I could see exactly what each add-on cost before committing. No surprises on the invoice.",
      name: "Marcus P.",
      role: "Corporate gala",
      initials: "MP",
    },
    {
      quote:
        "I order listing media every week now. Virtual tour plus drone in one request, delivered the next day. It's my default.",
      name: "Sana L.",
      role: "Realtor · B2B",
      initials: "SL",
    },
    {
      quote:
        "Booked a magician, a bounce castle and a photographer for my son's birthday in ten minutes flat. The coordinator handled the rest.",
      name: "Priya N.",
      role: "Kids' birthday",
      initials: "PN",
    },
  ],
  stats: [
    { key: "services_count", value: 6, prefix: "", suffix: "", label: "services, one request" },
    { key: "reply_days", value: 1, prefix: "", suffix: "", label: "business-day reply" },
    { key: "accuracy", value: 100, prefix: "", suffix: "%", label: "penny-accurate total" },
    { key: "submit_cost", value: 0, prefix: "$", suffix: "", label: "to submit a request" },
  ],
};

/** Maps the API's /content/home payload into the shape HomeView renders. */
export function mapHomeContent(data) {
  return {
    services: data.services.map((s) => ({
      slug: s.slug,
      no: s.no,
      title: s.title,
      blurb: s.blurb,
      priceLabel: s.price.label,
      isB2b: s.isB2b,
      imagePath: s.image.path,
      imageAlt: s.image.alt,
      iconKey: s.iconKey,
    })),
    events: data.featuredEvents.map((e) => ({
      slug: e.slug,
      name: e.name,
      year: String(e.year),
      totalLabel: e.totalLabel,
      imagePath: e.image.path,
      imageAlt: e.image.alt,
    })),
    marquee: data.categories.map((c) => c.label),
    testimonials: data.testimonials.map((t) => ({
      quote: t.quote,
      name: t.authorName,
      role: t.authorRole,
      initials: t.initials,
    })),
    stats: data.stats.map((s) => ({
      key: s.key,
      value: s.value,
      prefix: s.prefix,
      suffix: s.suffix,
      label: s.label,
    })),
  };
}
