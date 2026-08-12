"use client";

import { useState } from "react";
import type { Outlet } from "@/lib/types";

interface ContactFormProps {
  outlets: Outlet[];
  defaultOutletSlug?: string;
}

export function ContactForm({ outlets, defaultOutletSlug }: ContactFormProps) {
  const [outletSlug, setOutletSlug] = useState(defaultOutletSlug || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, outletSlug, message, website: "" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="card-surface p-8 text-center">
        <p className="font-display text-2xl text-bone-100">Message sent.</p>
        <p className="mt-2 text-sm text-bone-300/70">We&rsquo;ll get back to you shortly.</p>
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
      <div className="sm:col-span-2">
        <label htmlFor="outlet" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Outlet (optional)
        </label>
        <select id="outlet" value={outletSlug} onChange={(e) => setOutletSlug(e.target.value)} className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright">
          <option value="">General enquiry</option>
          {outlets.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-400">
          Message
        </label>
        <textarea id="message" rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border border-bone-300/20 bg-ink-900 px-4 py-3 text-bone-100 focus:border-gold-bright" />
      </div>
      {status === "error" && <p className="sm:col-span-2 text-sm text-signal-red">{errorMessage}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "submitting"} className="btn-primary w-full sm:w-auto">
          {status === "submitting" ? "Sending…" : "Send Message"}
        </button>
      </div>
    </form>
  );
}
