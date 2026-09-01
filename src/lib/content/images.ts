/**
 * Curated development photography.
 *
 * Every id below was taken from a live Unsplash search rather than
 * guessed, so none of them 404. They are grouped by subject so a page
 * can pull a coherent set instead of a random one — the brief asks for
 * a curated visual language, and mismatched stock is the fastest way
 * to lose it.
 *
 * These are development placeholders with real photographs in them.
 * They come out when creators upload their own work to Supabase
 * Storage in Phase 4.
 */

const BASE = "https://images.unsplash.com/";

/**
 * Build a source URL at the size it will actually be displayed.
 * Images are served straight from the Unsplash CDN (`auto=format` gives
 * us AVIF/WebP already), so Next's optimiser is switched off and no
 * build cache is written.
 */
export function photo(id: string, width = 1200, aspect?: number): string {
  // Already a full URL — real photography from a partner community, served
  // from wherever that community already hosts it. Passed through untouched.
  if (id.startsWith("http")) return id;

  const h = aspect ? `&h=${Math.round(width / aspect)}` : "";
  return `${BASE}${id}?auto=format&fit=crop&q=80&w=${width}${h}`;
}

/**
 * Photowalks in Pune — a real Pune photography community, and the first one
 * on APERTURE. Its walk photographs are served from its own deployment rather
 * than copied here, so the credit and the hosting stay with the community.
 */
export const PWIP_ORIGIN = "https://photowalks-in-pune-gold.vercel.app";

export const pwip = (file: string) => `${PWIP_ORIGIN}/images/gallery/${file}`;

export const PHOTOS = {
  /* Photographers and creators at work — heroes and editorial blocks.
     Ordered by strength: index 0 is the homepage hero. */
  atWork: [
    "photo-1518929458119-e5bf444c30f4",
    "photo-1493863641943-9b68992a8d07",
    "photo-1612544409025-e1f6a56c1152",
    "photo-1497316730643-415fac54a2af",
    "photo-1590486803833-1c5dc8ddd4c8",
    "photo-1542038784456-1ea8e935640e",
    "photo-1541516160071-4bb0c5af65ba",
    "photo-1513031300226-c8fb12de9ade",
    "photo-1603574670812-d24560880210",
    "photo-1515634928627-2a4e0dae3ddf",
    "photo-1581609784724-68d753c36494",
    "photo-1524834671419-aa7d41c1c657",
  ],

  /* Camera bodies. */
  cameras: [
    "photo-1502920917128-1aa500764cbd",
    "photo-1495707902641-75cac588d2e9",
    "photo-1502982720700-bfff97f2ecac",
    "photo-1512790182412-b19e6d62bc39",
    "photo-1580707221190-bd94d9087b7f",
    "photo-1516035069371-29a1b244cc32",
  ],

  /* Lenses and optics. */
  lenses: [
    "photo-1582994254571-52c62d96ebab",
    "photo-1453728013993-6d66e9c9123a",
    "photo-1580852300513-9b50125bf293",
    "photo-1533746228171-962520811097",
    "photo-1593704212686-6d52058fb516",
    "photo-1608186336271-53313eeaf864",
    "photo-1568840739765-838c480554bb",
    "photo-1608186286925-8c0e1c1fbeac",
    "photo-1551332772-f6bc95b9ed1f",
    "photo-1543954616-be267def7835",
    "photo-1506241537529-eefea1fbe44d",
  ],

  /* Sets, crews, cinema cameras. */
  production: [
    "photo-1612544409025-e1f6a56c1152",
    "photo-1515634928627-2a4e0dae3ddf",
    "photo-1632187981988-40f3cbaeef5e",
    "photo-1632187989763-c9c620420b4d",
    "photo-1518929458119-e5bf444c30f4",
    "photo-1524834671419-aa7d41c1c657",
    "photo-1486693128850-a77436e7ba3c",
    "photo-1581609784724-68d753c36494",
    "photo-1597892672196-3bb8b5c06171",
    "photo-1628242787311-758dedb81ecb",
  ],

  /* Lighting. */
  lighting: [
    "photo-1777322615136-2f1d5d636cc4",
    "photo-1783867174124-780be26c435e",
    "photo-1769699167982-4509874af243",
    "photo-1762859371309-e2e37d58e15f",
    "photo-1780701481186-fd65fbb74ec5",
  ],

  /* Audio. */
  audio: [
    "photo-1485579149621-3123dd979885",
    "photo-1531651008558-ed1740375b39",
    "photo-1541592553160-82008b127ccb",
    "photo-1581548708095-7158f2e63857",
    "photo-1590602847861-f357a9332bbc",
    "photo-1588800347304-ec7e6f353327",
    "photo-1507676385008-e7fb562d11f8",
    "photo-1589903308904-1010c2294adc",
    "photo-1478737270239-2f02b77fc618",
  ],

  /* Drones. */
  drones: [
    "photo-1473968512647-3e447244af8f",
    "photo-1521405924368-64c5b84bec60",
    "photo-1507582020474-9a35b7d455d9",
    "photo-1527977966376-1c8408f9f108",
    "photo-1514043454212-14c181f46583",
    "photo-1487219116710-23ffcb172b2b",
    "photo-1541943201372-99066ec6a5c5",
    "photo-1532989029401-439615f3d4b4",
  ],

  /* Gimbals and rigs. */
  gimbals: [
    "photo-1534961165765-5c9795af911b",
    "photo-1626362729742-d394ea4c6f43",
    "photo-1611239579666-3c58b449bdc6",
    "photo-1617706534889-ce17f547abc2",
    "photo-1604016561062-f980f11d6c98",
    "photo-1623157072268-829727d352bd",
    "photo-1547580116-1b0a345a23f1",
    "photo-1627036692626-8fb12e8a0091",
  ],

  /* Creator portraits. Ordered to match the demo cast in catalogue.ts —
     a name and a face that disagree read as carelessness, and this is a
     product about identity. */
  portraits: [
    "photo-1565672377218-afb6d165973a",
    "photo-1649433658557-54cf58577c68",
    "photo-1628726987013-db899232027c",
    "photo-1599928337729-09dac023dd52",
    "photo-1536766768598-e09213fdcf22",
    "photo-1599665860824-2c05cba96b0f",
    "photo-1663493711914-8928e91f1076",
    "photo-1598411435746-47bfecc3ea98",
    "photo-1604465829955-423e37d50e4b",
  ],

  /* Photowalks, workshops, groups. */
  community: [
    "photo-1778694276919-28d9c9e9e835",
    "photo-1779026430840-f660afb71375",
    "photo-1738739905706-6a8dfe60b187",
    "photo-1586732711713-421a6cc95490",
    "photo-1641226293362-81518e9a6f5d",
    "photo-1593291366637-5b80b48895df",
    "photo-1632383380247-f8a33e08eed7",
    "photo-1694343408317-df51be4c6f5c",
    "photo-1567607662209-76227e6f940e",
    "photo-1580105215553-ef922a1a65b2",
    "photo-1607210173206-5de6655b67c8",
  ],

  /* Wedding and event work. */
  weddings: [
    "photo-1621801306185-8c0ccf9c8eb8",
    "photo-1630526720753-aa4e71acf67d",
    "photo-1665960213508-48f07086d49c",
    "photo-1587271407850-8d438ca9fdf2",
    "photo-1600685890506-593fdf55949b",
    "photo-1611106211090-8f3c79eb8552",
    "photo-1633104502699-b2ecf0fee294",
    "photo-1583878545126-2f1ca0142714",
  ],
} as const;

export type PhotoSet = keyof typeof PHOTOS;

/** Deterministic pick, so server and client render the same photograph. */
export function pick(set: PhotoSet, index: number): string {
  const list = PHOTOS[set];
  return list[index % list.length]!;
}
