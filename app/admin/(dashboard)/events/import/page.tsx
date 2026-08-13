import Link from "next/link";
import { requireSection } from "@/lib/auth";
import { importFromBookMyShowAction } from "./actions";

interface ImportPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ImportEventPage({ searchParams }: ImportPageProps) {
  await requireSection("events");
  const params = await searchParams;

  return (
    <div className="max-w-xl">
      <h1 className="text-display-3 mb-2">Import from BookMyShow</h1>
      <p className="mb-8 text-sm text-bone-400">
        Paste a public BookMyShow event page URL. We&rsquo;ll pull the title, description, image, date/time and
        ticket link from the page&rsquo;s own public listing data — nothing is published automatically, and you&rsquo;ll
        review every field before saving.
      </p>

      <form action={importFromBookMyShowAction} className="space-y-4">
        <div>
          <label htmlFor="url" className="mb-1.5 block text-xs uppercase tracking-widest2 text-bone-400">
            BookMyShow Event URL
          </label>
          <input
            id="url"
            name="url"
            type="url"
            required
            placeholder="https://in.bookmyshow.com/events/..."
            className="w-full border border-bone-300/20 bg-ink-900 px-4 py-2.5 text-sm text-bone-100 focus:border-gold-bright"
          />
        </div>

        {params.error && (
          <p className="border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{params.error}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Fetch &amp; Review
          </button>
          <Link href="/admin/events/new" className="btn-outline">
            Enter Manually Instead
          </Link>
        </div>
      </form>

      <p className="mt-8 text-xs text-bone-500">
        This only reads the same public metadata BookMyShow exposes for search engines and social sharing — it
        doesn&rsquo;t sign in, solve CAPTCHAs, or access anything behind a login. If a page can&rsquo;t be read this way,
        use manual entry.
      </p>
    </div>
  );
}
