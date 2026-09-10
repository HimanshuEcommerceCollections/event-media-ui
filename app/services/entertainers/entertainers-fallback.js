/**
 * Offline copy of the entertainers service page, in the exact shape the API returns.
 *
 * GENERATED — do not edit. Run `node scripts/generate-fallbacks.mjs` with the
 * API running to refresh it. Source: GET /api/v1/content/services/entertainers
 */
export const ENTERTAINERS_FALLBACK = {
  "slug": "entertainers",
  "no": "02",
  "title": "Entertainers",
  "blurb": "Magicians, face painters and more, by the hour.",
  "price": {
    "label": "from $160",
    "cents": 16000,
    "unit": null
  },
  "isB2b": false,
  "image": {
    "path": "/assets/svc-02-entertainers.jpg",
    "alt": "Face-painting entertainer"
  },
  "iconKey": "star",
  "href": "/services/entertainers",
  "hero": {
    "lede": "Vetted local acts for every age, booked by the hour.",
    "kicker": "Service 02",
    "heading": "Entertainers"
  },
  "pricing": {
    "model": "performers",
    "maxHours": 6,
    "minHours": 1,
    "performers": [
      {
        "key": "magician",
        "name": "Magician",
        "baseCents": 35000,
        "fromLabel": "from $350",
        "imageFile": "hero-poster.jpg",
        "hourlyCents": 9000
      },
      {
        "key": "face-painter",
        "name": "Face painter",
        "baseCents": 18000,
        "fromLabel": "from $180",
        "imageFile": "perf-1.jpg",
        "hourlyCents": 7000
      },
      {
        "key": "caricaturist",
        "name": "Caricaturist",
        "baseCents": 22000,
        "fromLabel": "from $220",
        "imageFile": "perf-2.jpg",
        "hourlyCents": 8000
      },
      {
        "key": "balloon-artist",
        "name": "Balloon artist",
        "baseCents": 16000,
        "fromLabel": "from $160",
        "imageFile": "perf-3.jpg",
        "hourlyCents": 6500
      }
    ]
  },
  "blocks": {
    "card": [
      {
        "left": "16%",
        "suit": "♠",
        "tone": "dark",
        "quote": "Our magician had grown adults gasping like kids.",
        "author": "The Reeves wedding",
        "rotate": "-26deg"
      },
      {
        "left": "30%",
        "suit": "♥",
        "tone": "red",
        "quote": "Sixty happy painted faces in two hours flat.",
        "author": "Maple St birthday",
        "rotate": "-15deg"
      },
      {
        "left": "43%",
        "suit": "♦",
        "tone": "red",
        "quote": "Balloon swords: the undefeated crowd-pleaser.",
        "author": "Backyard bash",
        "rotate": "-5deg"
      },
      {
        "left": "57%",
        "suit": "♣",
        "tone": "dark",
        "quote": "The caricatures became everyone's favourite keepsake.",
        "author": "Corporate mixer",
        "rotate": "5deg"
      },
      {
        "left": "70%",
        "suit": "★",
        "tone": "acc",
        "quote": "One form, one show-stopper. That easy.",
        "author": "Downtown gala",
        "rotate": "15deg"
      },
      {
        "left": "84%",
        "suit": "♠",
        "tone": "dark",
        "quote": "Booked, matched and delighted in minutes.",
        "author": "Elm St party",
        "rotate": "26deg"
      }
    ],
    "faq": [
      {
        "answer": "Absolutely — add several to a single event request and see the combined total.",
        "question": "Can I book more than one performer?"
      },
      {
        "answer": "Yes, all materials and setup are included in the quoted rate.",
        "question": "Do performers bring their own supplies?"
      },
      {
        "answer": "Each listing notes its best-fit audience; most suit all ages.",
        "question": "What ages are the acts suitable for?"
      }
    ],
    "intro": [
      {
        "name": "Vetted performers",
        "text": "Background-checked, reviewed local talent."
      },
      {
        "name": "Booked by the hour",
        "text": "1–6 hours, base plus an hourly rate."
      },
      {
        "name": "Kids & adults",
        "text": "From birthday face-painting to gala magic."
      }
    ],
    "marquee": [
      {
        "label": "Magic"
      },
      {
        "label": "Face paint"
      },
      {
        "label": "Caricatures"
      },
      {
        "label": "Balloons"
      },
      {
        "label": "Comedy"
      }
    ],
    "step": [
      {
        "no": "01",
        "text": "Pick a performer and hours, send one request.",
        "heading": "Book",
        "iconKey": "book"
      },
      {
        "no": "02",
        "text": "We pair you with a vetted local act.",
        "heading": "Matched",
        "iconKey": "users"
      },
      {
        "no": "03",
        "text": "Everything they need, set up and ready.",
        "heading": "They arrive",
        "iconKey": "truck"
      },
      {
        "no": "04",
        "text": "The room lights up — you just enjoy it.",
        "heading": "Showtime",
        "iconKey": "star"
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
        "isCurrent": true
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
        "isCurrent": false
      },
      {
        "href": "/services/entertainers",
        "label": "Entertainers",
        "idx": "02",
        "isCurrent": true
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
