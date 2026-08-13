import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { sectionsForRole, SECTION_LABELS, ROLE_LABELS, type Section } from "@/lib/permissions";
import { logoutAction } from "../login/actions";

// Auth must be checked per-request — never let this segment be statically
// cached (e.g. if env vars are unset at build time but set later).
export const dynamic = "force-dynamic";

const SECTION_ROUTES: Record<Section, string> = {
  overview: "/admin",
  events: "/admin/events",
  outlets: "/admin/outlets",
  reservations: "/admin/reservations",
  "private-parties": "/admin/private-parties",
  artists: "/admin/artists",
  media: "/admin/media",
  settings: "/admin/settings",
  users: "/admin/users",
};

const NAV_ORDER: Section[] = [
  "overview",
  "events",
  "outlets",
  "reservations",
  "private-parties",
  "artists",
  "media",
  "settings",
  "users",
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  const allowedSections = new Set(sectionsForRole(user.role));
  const links = NAV_ORDER.filter((section) => allowedSections.has(section));

  return (
    <div className="container-xo grid grid-cols-1 gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="border-b border-bone-300/10 pb-4">
          <p className="truncate text-sm font-medium text-bone-100">{user.name}</p>
          <p className="text-xs text-bone-400">{ROLE_LABELS[user.role]}</p>
        </div>

        <nav className="flex flex-row flex-wrap gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {links.map((section) => (
            <Link
              key={section}
              href={SECTION_ROUTES[section]}
              className="whitespace-nowrap border border-bone-300/15 px-4 py-2.5 text-sm text-bone-200 hover:border-gold-bright hover:text-gold-bright lg:border-0 lg:px-3 lg:py-2"
            >
              {SECTION_LABELS[section]}
            </Link>
          ))}
          <form action={logoutAction}>
            <button type="submit" className="w-full whitespace-nowrap border border-bone-300/15 px-4 py-2.5 text-left text-sm text-bone-400 hover:text-signal-red lg:border-0 lg:px-3 lg:py-2">
              Sign Out
            </button>
          </form>
        </nav>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
