/**
 * Offline copy of the photo-video service page, in the exact shape the API returns.
 *
 * GENERATED — do not edit. Run `node scripts/generate-fallbacks.mjs` with the
 * API running to refresh it. Source: GET /api/v1/content/services/photo-video
 */
export const PHOTO_VIDEO_FALLBACK = {
  "slug": "photo-video",
  "no": "04",
  "title": "Photo + video",
  "blurb": "From a two-hour session to a cinematic package.",
  "price": {
    "label": "from $395",
    "cents": 39500,
    "unit": null
  },
  "isB2b": false,
  "image": {
    "path": "/assets/svc-04-photo-video.jpg",
    "alt": "Videographer recording"
  },
  "iconKey": "camera",
  "href": "/services/photo-video",
  "hero": {
    "lede": "Fixed packages, clear pricing, edited gallery in five business days.",
    "kicker": "Service 04",
    "heading": "Photo + video"
  },
  "pricing": {
    "model": "packs",
    "packs": [
      {
        "key": "photo-2",
        "name": "Photo · 2 hrs",
        "cents": 39500
      },
      {
        "key": "photo-4",
        "name": "Photo · 4 hrs",
        "cents": 69500
      },
      {
        "key": "photo-video",
        "name": "Photo + video",
        "cents": 125000
      },
      {
        "key": "cinematic",
        "name": "Cinematic package",
        "cents": 210000
      }
    ],
    "addons": [
      {
        "key": "second-shooter",
        "name": "Second shooter",
        "cents": 30000
      },
      {
        "key": "drone",
        "name": "Drone footage",
        "cents": 25000
      },
      {
        "key": "teaser",
        "name": "Same-day teaser",
        "cents": 18000
      },
      {
        "key": "prints",
        "name": "Prints + album",
        "cents": 22000
      }
    ]
  },
  "blocks": {
    "faq": [
      {
        "answer": "Edited galleries are delivered within five business days; sneak peeks sooner.",
        "question": "How long until we get our photos?"
      },
      {
        "answer": "Final edited images are yours to keep and share; raws stay with the shooter.",
        "question": "Do we get the raw files?"
      },
      {
        "answer": "Yes — note it in your request and we’ll price it in.",
        "question": "Can we add a second shooter?"
      }
    ],
    "frame": [
      {
        "exif": {
          "iso": "400",
          "lens": "35mm",
          "shutter": "1/160",
          "aperture": "f/1.8",
          "whiteBalance": "5600K"
        },
        "caption": "On set · the shoot",
        "imageFile": "gallery-1.jpg"
      },
      {
        "exif": {
          "iso": "800",
          "lens": "50mm",
          "shutter": "1/125",
          "aperture": "f/2.0",
          "whiteBalance": "3200K"
        },
        "caption": "Sparkler · golden hour",
        "imageFile": "gallery-2.jpg"
      },
      {
        "exif": {
          "iso": "640",
          "lens": "24mm",
          "shutter": "1/250",
          "aperture": "f/2.8",
          "whiteBalance": "5200K"
        },
        "caption": "Confetti · costume party",
        "imageFile": "gallery-3.jpg"
      },
      {
        "exif": {
          "iso": "200",
          "lens": "85mm",
          "shutter": "1/320",
          "aperture": "f/1.4",
          "whiteBalance": "5000K"
        },
        "caption": "Lifestyle · candid",
        "imageFile": "gallery-4.jpg"
      },
      {
        "exif": {
          "iso": "1600",
          "lens": "35mm",
          "shutter": "1/100",
          "aperture": "f/1.6",
          "whiteBalance": "3000K"
        },
        "caption": "Nightlife · the after-party",
        "imageFile": "gallery-5.jpg"
      }
    ],
    "included": [
      {
        "text": "Edited online gallery"
      },
      {
        "text": "Print & share release"
      },
      {
        "text": "Backup shooter on standby"
      },
      {
        "text": "Delivered in 5 business days"
      }
    ],
    "intro": [
      {
        "name": "Fixed packages",
        "text": "Clear pricing, no hourly surprises."
      },
      {
        "name": "Photo & video",
        "text": "Stills, film, or both in one booking."
      },
      {
        "name": "Fast turnaround",
        "text": "Edited gallery within five business days."
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
        "isCurrent": true
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
        "isCurrent": true
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
