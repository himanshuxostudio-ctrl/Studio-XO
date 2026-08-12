import Link from "next/link";
import { getOutlets } from "@/lib/db";
import { OUTLET_STATUS_LABELS } from "@/lib/constants";

export default async function AdminOutletsPage() {
  const outlets = await getOutlets();

  return (
    <div>
      <h1 className="text-display-3 mb-8">Outlets</h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-bone-300/15 text-left text-xs uppercase tracking-wider text-bone-400">
              <th className="py-3 pr-4">Outlet</th>
              <th className="py-3 pr-4">City</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {outlets.map((outlet) => (
              <tr key={outlet.slug} className="border-b border-bone-300/10">
                <td className="py-3 pr-4 font-medium text-bone-100">{outlet.name}</td>
                <td className="py-3 pr-4 text-bone-300/70">{outlet.city}</td>
                <td className="py-3 pr-4 text-bone-300/70">{OUTLET_STATUS_LABELS[outlet.status]}</td>
                <td className="py-3 pr-4">
                  <Link href={`/admin/outlets/${outlet.slug}`} className="text-gold-bright hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
