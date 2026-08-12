import { getOutletsByBrand } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { LocationChooser } from "@/components/home/LocationChooser";
import { ExperienceSection } from "@/components/home/ExperienceSection";
import { PrivatePartyTeaser } from "@/components/home/PrivatePartyTeaser";
import { GallerySection } from "@/components/home/GallerySection";
import { RoomXoTeaser } from "@/components/home/RoomXoTeaser";
import { SocialSection } from "@/components/home/SocialSection";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata = buildMetadata({
  title: "Studio XO — Live Music, Nightlife & Private Parties",
  description:
    "Studio XO is a live-entertainment, dining and nightlife brand across 9 Indian cities — live music, comedy, Sufi nights, private parties and Room XO's techno floor.",
  path: "/",
});

export default async function HomePage() {
  const outlets = await getOutletsByBrand("studio-xo");

  return (
    <>
      <Hero outlets={outlets} />
      <FeaturedEvents />
      <LocationChooser />
      <ExperienceSection />
      <PrivatePartyTeaser />
      <GallerySection />
      <RoomXoTeaser />
      <SocialSection />
      <FinalCTA />
    </>
  );
}
