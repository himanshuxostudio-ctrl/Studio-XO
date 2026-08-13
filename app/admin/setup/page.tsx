import { redirect } from "next/navigation";
import { isSetupComplete } from "@/lib/auth";
import { setupAction } from "./actions";

// Same reasoning as /admin/login — this gates on runtime-only state.
export const dynamic = "force-dynamic";

const fieldClass = "w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright";
const labelClass = "mb-2 block text-xs uppercase tracking-widest2 text-bone-400";

export default async function AdminSetupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isSetupComplete()) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const setupTokenConfigured = Boolean(process.env.ADMIN_SETUP_TOKEN);

  return (
    <div className="container-xo flex min-h-[70vh] items-center justify-center py-20">
      <div className="w-full max-w-md">
        <p className="eyebrow text-center">Studio XO Admin</p>
        <h1 className="text-display-3 mt-2 text-center">First-Time Setup</h1>
        <p className="mt-3 text-center text-sm text-bone-300/70">
          Create the first Super Admin account. This page disables itself once an account exists.
        </p>

        {!setupTokenConfigured ? (
          <div className="mt-8 border border-signal-red/40 bg-signal-red/10 p-4 text-sm text-signal-red">
            <p className="font-semibold">Setup is disabled.</p>
            <p className="mt-1 text-bone-200/80">
              Set the <code className="text-bone-100">ADMIN_SETUP_TOKEN</code> and <code className="text-bone-100">SESSION_SECRET</code>{" "}
              environment variables on the server, then reload this page.
            </p>
          </div>
        ) : (
          <form action={setupAction} className="mt-8 space-y-4">
            <div>
              <label className={labelClass} htmlFor="setupToken">Setup Token</label>
              <input id="setupToken" name="setupToken" type="password" required className={fieldClass} />
              <p className="mt-1 text-xs text-bone-500">Matches the ADMIN_SETUP_TOKEN environment variable.</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="name">Full Name</label>
              <input id="name" name="name" required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required minLength={10} className={fieldClass} />
              <p className="mt-1 text-xs text-bone-500">At least 10 characters, with upper, lower and a number.</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required minLength={10} className={fieldClass} />
            </div>

            {params.error && <p className="text-sm text-signal-red">{params.error}</p>}

            <button type="submit" className="btn-primary w-full">
              Create Super Admin Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
