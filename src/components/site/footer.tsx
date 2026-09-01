import Link from "next/link";
import Image from "next/image";
import { photo, pick } from "@/lib/content/images";
import { LAUNCH_CITY } from "@/lib/env";

/**
 * Footer.
 *
 * The reference runs a full-bleed photograph directly above a light
 * footer sheet with rounded top corners. Keeping that here gives the
 * page a proper ending instead of trailing off into link columns.
 */

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/gear", label: "Gear" },
      { href: "/creators", label: "Creators" },
      { href: "/communities", label: "Communities" },
      { href: "/events", label: "Events" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/for-owners", label: "For gear owners" },
      { href: "/how-it-works#verification", label: "Verification" },
      { href: "/how-it-works#protection", label: "Protection" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  const city = LAUNCH_CITY;

  return (
    <footer className="bg-forest-deep">
      <div className="relative h-[280px] w-full overflow-hidden md:h-[420px]">
        <Image
          src={photo(pick("atWork", 9), 1920, 3)}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="sheet bg-canvas">
        <div className="shell section-pad-sm">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-forest">
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
                    <circle cx="12" cy="12" r="9" fill="none" stroke="hsl(var(--lime))" strokeWidth="1.75" />
                    <path d="M12 3 L12 12 L20 16" fill="none" stroke="hsl(var(--lime))" strokeWidth="1.75" strokeLinecap="round" />
                    <path d="M12 12 L4 16" fill="none" stroke="hsl(var(--lime))" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
                  APERTURE
                </span>
              </div>

              <p className="mt-6 max-w-sm text-ink-muted">
                A verified creator network and peer-to-peer gear marketplace
                for India&rsquo;s visual creators.
              </p>

              <p className="mt-6 text-sm text-ink-faint">
                Live in {city}. Mumbai next.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {COLUMNS.map((col) => (
                <div key={col.title}>
                  <h3 className="text-sm font-medium text-ink">{col.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="link-underline text-[0.9375rem] text-ink-muted hover:text-ink"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="hairline mt-14 flex flex-col gap-3 pt-8 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} APERTURE.</p>
            <p>
              Development build — creator profiles, listings and events below
              are sample content.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
