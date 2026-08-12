import type { FAQItem } from "@/lib/types";
import { faqSchema } from "@/lib/schema";
import { JsonLd } from "./JsonLd";

export function FAQ({ items, title = "Good to know" }: { items: FAQItem[]; title?: string }) {
  if (!items.length) return null;

  return (
    <section className="container-xo py-16 sm:py-20">
      <JsonLd data={faqSchema(items)} />
      <h2 className="text-display-3 mb-8">{title}</h2>
      <div className="divide-y divide-bone-300/10 border-t border-bone-300/10">
        {items.map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-bone-100 sm:text-lg">
              {item.question}
              <span className="shrink-0 text-gold-bright transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bone-300/80">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
