"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { sendOtp, verifyOtp } from "@/lib/domain/actions";
import { photo, pick } from "@/lib/content/images";

/**
 * Sign in.
 *
 * Split composition: the form on a light sheet, a photograph holding the
 * other half. The authenticated side of the product has to feel like the
 * same company as the public side, and this is the first screen where
 * that is tested.
 */
export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSend(formData: FormData) {
    setBusy(true);
    setError(null);
    const res = await sendOtp(formData);
    setBusy(false);
    if (res.ok) setSent(true);
    else setError(res.error);
  }

  async function onVerify(formData: FormData) {
    setBusy(true);
    setError(null);
    const res = await verifyOtp(formData);
    setBusy(false);
    if (!res.ok) setError(res.error);
  }

  return (
    <main id="main" className="grid min-h-screen lg:grid-cols-2">
      {/* Form */}
      <div className="flex flex-col justify-between bg-canvas px-6 py-10 sm:px-12 lg:px-16">
        <Link href="/" className="inline-flex items-center gap-2.5 self-start">
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
        </Link>

        <div className="mx-auto w-full max-w-md py-16">
          <h1 className="display-sub text-ink md:text-4xl">
            {sent ? "Enter your code." : "Sign in to APERTURE."}
          </h1>
          <p className="mt-4 text-lg text-ink-muted">
            {sent
              ? `We sent a 6-digit code to +91 ${phone}.`
              : "We will text you a code. There is no password to remember."}
          </p>

          {!sent ? (
            <form action={onSend} className="mt-10 space-y-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-ink">
                  Mobile number
                </label>
                <div className="mt-2 flex items-center rounded-md border border-line bg-canvas focus-within:border-forest">
                  <span className="numeric px-4 text-ink-faint">+91</span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="numeric w-full bg-transparent py-4 pr-4 outline-none"
                    placeholder="98765 43210"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-flag">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary w-full disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send code"}
              </button>
            </form>
          ) : (
            <form action={onVerify} className="mt-10 space-y-5">
              <input type="hidden" name="phone" value={phone} />
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-ink">
                  6-digit code
                </label>
                <input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  autoFocus
                  className="numeric mt-2 w-full rounded-md border border-line bg-canvas px-4 py-4 text-lg tracking-[0.4em] outline-none focus:border-forest"
                  placeholder="000000"
                />
              </div>

              {error && <p className="text-sm text-flag">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary w-full disabled:opacity-60"
              >
                {busy ? "Checking…" : "Sign in"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError(null);
                }}
                className="link-underline w-full py-2 text-sm text-ink-muted"
              >
                Use a different number
              </button>
            </form>
          )}

          <p className="mt-10 border-t border-line pt-6 text-sm text-ink-faint">
            By continuing you agree to our terms and privacy policy. We only
            ever text you about your own bookings.
          </p>
        </div>

        <Link href="/" className="link-underline self-start text-sm text-ink-muted">
          ← Back to APERTURE
        </Link>
      </div>

      {/* Photograph */}
      <div className="relative hidden overflow-hidden bg-forest-deep lg:block">
        <Image
          src={photo(pick("atWork", 2), 1400, 0.85)}
          alt=""
          fill
          unoptimized
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="scrim" />
        <blockquote className="absolute inset-x-12 bottom-12 max-w-md text-white">
          <p className="display-sub">
            Instagram shows your work. APERTURE proves your word.
          </p>
        </blockquote>
      </div>
    </main>
  );
}
