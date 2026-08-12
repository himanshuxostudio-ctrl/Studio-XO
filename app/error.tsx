"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-16 text-center sm:pt-20">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="text-display-2 mt-4">The night hit a snag.</h1>
      <p className="mt-4 max-w-md text-bone-300/70">
        Something didn&rsquo;t load correctly. Try again, or head back and pick up where you left off.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-primary">
          Try Again
        </button>
        <Link href="/" className="btn-outline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
