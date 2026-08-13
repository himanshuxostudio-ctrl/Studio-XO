import { redirect } from "next/navigation";
import { isSetupComplete } from "@/lib/auth";
import { loginAction } from "./actions";

// Whether this redirects to /admin/setup depends on runtime state
// (users.json) that doesn't exist at build time — never let this be
// statically cached, or a fresh deploy can bake in a stale redirect.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!(await isSetupComplete())) {
    redirect("/admin/setup");
  }

  const params = await searchParams;

  return (
    <div className="container-xo flex min-h-[70vh] items-center justify-center py-20">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-center">Studio XO Admin</p>
        <h1 className="text-display-3 mt-2 text-center">Sign In</h1>

        <form action={loginAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="username"
              className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
            />
          </div>

          {params.error && <p className="text-sm text-signal-red">{params.error}</p>}

          <button type="submit" className="btn-primary w-full">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
