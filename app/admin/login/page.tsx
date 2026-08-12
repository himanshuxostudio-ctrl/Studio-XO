import { loginAction } from "./actions";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <div className="container-xo flex min-h-[70vh] items-center justify-center py-20">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-center">Studio XO Admin</p>
        <h1 className="text-display-3 mt-2 text-center">Sign In</h1>

        <form action={loginAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
            />
          </div>

          {params.error && <p className="text-sm text-signal-red">Incorrect password. Please try again.</p>}

          <button type="submit" className="btn-primary w-full">
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-bone-500">
          Set the ADMIN_PASSWORD environment variable to enable admin access.
        </p>
      </div>
    </div>
  );
}
