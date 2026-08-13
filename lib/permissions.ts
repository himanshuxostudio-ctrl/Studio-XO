import type { Role } from "./types";

export type Section =
  | "overview"
  | "events"
  | "outlets"
  | "reservations"
  | "private-parties"
  | "artists"
  | "media"
  | "settings"
  | "users";

export const ROLE_LABELS: Record<Role, string> = {
  "super-admin": "Super Admin",
  "marketing-lead": "Marketing Lead",
  marketing: "Marketing",
  "social-media": "Social Media",
  "reservations-sales": "Reservations / Sales",
};

export const SECTION_LABELS: Record<Section, string> = {
  overview: "Overview",
  events: "Events",
  outlets: "Outlets",
  reservations: "Reservations",
  "private-parties": "Private Party Leads",
  artists: "Artists",
  media: "Media",
  settings: "Settings",
  users: "Users & Roles",
};

/**
 * Section access per role. "overview" is available to every role that has
 * access to at least one other section, so everyone lands somewhere useful.
 * Settings and Users are Super Admin only — they control access itself and
 * site-wide contact numbers, not day-to-day content.
 */
const ROLE_SECTIONS: Record<Role, Section[]> = {
  "super-admin": ["overview", "events", "outlets", "reservations", "private-parties", "artists", "media", "settings", "users"],
  "marketing-lead": ["overview", "events", "outlets", "reservations", "private-parties", "artists", "media"],
  marketing: ["overview", "events", "private-parties", "artists", "media"],
  "social-media": ["overview", "events", "artists", "media"],
  "reservations-sales": ["overview", "reservations", "private-parties"],
};

export function sectionsForRole(role: Role): Section[] {
  return ROLE_SECTIONS[role] || [];
}

export function canAccess(role: Role, section: Section): boolean {
  return sectionsForRole(role).includes(section);
}
