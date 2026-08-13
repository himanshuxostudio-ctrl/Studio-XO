import { getSettings } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { saveSettingsAction } from "./actions";

const fieldClass = "w-full border border-bone-300/20 bg-ink-900 px-4 py-2.5 text-sm text-bone-100 focus:border-gold-bright";
const labelClass = "mb-1.5 block text-xs uppercase tracking-widest2 text-bone-400";

interface SettingsPageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminSettingsPage({ searchParams }: SettingsPageProps) {
  await requireSection("settings");
  const [settings, params] = await Promise.all([getSettings(), searchParams]);

  return (
    <div>
      <h1 className="text-display-3 mb-2">Settings</h1>
      <p className="mb-8 text-sm text-bone-400">
        These values drive the general WhatsApp and email CTAs across the site (header, footer, contact page, legal
        pages). Individual outlets keep their own contact details under Outlets.
      </p>

      <form action={saveSettingsAction} className="max-w-md space-y-5">
        <div>
          <label className={labelClass} htmlFor="generalWhatsappNumber">General WhatsApp Number</label>
          <input
            id="generalWhatsappNumber"
            name="generalWhatsappNumber"
            required
            defaultValue={settings.generalWhatsappNumber}
            placeholder="e.g. 919205888734"
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-bone-500">Digits only, with country code — no spaces or symbols.</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="generalEmail">General Email</label>
          <input id="generalEmail" name="generalEmail" type="email" required defaultValue={settings.generalEmail} className={fieldClass} />
        </div>

        {params.saved && <p className="text-sm text-[#4ade80]">Settings saved.</p>}
        {params.error && <p className="text-sm text-signal-red">{params.error}</p>}

        <button type="submit" className="btn-primary">
          Save Settings
        </button>
      </form>
    </div>
  );
}
