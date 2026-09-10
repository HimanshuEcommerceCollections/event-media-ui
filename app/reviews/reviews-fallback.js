/**
 * Offline copy of the reviews page, in the exact shape the API returns.
 *
 * GENERATED — do not edit. Run `node scripts/generate-fallbacks.mjs` with the
 * API running to refresh it. Source: GET /api/v1/content/reviews
 */
export const REVIEWS_FALLBACK = {
  "summary": {
    "total": 12,
    "average": 4.9,
    "histogram": [
      {
        "stars": 5,
        "count": 11,
        "percent": 92
      },
      {
        "stars": 4,
        "count": 1,
        "percent": 8
      },
      {
        "stars": 3,
        "count": 0,
        "percent": 0
      },
      {
        "stars": 2,
        "count": 0,
        "percent": 0
      },
      {
        "stars": 1,
        "count": 0,
        "percent": 0
      }
    ]
  },
  "stats": [
    {
      "key": "events_covered",
      "value": 320,
      "decimals": 0,
      "prefix": "",
      "suffix": "",
      "label": "Events covered"
    },
    {
      "key": "average_rating",
      "value": 4.9,
      "decimals": 1,
      "prefix": "",
      "suffix": "",
      "label": "Average rating"
    },
    {
      "key": "five_star",
      "value": 96,
      "decimals": 0,
      "prefix": "",
      "suffix": "%",
      "label": "Five-star"
    },
    {
      "key": "repeat_clients",
      "value": 38,
      "decimals": 0,
      "prefix": "",
      "suffix": "%",
      "label": "Repeat clients"
    }
  ],
  "filters": [
    {
      "key": "all",
      "label": "All"
    },
    {
      "key": "party-rentals",
      "label": "Party rentals"
    },
    {
      "key": "entertainers",
      "label": "Entertainers"
    },
    {
      "key": "dj-music",
      "label": "DJ + music"
    },
    {
      "key": "photo-video",
      "label": "Photo + video"
    },
    {
      "key": "virtual-tours",
      "label": "Virtual tours"
    },
    {
      "key": "drone-video",
      "label": "Drone video"
    }
  ],
  "spotlight": [
    {
      "id": "rvw_priya_marcus",
      "image": {
        "path": "/assets/reviews/spot-1.jpg",
        "alt": "Priya & Marcus"
      },
      "quote": "One request and our whole backyard wedding came together — tables, lounge, string lights, all set up before we arrived. Effortless.",
      "stars": 5,
      "initials": "PM",
      "authorName": "Priya & Marcus",
      "tag": "Party rentals · Backyard wedding"
    },
    {
      "id": "rvw_aisha_k",
      "image": {
        "path": "/assets/reviews/spot-2.jpg",
        "alt": "Aisha K."
      },
      "quote": "The DJ read the room perfectly — the dance floor did not empty once all night. Everyone asked who we booked.",
      "stars": 5,
      "initials": "AK",
      "authorName": "Aisha K.",
      "tag": "DJ + music · Corporate gala"
    },
    {
      "id": "rvw_harbor",
      "image": {
        "path": "/assets/reviews/spot-3.jpg",
        "alt": "Harbor Group"
      },
      "quote": "Buyers walk the space before they ever visit. For our listings, it’s an absolute game changer.",
      "stars": 5,
      "initials": "HG",
      "authorName": "Harbor Group",
      "tag": "Virtual tours · Real estate"
    }
  ],
  "reviews": [
    {
      "id": "rvw_priya_marcus",
      "categoryKey": "party-rentals",
      "serviceLabel": "Party rentals",
      "authorName": "Priya & Marcus",
      "initials": "PM",
      "avatarColor": "#639922",
      "stars": 5,
      "body": "One request and our whole backyard wedding came together — tables, lounge, string lights, all set up before we arrived. Effortless.",
      "whenLabel": "June · verified"
    },
    {
      "id": "rvw_aisha_k",
      "categoryKey": "dj-music",
      "serviceLabel": "DJ + music",
      "authorName": "Aisha K.",
      "initials": "AK",
      "avatarColor": "#e0b341",
      "stars": 5,
      "body": "The DJ read the room perfectly — the dance floor did not empty once all night!",
      "whenLabel": "April · verified"
    },
    {
      "id": "rvw_delgado",
      "categoryKey": "entertainers",
      "serviceLabel": "Entertainers",
      "authorName": "The Delgado Family",
      "initials": "TD",
      "avatarColor": "#6fb0d6",
      "stars": 5,
      "body": "The magician had our kids (and honestly the adults) completely speechless.",
      "whenLabel": "May · verified"
    },
    {
      "id": "rvw_northside",
      "categoryKey": "virtual-tours",
      "serviceLabel": "Virtual tours",
      "authorName": "Northside Realty",
      "initials": "NR",
      "avatarColor": "#e79ab5",
      "stars": 5,
      "body": "Our listings sell faster with the 3D tours, and the volume pricing is a real win.",
      "whenLabel": "ongoing · verified"
    },
    {
      "id": "rvw_tom_riley",
      "categoryKey": "photo-video",
      "serviceLabel": "Photo + video",
      "authorName": "Tom & Riley",
      "initials": "TR",
      "avatarColor": "#e8934b",
      "stars": 5,
      "body": "Edited gallery back in three days, and the drone shots were unreal.",
      "whenLabel": "March · verified"
    },
    {
      "id": "rvw_cardinal",
      "categoryKey": "drone-video",
      "serviceLabel": "Drone video",
      "authorName": "Cardinal Coworking",
      "initials": "CC",
      "avatarColor": "#8a7bd8",
      "stars": 4,
      "body": "Aerials made our launch video pop. Booking was smooth and the pilot was a pro.",
      "whenLabel": "Feb · verified"
    },
    {
      "id": "rvw_bianca",
      "categoryKey": "party-rentals",
      "serviceLabel": "Party rentals",
      "authorName": "Bianca M.",
      "initials": "BM",
      "avatarColor": "#3b9a8f",
      "stars": 5,
      "body": "Chairs, tables, lighting — delivered and set up before I even got there. Spotless!",
      "whenLabel": "July · verified"
    },
    {
      "id": "rvw_grace",
      "categoryKey": "entertainers",
      "serviceLabel": "Entertainers",
      "authorName": "Grace H.",
      "initials": "GH",
      "avatarColor": "#d96a5b",
      "stars": 5,
      "body": "A face painter and balloon artist kept thirty kids happy for hours. Lifesavers.",
      "whenLabel": "June · verified"
    },
    {
      "id": "rvw_elm_hoa",
      "categoryKey": "dj-music",
      "serviceLabel": "DJ + music",
      "authorName": "Elm Street HOA",
      "initials": "EH",
      "avatarColor": "#639922",
      "stars": 5,
      "body": "Booked, matched and done in minutes. The whole neighborhood loved it.",
      "whenLabel": "May · verified"
    },
    {
      "id": "rvw_devon_sam",
      "categoryKey": "photo-video",
      "serviceLabel": "Photo + video",
      "authorName": "Devon & Sam",
      "initials": "DS",
      "avatarColor": "#e0b341",
      "stars": 5,
      "body": "Every candid moment captured beautifully. Worth every single penny.",
      "whenLabel": "October · verified"
    },
    {
      "id": "rvw_harbor",
      "categoryKey": "virtual-tours",
      "serviceLabel": "Virtual tours",
      "authorName": "Harbor Group",
      "initials": "HG",
      "avatarColor": "#6fb0d6",
      "stars": 5,
      "body": "Buyers walk the space before they ever visit. An absolute game changer.",
      "whenLabel": "ongoing · verified"
    },
    {
      "id": "rvw_lena",
      "categoryKey": "drone-video",
      "serviceLabel": "Drone video",
      "authorName": "Lena P.",
      "initials": "LP",
      "avatarColor": "#e79ab5",
      "stars": 5,
      "body": "The sunset flyover of our venue gave every guest chills. Stunning.",
      "whenLabel": "September · verified"
    }
  ],
  "marquee": [
    {
      "id": "gal_reviews_0",
      "image": {
        "path": "/assets/reviews/spot-2.jpg",
        "alt": "Neon bash"
      },
      "label": "Neon bash"
    },
    {
      "id": "gal_reviews_1",
      "image": {
        "path": "/assets/reviews/marq-carnival.jpg",
        "alt": "Carnival"
      },
      "label": "Carnival"
    },
    {
      "id": "gal_reviews_2",
      "image": {
        "path": "/assets/reviews/spot-1.jpg",
        "alt": "Lakeside wedding"
      },
      "label": "Lakeside wedding"
    },
    {
      "id": "gal_reviews_3",
      "image": {
        "path": "/assets/reviews/marq-album-party.jpg",
        "alt": "Album party"
      },
      "label": "Album party"
    },
    {
      "id": "gal_reviews_4",
      "image": {
        "path": "/assets/reviews/spot-3.jpg",
        "alt": "Brand summit"
      },
      "label": "Brand summit"
    },
    {
      "id": "gal_reviews_5",
      "image": {
        "path": "/assets/reviews/marq-family-fest.jpg",
        "alt": "Family fest"
      },
      "label": "Family fest"
    },
    {
      "id": "gal_reviews_6",
      "image": {
        "path": "/assets/reviews/marq-garden-vows.jpg",
        "alt": "Garden vows"
      },
      "label": "Garden vows"
    },
    {
      "id": "gal_reviews_7",
      "image": {
        "path": "/assets/reviews/marq-launch-day.jpg",
        "alt": "Launch day"
      },
      "label": "Launch day"
    },
    {
      "id": "gal_reviews_8",
      "image": {
        "path": "/assets/reviews/marq-film-night.jpg",
        "alt": "Film night"
      },
      "label": "Film night"
    }
  ],
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
        "isCurrent": true
      }
    ]
  }
};
