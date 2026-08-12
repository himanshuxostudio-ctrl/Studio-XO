"use client";

import { useMemo, useState } from "react";
import type { Outlet } from "@/lib/types";
import { analytics } from "@/lib/analytics";

interface PrivatePartyFormProps {
  outlets: Outlet[];
  defaultOutletSlug?: string;
}

const EVENT_TYPES = [
  "Birthday",
  "Corporate Event",
  "Social Gathering",
  "Private Celebration",
  "Group Dining",
  "Brand Event",
  "College Event",
  "Bachelor/Bachelorette",
  "Other",
];

const BUDGETS = ["Not sure yet", "Under ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000 – ₹3,00,000", "₹3,00,000+"];

export function PrivatePartyForm({ outlets, defaultOutletSlug }: PrivatePartyFormProps) {
  const cities = useMemo(() => Array.from(new Set(outlets.map((o) => o.city))).sort(), [outlets]);
  const [city, setCity] = useState(cities[0] || "");
  const [outletSlug, setOutletSlug] = useState(defaultOutletSlug || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guests, setGuests] = useState(20);
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const cityOutlets = outlets.filter((o) => o.city === city);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/private-parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          city,
          outletSlug,
          eventDate,
          guests,
          eventType,
          budget,
          message,
          website: "",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      analytics.privatePartyLead({ city, outlet: outletSlug });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="card-surface p-8 text-center">
        <p className="font-display text-2xl text-bone-100">Enquiry received.</p>
        <p className="mt-2 text-sm text-bone-300/70">
          Our private events team will reach out to plan your night. Thank you for choosing XO.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Full Name
        </label>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright" />
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Phone Number
        </label>
        <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright" />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Email
        </label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright" />
      </div>

      <div>
        <label htmlFor="city" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          City
        </label>
        <select
          id="city"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setOutletSlug("");
          }}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="outlet" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Preferred Outlet (optional)
        </label>
        <select
          id="outlet"
          value={outletSlug}
          onChange={(e) => setOutletSlug(e.target.value)}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        >
          <option value="">No preference</option>
          {cityOutlets.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="eventDate" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Event Date
        </label>
        <input
          id="eventDate"
          type="date"
          required
          min={new Date().toISOString().split("T")[0]}
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        />
      </div>

      <div>
        <label htmlFor="guests" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Expected Guests
        </label>
        <input
          id="guests"
          type="number"
          min={1}
          max={2000}
          required
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright"
        />
      </div>

      <div>
        <label htmlFor="eventType" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Event Type
        </label>
        <select id="eventType" value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright">
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="budget" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Estimated Budget
        </label>
        <select id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright">
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Tell us about your night
        </label>
        <textarea id="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright" />
      </div>

      {status === "error" && <p className="sm:col-span-2 text-sm text-signal-red">{errorMessage}</p>}

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "submitting"} className="btn-primary w-full sm:w-auto">
          {status === "submitting" ? "Sending…" : "Submit Enquiry"}
        </button>
      </div>
    </form>
  );
}
