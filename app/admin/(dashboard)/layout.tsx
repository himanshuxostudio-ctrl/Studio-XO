import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logoutAction } from "../login/actions";

// Auth must be checked per-request — never let this segment be statically
// cached (e.g. if ADMIN_PASSWORD is unset at build time but set later).
export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/outlets", label: "Outlets" },
  { href: "/admin/enquiries", label: "Enquiries" },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="container-xo grid grid-cols-1 gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap border border-bone-300/15 px-4 py-2.5 text-sm text-bone-200 hover:border-gold-bright hover:text-gold-bright lg:border-0 lg:px-3 lg:py-2"
          >
            {link.label}
          </Link>
        ))}
        <form action={logoutAction}>
          <button type="submit" className="whitespace-nowrap border border-bone-300/15 px-4 py-2.5 text-sm text-bone-400 hover:text-signal-red lg:border-0 lg:px-3 lg:py-2">
            Sign Out
          </button>
        </form>
      </aside>
      <main>{children}</main>
    </div>
  );
}
