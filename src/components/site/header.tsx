"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Site header.
 *
 * Transparent while it sits over a hero photograph, solid once the page
 * scrolls past it. The reference does exactly this and it is the reason
 * the hero reads as full-bleed rather than as an image below a bar.
 */

const NAV = [
  { href: "/gear", label: "Explore Gear" },
  { href: "/creators", label: "Discover Creators" },
  { href: "/communities", label: "Communities" },
  { href: "/events", label: "Events" },
  { href: "/how-it-works", label: "How It Works" },
];

/** Routes whose first element is a full-bleed photograph. */
const HERO_ROUTE = /^\/$|^\/c\/|^\/communities\/|^\/events\/|^\/for-owners$/;

export function Header({ overHero }: { overHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Body scroll lock while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const light = (overHero ?? HERO_ROUTE.test(pathname)) && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-out",
        light
          ? "bg-transparent text-white"
          : "border-b border-line bg-canvas/92 text-ink backdrop-blur-md",
      )}
    >
      <div className="shell flex h-[72px] items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="APERTURE — home"
        >
          <Aperture light={light} />
          <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
            APERTURE
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "link-underline text-[0.9375rem] transition-opacity",
                  light ? "text-white/85 hover:text-white" : "text-ink-muted hover:text-ink",
                  active && (light ? "text-white" : "text-ink"),
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/login"
            className={cn(
              "hidden text-[0.9375rem] transition-opacity sm:block",
              light ? "text-white/85 hover:text-white" : "text-ink-muted hover:text-ink",
            )}
          >
            Log In
          </Link>
          <Link href="/login?intent=join" className="btn btn-accent btn-pill">
            Join APERTURE
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="-mr-1 p-2 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-[72px] bottom-0 overflow-y-auto border-t border-line bg-canvas px-5 py-6 text-ink lg:hidden"
        >
          <nav className="flex flex-col" aria-label="Primary, mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line py-5 text-2xl tracking-[-0.02em]"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="py-5 text-2xl tracking-[-0.02em]">
              Log In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

/** The mark: an aperture blade opening. */
function Aperture({ light }: { light: boolean }) {
  return (
    <span
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md",
        light ? "bg-white/15 backdrop-blur" : "bg-forest",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke="hsl(var(--lime))" strokeWidth="1.75" />
        <path d="M12 3 L12 12 L20 16" fill="none" stroke="hsl(var(--lime))" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 12 L4 16" fill="none" stroke="hsl(var(--lime))" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </span>
  );
}
