import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-16 text-center sm:pt-20">
      <p className="eyebrow">404</p>
      <h1 className="text-display-2 mt-4">This room doesn&rsquo;t exist.</h1>
      <p className="mt-4 max-w-md text-bone-300/70">
        The page you&rsquo;re looking for may have moved, sold out, or never existed. Let&rsquo;s get you back to the night.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
        <Link href="/events" className="btn-outline">
          Browse Events
        </Link>
      </div>
    </div>
  );
}
