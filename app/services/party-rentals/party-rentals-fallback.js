/**
 * Offline copy of the party-rentals service page, in the exact shape the API returns.
 *
 * GENERATED — do not edit. Run `node scripts/generate-fallbacks.mjs` with the
 * API running to refresh it. Source: GET /api/v1/content/services/party-rentals
 */
export const PARTY_RENTALS_FALLBACK = {
  "slug": "party-rentals",
  "no": "01",
  "title": "Party rentals",
  "blurb": "Chairs, tables, tents — partner-fulfilled.",
  "price": {
    "label": "from $1.75 / chair",
    "cents": 175,
    "unit": "chair"
  },
  "isB2b": false,
  "image": {
    "path": "/assets/svc-01-party-rentals.jpg",
    "alt": "Decorated event venue"
  },
  "iconKey": "tent",
  "href": "/services/party-rentals",
  "hero": {
    "lede": "Chairs, tables, tents and the trimmings — delivered, staged and collected.",
    "kicker": "Service 01",
    "heading": "Party rentals"
  },
  "pricing": {
    "items": [
      {
        "key": "chair",
        "note": "$1.75 each · steps of 10",
        "step": 10,
        "label": "Folding chair",
        "unitCents": 175
      },
      {
        "key": "table",
        "note": "$9.50 each",
        "step": 1,
        "label": "Round table",
        "unitCents": 950
      },
      {
        "key": "linen",
        "note": "$6.25 each",
        "step": 1,
        "label": "Table linen",
        "unitCents": 625
      },
      {
        "key": "tent",
        "note": "$325.00 each",
        "step": 1,
        "label": "20×20 tent",
        "unitCents": 32500
      },
      {
        "key": "dancefloor",
        "note": "$210.00 each",
        "step": 1,
        "label": "Dance floor",
        "unitCents": 21000
      },
      {
        "key": "lighting",
        "note": "$145.00 each",
        "step": 1,
        "label": "String-light kit",
        "unitCents": 14500
      }
    ],
    "model": "items",
    "chairVizMax": 80,
    "startQuantities": {
      "tent": 0,
      "chair": 40,
      "linen": 5,
      "table": 5,
      "lighting": 0,
      "dancefloor": 0
    }
  },
  "blocks": {
    "faq": [
      {
        "answer": "Yes — delivery, setup and pickup are coordinated with the fulfilling partner and included in your request.",
        "question": "Do you deliver and set up?"
      },
      {
        "answer": "Most partners have a small minimum; the builder will flag it before you submit.",
        "question": "Is there a minimum order?"
      },
      {
        "answer": "Two to three weeks is ideal for peak-season weekends.",
        "question": "How far ahead should I book?"
      }
    ],
    "intro": [
      {
        "name": "Delivered & set up",
        "text": "We handle drop-off, staging and collection."
      },
      {
        "name": "Partner-fulfilled",
        "text": "Vetted local inventory, not warehoused by us."
      },
      {
        "name": "Priced per item",
        "text": "See the per-piece cost before you commit."
      }
    ],
    "kit": [
      {
        "key": "backyard",
        "name": "Backyard Party",
        "includes": [
          "30 folding chairs",
          "4 round tables",
          "4 table linens",
          "String-light kit"
        ],
        "imageFile": "kit-backyard-party.jpg",
        "quantities": {
          "tent": 0,
          "chair": 30,
          "linen": 4,
          "table": 4,
          "lighting": 1,
          "dancefloor": 0
        }
      },
      {
        "key": "wedding",
        "name": "The Wedding",
        "includes": [
          "120 folding chairs",
          "15 round tables",
          "15 table linens",
          "20×20 tent",
          "Dance floor",
          "2 string-light kits"
        ],
        "imageFile": "kit-wedding.jpg",
        "quantities": {
          "tent": 1,
          "chair": 120,
          "linen": 15,
          "table": 15,
          "lighting": 2,
          "dancefloor": 1
        }
      },
      {
        "key": "birthday",
        "name": "Kids' Birthday",
        "includes": [
          "20 folding chairs",
          "3 round tables",
          "3 table linens",
          "String-light kit"
        ],
        "imageFile": "kit-kids-birthday.jpg",
        "quantities": {
          "tent": 0,
          "chair": 20,
          "linen": 3,
          "table": 3,
          "lighting": 1,
          "dancefloor": 0
        }
      }
    ],
    "polaroid": [
      {
        "top": "6%",
        "left": "2%",
        "label": "Setup",
        "rotate": "-6deg",
        "imageFile": "ba-styled.jpg"
      },
      {
        "top": "30%",
        "left": "23%",
        "label": "The moment",
        "rotate": "4deg",
        "imageFile": "polaroid-moment.jpg"
      },
      {
        "top": "3%",
        "left": "45%",
        "label": "Head table",
        "rotate": "-3deg",
        "imageFile": "polaroid-head-table.jpg"
      },
      {
        "top": "34%",
        "left": "60%",
        "label": "Little guests",
        "rotate": "7deg",
        "imageFile": "polaroid-little-guests.jpg"
      },
      {
        "top": "12%",
        "left": "78%",
        "label": "First dance",
        "rotate": "-5deg",
        "imageFile": "polaroid-first-dance.jpg"
      }
    ],
    "step": [
      {
        "no": "01",
        "text": "We drop everything at your venue, on schedule.",
        "heading": "Deliver",
        "iconKey": "truck"
      },
      {
        "no": "02",
        "text": "Our partners stage chairs, tables and decor.",
        "heading": "Set up",
        "iconKey": "gear"
      },
      {
        "no": "03",
        "text": "You enjoy the day — nothing to haul or fuss.",
        "heading": "Celebrate",
        "iconKey": "brush"
      },
      {
        "no": "04",
        "text": "We pack it all down and take it away after.",
        "heading": "Collect",
        "iconKey": "box"
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
        "isCurrent": true
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
        "isCurrent": true
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
