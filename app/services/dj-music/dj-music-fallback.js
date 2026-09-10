/**
 * Offline copy of the dj-music service page, in the exact shape the API returns.
 *
 * GENERATED — do not edit. Run `node scripts/generate-fallbacks.mjs` with the
 * API running to refresh it. Source: GET /api/v1/content/services/dj-music
 */
export const DJ_MUSIC_FALLBACK = {
  "slug": "dj-music",
  "no": "03",
  "title": "DJ + music",
  "blurb": "By the hour with uplighting and booth add-ons.",
  "price": {
    "label": "$125 / hr",
    "cents": 12500,
    "unit": "hour"
  },
  "isB2b": false,
  "image": {
    "path": "/assets/svc-03-dj-music.jpg",
    "alt": "DJ at a party"
  },
  "iconKey": "disc",
  "href": "/services/dj-music",
  "hero": {
    "lede": "Pro local DJs by the hour, with the add-ons that make a room move.",
    "kicker": "Service 03",
    "heading": "DJ + music"
  },
  "pricing": {
    "model": "hourly",
    "addons": [
      {
        "key": "uplighting",
        "name": "Uplighting",
        "cents": 9500,
        "label": "+$95"
      },
      {
        "key": "fog",
        "name": "Fog machine",
        "cents": 4500,
        "label": "+$45"
      },
      {
        "key": "mc",
        "name": "MC services",
        "cents": 11000,
        "label": "+$110"
      },
      {
        "key": "booth",
        "name": "Photo booth",
        "cents": 25000,
        "label": "+$250"
      }
    ],
    "maxHours": 8,
    "minHours": 2,
    "hourlyCents": 12500
  },
  "blocks": {
    "faq": [
      {
        "answer": "Yes — add MC services and your DJ handles announcements and the run of show.",
        "question": "Can the DJ MC the event too?"
      },
      {
        "answer": "A full PA suited to your headcount and venue is included.",
        "question": "Do you provide the sound system?"
      },
      {
        "answer": "Of course — share must-plays and do-not-plays in your request notes.",
        "question": "Can we send a playlist?"
      }
    ],
    "intro": [
      {
        "name": "Pro local DJs",
        "text": "Reviewed, reliable, genre-flexible."
      },
      {
        "name": "By the hour",
        "text": "2–8 hour sets to match your timeline."
      },
      {
        "name": "Full add-ons",
        "text": "Uplighting, fog, MC and photo booth."
      }
    ]
  },
  "gallery": [],
  "navigation": {
    "services": [
      {
        "href": "/services/party-rentals",
        "label": "Party rentals",
        "slug": "party-rentals",
        "isCurrent": false
      },
      {
        "href": "/services/entertainers",
        "label": "Entertainers",
        "slug": "entertainers",
        "isCurrent": false
      },
      {
        "href": "/services/dj-music",
        "label": "DJ + music",
        "slug": "dj-music",
        "isCurrent": true
      },
      {
        "href": "/services/photo-video",
        "label": "Photo + video",
        "slug": "photo-video",
        "isCurrent": false
      },
      {
        "href": "/services/virtual-tours",
        "label": "Virtual tours",
        "slug": "virtual-tours",
        "isCurrent": false
      },
      {
        "href": "/services/drone-video",
        "label": "Drone video",
        "slug": "drone-video",
        "isCurrent": false
      }
    ],
    "menu": [
      {
        "href": "/",
        "label": "Home",
        "idx": "00",
        "isCurrent": false
      },
      {
        "href": "/services/party-rentals",
        "label": "Party rentals",
        "idx": "01",
        "isCurrent": false
      },
      {
        "href": "/services/entertainers",
        "label": "Entertainers",
        "idx": "02",
        "isCurrent": false
      },
      {
        "href": "/services/dj-music",
        "label": "DJ + music",
        "idx": "03",
        "isCurrent": true
      },
      {
        "href": "/services/photo-video",
        "label": "Photo + video",
        "idx": "04",
        "isCurrent": false
      },
      {
        "href": "/services/virtual-tours",
        "label": "Virtual tours",
        "idx": "05",
        "isCurrent": false
      },
      {
        "href": "/services/drone-video",
        "label": "Drone video",
        "idx": "06",
        "isCurrent": false
      },
      {
        "href": "/reviews",
        "label": "Reviews",
        "idx": "→",
        "isCurrent": false
      }
    ]
  }
};
