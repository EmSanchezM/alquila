import { z } from "zod";

// Limits mirror the `communications` table, so invalid values answer 400 instead of failing in Postgres.
export const communicationTypes = ["email", "sms", "call", "note"] as const;
export const communicationDirections = ["inbound", "outbound"] as const;
export const communicationStatuses = ["sent", "delivered", "failed", "read"] as const;

export const createCommunicationSchema = z.object({
  type: z.enum(communicationTypes),
  direction: z.enum(communicationDirections),
  message: z.string().min(1),
  renterId: z.string().nullable().optional(),
  propertyId: z.string().nullable().optional(),
  subject: z.string().max(200).nullable().optional(),
  status: z.enum(communicationStatuses).optional(),
  // When it happened; defaults to now. An ISO date-time with offset or an ISO date.
  sentAt: z.union([z.iso.datetime({ offset: true }), z.iso.date()]).transform((value) => new Date(value)).optional(),
});

export const findByIdCommunicationSchema = z.object({
  id: z.string(),
});
