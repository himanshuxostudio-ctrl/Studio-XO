import Link from "next/link";
import { getAllEvents, getOutlets, listEnquiries } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [events, outlets, enquiries] = await Promise.all([getAllEvents(), getOutlets(), listEnquiries()]);
  const published = events.filter((e) => e.published).length;
  const operational = outlets.filter((o) => o.status === "operational").length;

  const stats = [
    { label: "Total Events", value: events.length, href: "/admin/events" },
    { label: "Published Events", value: published, href: "/admin/events" },
    { label: "Outlets", value: outlets.length, href: "/admin/outlets" },
    { label: "Operational Outlets", value: operational, href: "/admin/outlets" },
    { label: "Enquiries", value: enquiries.length, href: "/admin/enquiries" },
  ];

  return (
    <div>
      <h1 className="text-display-3 mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card-surface p-5 hover:border-gold-bright/40">
            <p className="font-display text-3xl text-bone-100">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-bone-400">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin/events/new" className="btn-primary">
          + New Event
        </Link>
        <Link href="/admin/enquiries" className="btn-outline">
          View Enquiries
        </Link>
      </div>
    </div>
  );
}
