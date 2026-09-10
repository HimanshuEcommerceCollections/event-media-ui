/**
 * Offline copy of the virtual-tours service page, in the exact shape the API returns.
 *
 * GENERATED — do not edit. Run `node scripts/generate-fallbacks.mjs` with the
 * API running to refresh it. Source: GET /api/v1/content/services/virtual-tours
 */
export const VIRTUAL_TOURS_FALLBACK = {
  "slug": "virtual-tours",
  "no": "05",
  "title": "Virtual tours",
  "blurb": "3D walkthroughs for realtors, by square footage.",
  "price": {
    "label": "from $199",
    "cents": 19900,
    "unit": null
  },
  "isB2b": true,
  "image": {
    "path": "/assets/svc-05-virtual-tours.jpg",
    "alt": "Virtual tour with VR"
  },
  "iconKey": "house",
  "href": "/services/virtual-tours",
  "hero": {
    "lede": "3D walkthroughs priced by square footage, hosted and delivered next day.",
    "kicker": "Service 05",
    "heading": "Virtual tours"
  },
  "pricing": {
    "model": "packs",
    "packs": [
      {
        "key": "under-1500",
        "name": "Under 1,500 sq ft",
        "cents": 19900
      },
      {
        "key": "1500-3000",
        "name": "1,500–3,000",
        "cents": 29900
      },
      {
        "key": "3000-5000",
        "name": "3,000–5,000",
        "cents": 44900
      },
      {
        "key": "over-5000",
        "name": "5,000+ sq ft",
        "cents": 64900
      }
    ],
    "addons": [
      {
        "key": "floor-plan",
        "name": "2D floor plan",
        "cents": 7900
      },
      {
        "key": "aerial",
        "name": "Aerial exterior",
        "cents": 14900
      },
      {
        "key": "dollhouse",
        "name": "Dollhouse 3D view",
        "cents": 9900
      },
      {
        "key": "hosting",
        "name": "12-mo hosting",
        "cents": 6000
      }
    ]
  },
  "blocks": {
    "faq": [
      {
        "answer": "As a hosted link you can embed on your listing and MLS.",
        "question": "How is the tour delivered?"
      },
      {
        "answer": "Yes — recurring-shoot volume routes to a coordinator for a custom rate.",
        "question": "Do you offer volume rates?"
      },
      {
        "answer": "Any size; tiers scale to 5,000+ sq ft with custom pricing above.",
        "question": "How large a property can you scan?"
      }
    ],
    "included": [
      {
        "text": "Hosted, shareable tour link"
      },
      {
        "text": "Unlimited walk-through views"
      },
      {
        "text": "Mobile & VR ready"
      },
      {
        "text": "Delivered next business day"
      }
    ],
    "intro": [
      {
        "name": "For realtors",
        "text": "Volume-friendly for repeat listings."
      },
      {
        "name": "Priced by sq ft",
        "text": "Straightforward tiers, no guesswork."
      },
      {
        "name": "Fast delivery",
        "text": "Hosted tour link back the next day."
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
        "isCurrent": false
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
        "isCurrent": true
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
        "isCurrent": false
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
        "isCurrent": true
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
