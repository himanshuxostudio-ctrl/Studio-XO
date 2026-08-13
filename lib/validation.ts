import { z } from "zod";

const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;

export const reservationSchema = z.object({
  outletSlug: z.string().min(1, "Please choose an outlet"),
  eventSlug: z.string().optional(),
  name: z.string().min(2, "Enter your full name").max(100),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  date: z.string().min(1, "Select a date"),
  time: z.string().min(1, "Select a preferred time"),
  guests: z.coerce.number().int().min(1, "At least 1 guest").max(100),
  occasion: z.string().max(100).optional().or(z.literal("")),
  additionalRequest: z.string().max(500).optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
});

export const privatePartySchema = z.object({
  name: z.string().min(2, "Enter your full name").max(100),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  city: z.string().min(1, "Select a city"),
  outletSlug: z.string().optional().or(z.literal("")),
  eventDate: z.string().min(1, "Select a date"),
  guests: z.coerce.number().int().min(1, "At least 1 guest").max(2000),
  eventType: z.string().min(1, "Select an event type"),
  budget: z.string().max(100).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your full name").max(100),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  outletSlug: z.string().optional().or(z.literal("")),
  message: z.string().min(5, "Tell us a little more").max(1000),
  website: z.string().optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

export const setupSchema = z
  .object({
    setupToken: z.string().min(1, "Enter the setup token"),
    name: z.string().min(2, "Enter your full name").max(100),
    email: z.string().email("Enter a valid email"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createUserSchema = z.object({
  name: z.string().min(2, "Enter a full name").max(100),
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
  role: z.enum(["super-admin", "marketing-lead", "marketing", "social-media", "reservations-sales"]),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type PrivatePartyInput = z.infer<typeof privatePartySchema>;
export type ContactInput = z.infer<typeof contactSchema>;
