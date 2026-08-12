import { getOutlets } from "@/lib/db";
import { EventForm } from "@/components/admin/EventForm";

export default async function NewEventPage() {
  const outlets = await getOutlets();
  return (
    <div>
      <h1 className="text-display-3 mb-8">New Event</h1>
      <EventForm outlets={outlets} />
    </div>
  );
}
