import { notFound } from "next/navigation";
import { getEventBySlug, getOutlets, getArtists } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { EventForm } from "@/components/admin/EventForm";

export default async function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSection("events");
  const { slug } = await params;
  const [event, outlets, artists] = await Promise.all([getEventBySlug(slug), getOutlets(), getArtists()]);
  if (!event) notFound();

  return (
    <div>
      <h1 className="text-display-3 mb-8">Edit Event</h1>
      <EventForm event={event} outlets={outlets} artists={artists} />
    </div>
  );
}
