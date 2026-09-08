/**
 * Offline copy of the drone-video service page, in the exact shape the API returns.
 *
 * GENERATED — do not edit. Run `node scripts/generate-fallbacks.mjs` with the
 * API running to refresh it. Source: GET /api/v1/content/services/drone-video
 */
export const DRONE_VIDEO_FALLBACK = {
  "slug": "drone-video",
  "no": "06",
  "title": "Drone video",
  "blurb": "Aerial footage as an add-on or standalone flight.",
  "price": {
    "label": "from $175",
    "cents": 17500,
    "unit": null
  },
  "isB2b": true,
  "image": {
    "path": "/assets/svc-06-drone-video.jpg",
    "alt": "Drone operator"
  },
  "iconKey": "drone",
  "href": "/services/drone-video",
  "hero": {
    "lede": "Insured pilots, 4K aerials — as an add-on or a flight of its own.",
    "kicker": "Service 06",
    "heading": "Drone video"
  },
  "pricing": {
    "model": "packs",
    "packs": [
      {
        "key": "addon",
        "name": "Add-on to a shoot",
        "cents": 17500
      },
      {
        "key": "standalone",
        "name": "Standalone flight",
        "cents": 45000
      }
    ],
    "addons": [
      {
        "key": "highlight-reel",
        "name": "Edited highlight reel",
        "cents": 15000
      },
      {
        "key": "extra-location",
        "name": "Extra location",
        "cents": 12000
      },
      {
        "key": "twilight",
        "name": "Twilight flight",
        "cents": 9000
      },
      {
        "key": "raw-4k",
        "name": "Raw 4K files",
        "cents": 6000
      }
    ]
  },
  "blocks": {
    "faq": [
      {
        "answer": "Yes — every flight is flown by an insured local pilot who handles airspace rules.",
        "question": "Are your pilots insured?"
      },
      {
        "answer": "Absolutely — add it to a virtual-tour request for a full media package.",
        "question": "Can drone pair with a listing tour?"
      },
      {
        "answer": "4K aerial video and stills; add an edited highlight reel if you’d like.",
        "question": "What do we receive?"
      }
    ],
    "included": [
      {
        "text": "FAA-licensed, insured pilot"
      },
      {
        "text": "4K aerial video + stills"
      },
      {
        "text": "Pre-flight site & airspace check"
      },
      {
        "text": "Edited reel on request"
      }
    ],
    "intro": [
      {
        "name": "Insured pilots",
        "text": "Flown by insured local operators."
      },
      {
        "name": "Add-on or standalone",
        "text": "Pair with a shoot or book alone."
      },
      {
        "name": "4K + stills",
        "text": "Aerial video and photos, edited on request."
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
        "isCurrent": false
      },
      {
        "href": "/services/drone-video",
        "label": "Drone video",
        "slug": "drone-video",
        "isCurrent": true
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
        "isCurrent": false
      },
      {
        "href": "/services/drone-video",
        "label": "Drone video",
        "idx": "06",
        "isCurrent": true
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
