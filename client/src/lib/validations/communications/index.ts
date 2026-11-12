import { z } from "zod";

import { COMMUNICATION_DIRECTIONS, COMMUNICATION_STATUSES, COMMUNICATION_TYPES, type CommunicationInput } from "@/lib/services/communications";

/** Select value for "no link"; a Select item cannot have an empty value. */
export const NO_LINK = "none";

const oneOf = (options: readonly { value: string }[], message: string) =>
  z.string().refine((v) => options.some((o) => o.value === v), message);

// Form values are strings, as typed in the inputs. Limits mirror the server schema.
export const CommunicationFormValidation = z.object({
  type: oneOf(COMMUNICATION_TYPES, "Select a type"),
  direction: oneOf(COMMUNICATION_DIRECTIONS, "Select a direction"),
  renterId: z.string(),
  propertyId: z.string(),
  subject: z.string().trim().max(200, "Use 200 characters or fewer"),
  message: z.string().trim().min(1, "Write the message or a summary of the conversation"),
  status: oneOf(COMMUNICATION_STATUSES, "Select a status"),
  // A datetime-local value (local time, no offset).
  sentAt: z.string().refine((v) => v !== "" && !Number.isNaN(new Date(v).getTime()), "Enter when it happened"),
});

export type CommunicationFormValues = z.infer<typeof CommunicationFormValidation>;

/** The value a datetime-local input shows for a moment, in the viewer's time zone. */
export function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const emptyCommunicationForm = (now: Date, renterId?: string): CommunicationFormValues => ({
  type: "",
  direction: "outbound",
  renterId: renterId ?? NO_LINK,
  propertyId: NO_LINK,
  subject: "",
  message: "",
  status: "sent",
  sentAt: toLocalInputValue(now),
});

export function toCommunicationInput(values: CommunicationFormValues): CommunicationInput {
  const link = (value: string) => (value === NO_LINK ? null : value);
  return {
    type: values.type,
    direction: values.direction,
    renterId: link(values.renterId),
    propertyId: link(values.propertyId),
    subject: values.subject.trim() === "" ? null : values.subject.trim(),
    message: values.message.trim(),
    status: values.status,
    // The local time typed in the form, sent as an absolute instant.
    sentAt: new Date(values.sentAt).toISOString(),
  };
}
