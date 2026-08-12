"use client";

import { useMemo, useState } from "react";
import type { Outlet } from "@/lib/types";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { tableReservationMessage } from "@/lib/whatsapp";
import { analytics } from "@/lib/analytics";

interface ReservationFormProps {
  outlets: Outlet[];
  defaultOutletSlug?: string;
  defaultEventSlug?: string;
}

const OCCASIONS = ["No specific occasion", "Birthday", "Anniversary", "Bachelor/Bachelorette", "Corporate", "Reunion", "Other"];

export function ReservationForm({ outlets, defaultOutletSlug, defaultEventSlug }: ReservationFormProps) {
  const bookable = useMemo(() => outlets.filter((o) => o.status === "operational"), [outlets]);
  const [outletSlug, setOutletSlug] = useState(defaultOutletSlug && bookable.some((o) => o.slug === defaultOutletSlug) ? defaultOutletSlug : bookable[0]?.slug || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [additionalRequest, setAdditionalRequest] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const outlet = bookable.find((o) => o.slug === outletSlug);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outletSlug,
          eventSlug: defaultEventSlug,
          name,
          phone,
          email,
          date,
          time,
          guests,
          occasion,
          additionalRequest,
          website: "",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again or WhatsApp us.");
      }

      if (outlet) analytics.reservationSubmit({ outlet: outlet.name, city: outlet.city, guests });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (!bookable.length) {
    return (
      <p className="text-sm text-bone-300/70">
        No outlets are currently accepting table reservations. Please check back soon or WhatsApp us for updates.
      </p>
    );
  }

  if (status === "success") {
    return (
      <div className="card-surface p-8 text-center">
        <p className="font-display text-2xl text-bone-100">Request received.</p>
        <p className="mt-2 text-sm text-bone-300/70">
          {outlet?.name} will confirm your table over WhatsApp or a call shortly. Reservations are subject to availability.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="outlet" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Outlet
        </label>
        <select
          id="outlet"
          required
          value={outletSlug}
          onChange={(e) => setOutletSlug(e.target.value)}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        >
          {bookable.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Date
        </label>
        <input
          id="date"
          type="date"
          required
          min={new Date().toISOString().split("T")[0]}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        />
      </div>

      <div>
        <label htmlFor="time" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Preferred Time
        </label>
        <input
          id="time"
          type="time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        />
      </div>

      <div>
        <label htmlFor="guests" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Number of Guests
        </label>
        <input
          id="guests"
          type="number"
          min={1}
          max={100}
          required
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        />
      </div>

      <div>
        <label htmlFor="occasion" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Occasion
        </label>
        <select
          id="occasion"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        >
          {OCCASIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Full Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Email (optional)
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="request" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Additional Request (optional)
        </label>
        <textarea
          id="request"
          rows={3}
          value={additionalRequest}
          onChange={(e) => setAdditionalRequest(e.target.value)}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        />
      </div>

      <p className="sm:col-span-2 text-xs text-bone-400">
        Table reservations are subject to availability. The outlet will contact you to confirm.
      </p>

      {status === "error" && <p className="sm:col-span-2 text-sm text-signal-red">{errorMessage}</p>}

      <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={status === "submitting"} className="btn-primary flex-1">
          {status === "submitting" ? "Sending…" : "Request Reservation"}
        </button>
        {outlet && (
          <WhatsAppCTA
            number={outlet.whatsappNumber}
            message={tableReservationMessage({ outletName: outlet.name, guests, date, time, name })}
            context="reservation-form"
            outlet={outlet.name}
            city={outlet.city}
            label="Reserve via WhatsApp"
            className="flex-1"
          />
        )}
      </div>
    </form>
  );
}
