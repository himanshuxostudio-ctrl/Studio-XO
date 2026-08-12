import type { MetadataRoute } from "next";
import { getOutlets, getPublishedEvents } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [outlets, events] = await Promise.all([getOutlets(), getPublishedEvents()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/outlets`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/room-xo`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/private-parties`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/reserve`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const outletRoutes: MetadataRoute.Sitemap = outlets
    .filter((o) => o.brand === "studio-xo")
    .map((outlet) => ({
      url: `${SITE_URL}/outlets/${outlet.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...outletRoutes, ...eventRoutes];
}
