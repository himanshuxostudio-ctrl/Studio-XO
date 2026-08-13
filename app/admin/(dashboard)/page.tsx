import Link from "next/link";
import { getUpcomingEvents, getOutlets, getReservations, getPrivatePartyLeads } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { sectionsForRole, type Section } from "@/lib/permissions";

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export default async function AdminDashboardPage() {
  const user = await requireAuth();
  const allowed = new Set(sectionsForRole(user.role));
  const can = (section: Section) => allowed.has(section);

  const [upcomingEvents, outlets, reservations, leads] = await Promise.all([
    can("events") ? getUpcomingEvents() : Promise.resolve([]),
    can("outlets") ? getOutlets() : Promise.resolve([]),
    can("reservations") ? getReservations() : Promise.resolve([]),
    can("private-parties") ? getPrivatePartyLeads() : Promise.resolve([]),
  ]);

  const weekEnd = daysFromNow(7);
  const eventsThisWeek = upcomingEvents.filter((e) => e.date <= weekEnd);
  const operationalOutlets = outlets.filter((o) => o.status === "operational");
  const reopeningOutlets = outlets.filter((o) => o.status === "reopening-soon" || o.status === "renovation");
  const newReservations = reservations.filter((r) => r.status === "new");
  const newLeads = leads.filter((l) => l.status === "new");

  const allStats: Array<{ label: string; value: number; href: string; section: Section }> = [
    { label: "Upcoming Events", value: upcomingEvents.length, href: "/admin/events", section: "events" },
    { label: "Events This Week", value: eventsThisWeek.length, href: "/admin/events", section: "events" },
    { label: "Operational Outlets", value: operationalOutlets.length, href: "/admin/outlets", section: "outlets" },
    { label: "Reopening / Renovation", value: reopeningOutlets.length, href: "/admin/outlets", section: "outlets" },
    { label: "New Reservations", value: newReservations.length, href: "/admin/reservations", section: "reservations" },
    { label: "New Private Party Leads", value: newLeads.length, href: "/admin/private-parties", section: "private-parties" },
  ];
  const stats = allStats.filter((stat) => can(stat.section));

  const allQuickActions: Array<{ label: string; href: string; section: Section; variant: "primary" | "outline" }> = [
    { label: "+ Add Event", href: "/admin/events/new", section: "events", variant: "primary" },
    { label: "+ Add Outlet", href: "/admin/outlets", section: "outlets", variant: "outline" },
    { label: "View Reservations", href: "/admin/reservations", section: "reservations", variant: "outline" },
    { label: "View Leads", href: "/admin/private-parties", section: "private-parties", variant: "outline" },
  ];
  const quickActions = allQuickActions.filter((action) => can(action.section));

  return (
    <div>
      <h1 className="text-display-3 mb-1">Overview</h1>
      <p className="mb-8 text-sm text-bone-400">Welcome back, {user.name.split(" ")[0]}.</p>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="card-surface p-5 hover:border-gold-bright/40">
              <p className="font-display text-3xl text-bone-100">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-bone-400">{stat.label}</p>
            </Link>
          ))}
        </div>
      )}

      {quickActions.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className={action.variant === "primary" ? "btn-primary" : "btn-outline"}>
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
