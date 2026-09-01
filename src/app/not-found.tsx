import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center"
    >
      <p className="eyebrow">404</p>
      <h1 className="display-section mt-5 max-w-[18ch]">
        That page has moved on to another shoot.
      </h1>
      <p className="mt-5 max-w-measure text-lg text-ink-muted">
        The link may be old, or the listing may have been taken down.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/gear" className="btn btn-ghost">
          Browse gear
        </Link>
      </div>
    </main>
  );
}
