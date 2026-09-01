import { pick, pwip } from "./images";

/**
 * Development catalogue.
 *
 * This is the seam between the UI and the database. Every public page
 * reads from here, so when Supabase is running the functions at the
 * bottom of this file are the only thing that has to change — the
 * components never learn where the data came from.
 *
 * Names, studios and quotes below are invented for development. They
 * are not real people and must not survive into production: the whole
 * proposition is verified trust, so shipping invented credentials
 * would undo the product. See README "Status".
 */

export type Category =
  | "camera-body"
  | "lens"
  | "lighting"
  | "audio"
  | "gimbal"
  | "drone";

export const CATEGORY_LABEL: Record<Category, string> = {
  "camera-body": "Camera body",
  lens: "Lens",
  lighting: "Lighting",
  audio: "Audio",
  gimbal: "Gimbal",
  drone: "Drone",
};

export type Verification = {
  email: "verified" | "pending" | "none";
  phone: "verified" | "pending" | "none";
  government_id: "verified" | "pending" | "none";
  address: "verified" | "pending" | "none";
  bank_account: "verified" | "pending" | "none";
  professional: "verified" | "pending" | "none";
};

export type Creator = {
  username: string;
  name: string;
  role: string;
  city: string;
  area: string;
  skills: string[];
  tier: number;
  verification: Verification;
  bio: string;
  /** Photo ids — sized by whichever component renders them. */
  portrait: string;
  cover: string;
  work: { src: string; caption: string; year: number }[];
  stats: { shoots: number; rentals: number; years: number; onTime: number };
  memberSince: string;
};

export type Gear = {
  slug: string;
  name: string;
  category: Category;
  brand: string;
  rateMinor: number;
  depositMinor: number;
  images: string[];
  ownerUsername: string;
  area: string;
  city: string;
  distanceKm: number;
  available: boolean;
  instantBook: boolean;
  condition: string;
  description: string;
  accessories: string[];
  rating: number;
  completedRentals: number;
};

export type Community = {
  slug: string;
  name: string;
  city: string;
  members: number;
  /** Shown instead of the raw count where the community only claims a range. */
  memberLabel?: string;
  cover: string;
  blurb: string;
  focus: string[];
  /** Set on communities that exist off APERTURE and run their own front door. */
  external?: {
    site?: string;
    instagram?: string;
    whatsapp?: string;
    email?: string;
    since?: string;
  };
  /** Longer description used on the community's own page. */
  about?: string;
};

export type CreatorEvent = {
  slug: string;
  title: string;
  kind: "Photowalk" | "Workshop" | "Meetup" | "Screening";
  date: string;
  /** Free text — several communities publish "Morning" rather than a clock time. */
  time: string;
  venue: string;
  city: string;
  cover: string;
  coverAlt?: string;
  /**
   * Username of the member hosting this. Optional on purpose: a host is a real
   * person, and naming one who has not agreed would be inventing them. When it
   * is unset the community is credited instead.
   */
  organiser?: string;
  communitySlug?: string;
  attending?: number;
  capacity: number;
  priceMinor: number;
  blurb: string;
  theme?: string;
  /** Past walks stay listed — the record is the point. */
  status?: "open" | "past";
};

const FULL: Verification = {
  email: "verified",
  phone: "verified",
  government_id: "verified",
  address: "verified",
  bank_account: "verified",
  professional: "verified",
};

const CORE: Verification = {
  ...FULL,
  bank_account: "verified",
  professional: "none",
};

const PARTIAL: Verification = {
  email: "verified",
  phone: "verified",
  government_id: "verified",
  address: "pending",
  bank_account: "none",
  professional: "none",
};

/* ── Creators ────────────────────────────────────────────────────── */

export const CREATORS: Creator[] = [
  {
    username: "aditi.raut",
    name: "Aditi Raut",
    role: "Wedding & portrait photographer",
    city: "Pune",
    area: "Kothrud",
    skills: ["Wedding", "Portrait", "Candid"],
    tier: 4,
    verification: FULL,
    bio: "Eleven years photographing weddings across Maharashtra. I shoot quietly and hand over fast — most couples have their full set inside three weeks. I also rent out the bodies I am not carrying that week.",
    portrait: pick("portraits", 0),
    cover: pick("weddings", 0),
    work: [
      { src: pick("weddings", 1), caption: "Sanika & Rohan, Sinhagad Road", year: 2026 },
      { src: pick("weddings", 2), caption: "Haldi, Baner", year: 2025 },
      { src: pick("weddings", 3), caption: "Reception, Koregaon Park", year: 2025 },
      { src: pick("portraits", 4), caption: "Studio portrait series", year: 2025 },
      { src: pick("weddings", 5), caption: "Mehendi, Kalyani Nagar", year: 2024 },
      { src: pick("weddings", 6), caption: "Pre-wedding, Lonavala", year: 2024 },
    ],
    stats: { shoots: 214, rentals: 63, years: 11, onTime: 99 },
    memberSince: "2024",
  },
  {
    username: "kabir.menon",
    name: "Kabir Menon",
    role: "Filmmaker & colourist",
    city: "Mumbai",
    area: "Bandra West",
    skills: ["Documentary", "Commercial", "Colour"],
    tier: 4,
    verification: FULL,
    bio: "Documentary and branded work. I own a small cinema kit and grade out of a room in Bandra. Happy to crew, happy to lend, happier to do both on the same project.",
    portrait: pick("portraits", 1),
    cover: pick("production", 0),
    work: [
      { src: pick("production", 1), caption: "Kaanch — feature, colour", year: 2026 },
      { src: pick("production", 2), caption: "Brand film, Lower Parel", year: 2025 },
      { src: pick("production", 3), caption: "Docu short, Dharavi", year: 2025 },
      { src: pick("production", 4), caption: "Music video, Versova", year: 2024 },
      { src: pick("production", 5), caption: "Title sequence", year: 2024 },
      { src: pick("production", 6), caption: "Studio setup", year: 2023 },
    ],
    stats: { shoots: 96, rentals: 128, years: 9, onTime: 98 },
    memberSince: "2024",
  },
  {
    username: "meera.iyer",
    name: "Meera Iyer",
    role: "Product & food photographer",
    city: "Bengaluru",
    area: "Indiranagar",
    skills: ["Product", "Food", "Studio"],
    tier: 3,
    verification: CORE,
    bio: "Tabletop and product work for D2C brands. Small studio in Indiranagar with a permanent lighting setup that I hire out on weekends.",
    portrait: pick("portraits", 2),
    cover: pick("lighting", 0),
    work: [
      { src: pick("lenses", 1), caption: "Ceramics lookbook", year: 2026 },
      { src: pick("lighting", 1), caption: "Studio still life", year: 2025 },
      { src: pick("lenses", 3), caption: "Skincare campaign", year: 2025 },
      { src: pick("lighting", 2), caption: "Editorial, food", year: 2024 },
      { src: pick("lenses", 5), caption: "Packaging series", year: 2024 },
      { src: pick("lighting", 3), caption: "Set build", year: 2023 },
    ],
    stats: { shoots: 141, rentals: 37, years: 7, onTime: 100 },
    memberSince: "2025",
  },
  {
    username: "arjun.deshpande",
    name: "Arjun Deshpande",
    role: "Street & travel photographer",
    city: "Pune",
    area: "Camp",
    skills: ["Street", "Travel", "Reportage"],
    tier: 3,
    verification: CORE,
    bio: "I run the Sunday photowalk out of Camp and shoot travel features the rest of the week. Mostly rangefinders and one very tired 35mm.",
    portrait: pick("portraits", 3),
    cover: pick("atWork", 2),
    work: [
      { src: pick("atWork", 3), caption: "Mandai, early light", year: 2026 },
      { src: pick("atWork", 4), caption: "Konkan coast", year: 2025 },
      { src: pick("community", 2), caption: "Sunday walk, Camp", year: 2025 },
      { src: pick("atWork", 6), caption: "Monsoon series", year: 2024 },
      { src: pick("atWork", 7), caption: "Ladakh, on assignment", year: 2024 },
      { src: pick("atWork", 8), caption: "Night market", year: 2023 },
    ],
    stats: { shoots: 88, rentals: 24, years: 6, onTime: 97 },
    memberSince: "2025",
  },
  {
    username: "farah.qureshi",
    name: "Farah Qureshi",
    role: "Fashion photographer",
    city: "Delhi",
    area: "Hauz Khas",
    skills: ["Fashion", "Editorial", "Beauty"],
    tier: 4,
    verification: FULL,
    bio: "Editorial fashion, mostly for Indian labels. I keep a deep lighting kit and a medium format body that goes out more than it stays in.",
    portrait: pick("portraits", 4),
    cover: pick("lighting", 4),
    work: [
      { src: pick("portraits", 6), caption: "AW26 lookbook", year: 2026 },
      { src: pick("portraits", 7), caption: "Beauty editorial", year: 2025 },
      { src: pick("lighting", 1), caption: "Studio test", year: 2025 },
      { src: pick("portraits", 8), caption: "Campaign, Jaipur", year: 2024 },
      { src: pick("weddings", 4), caption: "Couture series", year: 2024 },
      { src: pick("portraits", 0), caption: "Portrait commission", year: 2023 },
    ],
    stats: { shoots: 173, rentals: 91, years: 10, onTime: 99 },
    memberSince: "2024",
  },
  {
    username: "nikhil.rane",
    name: "Nikhil Rane",
    role: "Video editor & drone pilot",
    city: "Pune",
    area: "Viman Nagar",
    skills: ["Aerial", "Editing", "Events"],
    tier: 2,
    verification: PARTIAL,
    bio: "DGCA-certified pilot doing aerials for weddings and real estate. Editing is the day job; flying is the reason I get out of bed.",
    portrait: pick("portraits", 5),
    cover: pick("drones", 0),
    work: [
      { src: pick("drones", 1), caption: "Aerial, Mulshi", year: 2026 },
      { src: pick("drones", 2), caption: "Resort film", year: 2025 },
      { src: pick("drones", 3), caption: "Wedding aerials", year: 2025 },
      { src: pick("drones", 4), caption: "Coastline, Alibaug", year: 2024 },
      { src: pick("drones", 5), caption: "Property tour", year: 2024 },
      { src: pick("drones", 6), caption: "Fort series", year: 2023 },
    ],
    stats: { shoots: 42, rentals: 11, years: 4, onTime: 96 },
    memberSince: "2026",
  },
];

export const creatorBy = (username: string) =>
  CREATORS.find((c) => c.username === username);

/* ── Gear ────────────────────────────────────────────────────────── */

export const GEAR: Gear[] = [
  {
    slug: "sony-fx3-cinema-body",
    name: "Sony FX3",
    category: "camera-body",
    brand: "Sony",
    rateMinor: 350000,
    depositMinor: 2500000,
    images: [pick("cameras", 5), pick("production", 1), pick("production", 3), pick("gimbals", 1)],
    ownerUsername: "kabir.menon",
    area: "Bandra West",
    city: "Mumbai",
    distanceKm: 3.2,
    available: true,
    instantBook: true,
    condition: "Excellent — 340 hours, sensor cleaned Aug 2026",
    description:
      "Full-frame cinema body in a compact housing. Goes out with two batteries, a charger and a cage. Shoots 4K120 internally; I have never had it overheat on a full-day shoot with the cage fan running.",
    accessories: ["2× NP-FZ100 batteries", "Dual charger", "SmallRig cage", "64GB CFexpress Type A", "Top handle"],
    rating: 4.9,
    completedRentals: 47,
  },
  {
    slug: "canon-eos-r5",
    name: "Canon EOS R5",
    category: "camera-body",
    brand: "Canon",
    rateMinor: 300000,
    depositMinor: 2200000,
    images: [pick("cameras", 1), pick("cameras", 0), pick("cameras", 4), pick("lenses", 0)],
    ownerUsername: "aditi.raut",
    area: "Kothrud",
    city: "Pune",
    distanceKm: 1.8,
    available: true,
    instantBook: true,
    condition: "Excellent — under 30,000 actuations",
    description:
      "My second wedding body. 45MP, dual card slots, and the eye-AF that makes candid work possible. Comes with three batteries because one is never enough at a wedding.",
    accessories: ["3× LP-E6NH batteries", "Charger", "128GB CFexpress", "128GB SD UHS-II", "Strap"],
    rating: 5.0,
    completedRentals: 31,
  },
  {
    slug: "sony-24-70mm-gm-ii",
    name: "Sony FE 24–70mm f/2.8 GM II",
    category: "lens",
    brand: "Sony",
    rateMinor: 140000,
    depositMinor: 1400000,
    images: [pick("lenses", 2), pick("lenses", 5), pick("lenses", 7), pick("lenses", 3)],
    ownerUsername: "kabir.menon",
    area: "Bandra West",
    city: "Mumbai",
    distanceKm: 3.2,
    available: true,
    instantBook: true,
    condition: "Excellent — no fungus, no separation, glass clean",
    description:
      "The lens that lives on my camera. Lighter than the original GM and noticeably faster to focus. Both caps, hood and a padded pouch included.",
    accessories: ["Front & rear caps", "ALC-SH164 hood", "Padded pouch", "82mm UV filter"],
    rating: 4.9,
    completedRentals: 62,
  },
  {
    slug: "dji-rs-3-pro",
    name: "DJI RS 3 Pro",
    category: "gimbal",
    brand: "DJI",
    rateMinor: 120000,
    depositMinor: 900000,
    images: [pick("gimbals", 0), pick("gimbals", 2), pick("gimbals", 4), pick("gimbals", 6)],
    ownerUsername: "nikhil.rane",
    area: "Viman Nagar",
    city: "Pune",
    distanceKm: 6.4,
    available: true,
    instantBook: false,
    condition: "Very good — light cosmetic marks on the arm",
    description:
      "Carbon-fibre three-axis gimbal that takes a full cinema body with a 24–70 on it. Balances in about four minutes once you know it. Case included.",
    accessories: ["Carry case", "Briefcase handle", "2× extra batteries", "Focus motor", "Lens support"],
    rating: 4.8,
    completedRentals: 23,
  },
  {
    slug: "aputure-600d-pro",
    name: "Aputure LS 600d Pro",
    category: "lighting",
    brand: "Aputure",
    rateMinor: 180000,
    depositMinor: 1600000,
    images: [pick("lighting", 0), pick("lighting", 2), pick("lighting", 4), pick("production", 8)],
    ownerUsername: "farah.qureshi",
    area: "Hauz Khas",
    city: "Delhi",
    distanceKm: 4.1,
    available: true,
    instantBook: true,
    condition: "Excellent — studio use only, never rained on",
    description:
      "600W daylight point source. Enough output to fight afternoon sun through a window. Goes out with the reflector, the dome and a proper stand — the stand matters more than people think.",
    accessories: ["Hyper reflector", "Light dome II", "C-stand", "Control box", "Weatherproof case"],
    rating: 5.0,
    completedRentals: 38,
  },
  {
    slug: "dji-mavic-3-cine",
    name: "DJI Mavic 3 Cine",
    category: "drone",
    brand: "DJI",
    rateMinor: 260000,
    depositMinor: 2000000,
    images: [pick("drones", 0), pick("drones", 3), pick("drones", 5), pick("drones", 7)],
    ownerUsername: "nikhil.rane",
    area: "Viman Nagar",
    city: "Pune",
    distanceKm: 6.4,
    available: false,
    instantBook: false,
    condition: "Excellent — 61 flights, props replaced Jul 2026",
    description:
      "Four-thirds Hasselblad sensor with ProRes recording. Renter must hold a valid DGCA remote pilot certificate — I check it before handover, no exceptions.",
    accessories: ["3× intelligent batteries", "Charging hub", "ND filter set", "RC Pro controller", "Hard case"],
    rating: 4.9,
    completedRentals: 19,
  },
  {
    slug: "sennheiser-mkh-416",
    name: "Sennheiser MKH 416",
    category: "audio",
    brand: "Sennheiser",
    rateMinor: 90000,
    depositMinor: 700000,
    images: [pick("audio", 0), pick("audio", 2), pick("audio", 4), pick("audio", 6)],
    ownerUsername: "kabir.menon",
    area: "Bandra West",
    city: "Mumbai",
    distanceKm: 3.2,
    available: true,
    instantBook: true,
    condition: "Excellent — the industry standard, and it shows",
    description:
      "Short shotgun that rejects room noise better than anything near its price. Comes with a Rycote blimp and a dead cat, which is the only way to use it outdoors in this city.",
    accessories: ["Rycote blimp", "Windjammer", "Pistol grip", "3m XLR", "Shock mount"],
    rating: 4.9,
    completedRentals: 54,
  },
  {
    slug: "canon-rf-85mm-f12",
    name: "Canon RF 85mm f/1.2L",
    category: "lens",
    brand: "Canon",
    rateMinor: 160000,
    depositMinor: 1500000,
    images: [pick("lenses", 4), pick("lenses", 8), pick("lenses", 10), pick("lenses", 6)],
    ownerUsername: "aditi.raut",
    area: "Kothrud",
    city: "Pune",
    distanceKm: 1.8,
    available: true,
    instantBook: false,
    condition: "Excellent — glass immaculate, minor mount wear",
    description:
      "The portrait lens. Heavy, slow to focus wide open, and worth both. If you are shooting a reception with one lens, make it this one.",
    accessories: ["Front & rear caps", "ET-89 hood", "Lens pouch", "82mm clear filter"],
    rating: 5.0,
    completedRentals: 29,
  },
  {
    slug: "nikon-z8-body",
    name: "Nikon Z8",
    category: "camera-body",
    brand: "Nikon",
    rateMinor: 280000,
    depositMinor: 2100000,
    images: [pick("cameras", 3), pick("cameras", 2), pick("lenses", 1), pick("lenses", 9)],
    ownerUsername: "meera.iyer",
    area: "Indiranagar",
    city: "Bengaluru",
    distanceKm: 2.6,
    available: true,
    instantBook: true,
    condition: "Excellent — firmware current, box included",
    description:
      "45MP stacked sensor, no mechanical shutter, 8K internal. I use it for product work where absolute detail matters. Tripod plate stays on.",
    accessories: ["2× EN-EL15c batteries", "Charger", "128GB CFexpress B", "Arca plate", "Original box"],
    rating: 4.8,
    completedRentals: 17,
  },
];

export const gearBy = (slug: string) => GEAR.find((g) => g.slug === slug);

export const gearByOwner = (username: string) =>
  GEAR.filter((g) => g.ownerUsername === username);

/* ── Communities ─────────────────────────────────────────────────── */

export const COMMUNITIES: Community[] = [
  /*
   * Photowalks in Pune is a real community with its own site, its own
   * Instagram and its own WhatsApp group — not part of the demo cast below.
   * Its numbers are the ones the organiser publishes ("100+", "10+"), carried
   * across as written rather than rounded into a precise-looking figure, and
   * its walk photographs are served from its own deployment.
   */
  {
    slug: "photowalks-in-pune",
    name: "Photowalks in Pune",
    city: "Pune",
    members: 100,
    memberLabel: "100+",
    cover: pwip("photo-10.jpg"),
    blurb:
      "Guided walks through the old city, the markets and the hills, most Saturday and Sunday mornings.",
    about:
      "A year of walking Pune with cameras: Kasba Peth before it wakes, Mandai while the produce is still going down, FC Road after rain, Taljai and ARAI when the city needs to be seen from above. Every level turns up, and the exact meeting time goes out on WhatsApp the night before.",
    focus: ["Street", "Documentary", "Photowalks"],
    external: {
      site: "https://photowalksinpune.com",
      instagram: "https://instagram.com/photowalksinpune",
      whatsapp: "https://photowalks-in-pune-gold.vercel.app/#community",
      email: "hello@photowalksinpune.com",
      since: "2025",
    },
  },
  {
    slug: "pune-street-collective",
    name: "Pune Street Collective",
    city: "Pune",
    members: 412,
    cover: pick("community", 0),
    blurb: "Sunday walks through Camp, Mandai and the old city. Anyone with a camera, any camera.",
    focus: ["Street", "Documentary"],
  },
  {
    slug: "mumbai-film-crew",
    name: "Mumbai Film Crew",
    city: "Mumbai",
    members: 738,
    cover: pick("production", 2),
    blurb: "Crew calls, gear swaps and rough-cut screenings for people who make things longer than 60 seconds.",
    focus: ["Filmmaking", "Crew"],
  },
  {
    slug: "wedding-shooters-india",
    name: "Wedding Shooters India",
    city: "Pan-India",
    members: 1264,
    cover: pick("weddings", 2),
    blurb: "Season planning, second-shooter referrals and honest talk about pricing.",
    focus: ["Wedding", "Business"],
  },
  {
    slug: "bengaluru-studio-club",
    name: "Bengaluru Studio Club",
    city: "Bengaluru",
    members: 289,
    cover: pick("lighting", 1),
    blurb: "Shared studio time, lighting practice and tabletop experiments in Indiranagar.",
    focus: ["Studio", "Product"],
  },
];

export const communityBy = (slug: string) =>
  COMMUNITIES.find((c) => c.slug === slug);

/* ── Events ──────────────────────────────────────────────────────── */

export const EVENTS: CreatorEvent[] = [
  /*
   * Photowalks in Pune — the real season, carried across from that
   * community's own listing. No host is named on any of them: the source
   * data leaves `hostUsername` unset on purpose, because naming someone who
   * has not agreed to host would be inventing them. The community is
   * credited instead. Attendance is not carried across either — those counts
   * live in that project's database, not here.
   */
  {
    slug: "arai-30-august",
    title: "ARAI / Hill Morning",
    kind: "Photowalk",
    date: "2026-08-30",
    time: "Morning",
    venue: "ARAI Hill",
    city: "Pune",
    cover: pwip("photo-33.jpg"),
    coverAlt: "Two monkeys grooming each other in low light",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Nature · morning light",
    status: "open",
    blurb:
      "A climb up the hill early, with the city spread out below.",
  },
  {
    slug: "camp-colonial-lines",
    title: "Camp / Colonial Lines",
    kind: "Photowalk",
    date: "2026-08-22",
    time: "Evening",
    venue: "Camp · Pul Gate",
    city: "Pune",
    cover: pwip("photo-06.jpg"),
    coverAlt: "A chai stall at work in black and white, the menu boards overhead listing paratha, vada and samosa",
    communitySlug: "photowalks-in-pune",
    capacity: 30,
    priceMinor: 0,
    theme: "Heritage · afternoon light",
    status: "past",
    blurb:
      "Arcades, bakeries and old shopfronts around Pul Gate, photographed as the evening light goes.",
  },
  {
    slug: "appa-balwant-chowk-15-august",
    title: "Appa Balwant Chowk / Independence Day",
    kind: "Photowalk",
    date: "2026-08-15",
    time: "Morning",
    venue: "Appa Balwant Chowk",
    city: "Pune",
    cover: pwip("photo-47.jpg"),
    coverAlt: "A bookshop lane crowded with stacked titles",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Street · holiday",
    status: "past",
    blurb:
      "The bookshop quarter on a holiday morning.",
  },
  {
    slug: "flower-market-9-august",
    title: "Flower Market / Sunday",
    kind: "Photowalk",
    date: "2026-08-09",
    time: "Morning",
    venue: "Phule Flower Market",
    city: "Pune",
    cover: pwip("photo-15.jpg"),
    coverAlt: "Marigolds heaped in baskets at a flower stall",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Markets · colour",
    status: "past",
    blurb:
      "Colour at close range, before the morning trade thins out.",
  },
  {
    slug: "flower-market-8-august",
    title: "Flower Market / Saturday",
    kind: "Photowalk",
    date: "2026-08-08",
    time: "Morning",
    venue: "Phule Flower Market",
    city: "Pune",
    cover: pwip("photo-13.jpg"),
    coverAlt: "A vendor threading marigolds into a garland",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Markets · colour",
    status: "past",
    blurb:
      "The flower market at full tilt, garlands going out by the sackful.",
  },
  {
    slug: "taljai-26-july",
    title: "Taljai / Nature Walk",
    kind: "Photowalk",
    date: "2026-07-26",
    time: "Morning",
    venue: "Taljai Hills",
    city: "Pune",
    cover: pwip("photo-32.jpg"),
    coverAlt: "Sunlight through trees on a hill path",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Nature · morning light",
    status: "past",
    blurb:
      "Trees, light and birds, a short climb out of the traffic.",
  },
  {
    slug: "fc-road-shape-hunt-19-july",
    title: "FC Road / Shape Hunt",
    kind: "Photowalk",
    date: "2026-07-19",
    time: "Morning",
    venue: "FC Road",
    city: "Pune",
    cover: pwip("photo-49.jpg"),
    coverAlt: "A geometric building facade in hard morning light",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Street · exercise",
    status: "past",
    blurb:
      "One constraint for the whole walk: shapes only.",
  },
  {
    slug: "kasba-peth-15-july",
    title: "Kasba Peth / Old Quarters",
    kind: "Photowalk",
    date: "2026-07-15",
    time: "Morning",
    venue: "Kasba Peth",
    city: "Pune",
    cover: pwip("photo-10.jpg"),
    coverAlt: "A carved wooden wada door in an old lane",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Heritage · morning light",
    status: "past",
    blurb:
      "The oldest part of the city, wada doors and narrow lanes.",
  },
  {
    slug: "fc-road-12-july",
    title: "FC Road / Sunday Morning",
    kind: "Photowalk",
    date: "2026-07-12",
    time: "Morning",
    venue: "FC Road",
    city: "Pune",
    cover: pwip("photo-07.jpg"),
    coverAlt: "An empty street at dawn with shuttered shopfronts",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Street · morning light",
    status: "past",
    blurb:
      "The road before the shops open, when it belongs to nobody.",
  },
  {
    slug: "fc-road-11-july",
    title: "FC Road / Saturday Morning",
    kind: "Photowalk",
    date: "2026-07-11",
    time: "Morning",
    venue: "FC Road",
    city: "Pune",
    cover: pwip("photo-01.jpg"),
    coverAlt: "A street scene on FC Road in early light",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Street · morning light",
    status: "past",
    blurb:
      "A first walk for a lot of people, and an easy one.",
  },
  {
    slug: "camp-27-june",
    title: "Camp / Morning Arcades",
    kind: "Photowalk",
    date: "2026-06-27",
    time: "Morning",
    venue: "Camp",
    city: "Pune",
    cover: pwip("photo-41.jpg"),
    coverAlt: "Colonnaded arcades casting long shadows",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Heritage · morning light",
    status: "past",
    blurb:
      "The arcades and their shadows, early enough to have them to yourself.",
  },
  {
    slug: "mandai-20-june",
    title: "Mandai / Market Morning",
    kind: "Photowalk",
    date: "2026-06-20",
    time: "Morning",
    venue: "Mahatma Phule Mandai",
    city: "Pune",
    cover: pwip("photo-16.jpg"),
    coverAlt: "A market lane lined with sacks of produce, a man walking through it",
    communitySlug: "photowalks-in-pune",
    capacity: 25,
    priceMinor: 0,
    theme: "Markets · morning light",
    status: "past",
    blurb:
      "The market before the crowds, when the produce is still being laid out.",
  },

  /* Sample events for the demo cast below. */
  {
    slug: "lighting-for-portraits",
    title: "Lighting for portraits: one light, four looks",
    kind: "Workshop",
    date: "2026-09-20",
    time: "11:00",
    venue: "Studio 4, Indiranagar",
    city: "Bengaluru",
    cover: pick("lighting", 2),
    organiser: "meera.iyer",
    attending: 18,
    capacity: 24,
    priceMinor: 150000,
    blurb:
      "A hands-on afternoon proving you need far less equipment than you think. Everyone shoots; nobody watches.",
  },
  {
    slug: "rough-cut-night",
    title: "Rough cut night",
    kind: "Screening",
    date: "2026-09-27",
    time: "19:30",
    venue: "Versova Social, Andheri West",
    city: "Mumbai",
    cover: pick("production", 4),
    organiser: "kabir.menon",
    attending: 52,
    capacity: 60,
    priceMinor: 0,
    blurb:
      "Bring twelve minutes of anything unfinished. The room gives notes. The notes are usually right and occasionally kind.",
  },
  {
    slug: "monsoon-coast-expedition",
    title: "Monsoon coast expedition",
    kind: "Photowalk",
    date: "2026-10-04",
    time: "05:45",
    venue: "Harihareshwar beach",
    city: "Raigad",
    cover: pick("atWork", 4),
    organiser: "aditi.raut",
    attending: 21,
    capacity: 25,
    priceMinor: 250000,
    blurb:
      "Two days on the Konkan coast in the last of the rain. Transport and stay included. Bring rain covers you actually trust.",
  },
];

export const eventBy = (slug: string) => EVENTS.find((e) => e.slug === slug);

/* ── Creator stories ─────────────────────────────────────────────── */

export const STORIES = [
  {
    quote:
      "I stopped explaining my rates. I send the passport link and the conversation moves to dates.",
    name: "Aditi Raut",
    role: "Wedding photographer",
    city: "Pune",
    portrait: pick("portraits", 0),
  },
  {
    quote:
      "The FX3 paid for a third of itself last year sitting in other people's hands. That is not a side hustle, that is just arithmetic.",
    name: "Kabir Menon",
    role: "Filmmaker",
    city: "Mumbai",
    portrait: pick("portraits", 1),
  },
  {
    quote:
      "I am a student. Nobody was lending a 600d to a student until there was a record showing I return things on time.",
    name: "Nikhil Rane",
    role: "Editor & drone pilot",
    city: "Pune",
    portrait: pick("portraits", 5),
  },
  {
    quote:
      "Condition photos ended arguments before they started. Twice now the report settled it in under a minute.",
    name: "Meera Iyer",
    role: "Product photographer",
    city: "Bengaluru",
    portrait: pick("portraits", 2),
  },
];

/* ── FAQ ─────────────────────────────────────────────────────────── */

export const FAQS = [
  {
    q: "How does gear rental work?",
    a: "You send a request with your dates. The owner accepts, you pay into escrow, and you meet to hand over. Both of you photograph the item and tick off every accessory, then a six-digit code confirms the handover. The owner is paid after the gear comes back clean.",
  },
  {
    q: "Is my gear protected?",
    a: "Every renter is identity-verified before they can book, and each one carries an exposure cap — the total value of gear they can hold at any moment. Deposits are blocked, not charged. We publish exactly what is covered and what is not rather than implying blanket insurance.",
  },
  {
    q: "How do I become verified?",
    a: "Government photo ID plus a live selfie, which usually clears in under five minutes. Address and bank verification come next and unlock higher tiers. Each step you complete raises your exposure cap and lowers the deposits you are asked for.",
  },
  {
    q: "How are creators reviewed?",
    a: "Both sides review each other after a rental or a shoot, and both reviews are revealed at the same time so neither can react to the other. Reviews attach to completed transactions only — there is no way to post one without a record behind it.",
  },
  {
    q: "Can I join without owning gear?",
    a: "Yes, and most people do. Rent what you need, crew on other people's projects, join a community, and your record builds from the work rather than from the equipment.",
  },
  {
    q: "How do communities work?",
    a: "Communities are city-scale groups built around a craft — street, wedding, studio, film. They run photowalks, workshops and screenings. Attending is how most people meet the person they end up renting from.",
  },
];
