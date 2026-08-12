import { notFound } from "next/navigation";
import { getEventBySlug, getOutlets } from "@/lib/db";
import { EventForm } from "@/components/admin/EventForm";

export default async function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, outlets] = await Promise.all([getEventBySlug(slug), getOutlets()]);
  if (!event) notFound();

  return (
    <div>
      <h1 className="text-display-3 mb-8">Edit Event</h1>
      <EventForm event={event} outlets={outlets} />
    </div>
  );
}
