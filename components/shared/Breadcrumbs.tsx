import Link from "next/link";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "./JsonLd";

interface BreadcrumbsProps {
  items: { name: string; url: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const full = [{ name: "Home", url: "/" }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="container-xo py-4">
      <JsonLd data={breadcrumbSchema(full)} />
      <ol className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-wider text-bone-400">
        {full.map((item, index) => (
          <li key={item.url} className="flex items-center gap-1.5">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === full.length - 1 ? (
              <span className="text-bone-100" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link href={item.url} className="hover:text-gold-bright transition-colors">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
