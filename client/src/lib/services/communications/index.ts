import { queryOptions } from "@tanstack/react-query";

import { apiRequest, retryServerErrors } from "@/lib/services/api-client";

/** A row of the `communications` table as the API returns it, with the linked names. */
export interface Communication {
  id: string;
  userId: string;
  renterId: string | null;
  propertyId: string | null;
  type: string;
  direction: string;
  subject: string | null;
  message: string;
  status: string | null;
  sentAt: string;
  createdAt: string;
  renterName: string | null;
  propertyName: string | null;
}

export const COMMUNICATION_TYPES = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "call", label: "Call" },
  { value: "note", label: "Note" },
] as const;

export const COMMUNICATION_DIRECTIONS = [
  { value: "outbound", label: "Outbound" },
  { value: "inbound", label: "Inbound" },
] as const;

export const COMMUNICATION_STATUSES = [
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "read", label: "Read" },
  { value: "failed", label: "Failed" },
] as const;

/** Body accepted by POST /api/communications. The log is append-only: there is no update or delete. */
export interface CommunicationInput {
  type: string;
  direction: string;
  renterId: string | null;
  propertyId: string | null;
  subject: string | null;
  message: string;
  status: string;
  sentAt: string;
}

export const createCommunication = (input: CommunicationInput) =>
  apiRequest<{ id: string }>("/communications", { method: "POST", body: JSON.stringify(input) });

export const communicationsQueryKey = ["communications"] as const;

export const getAllCommunicationsQueryOptions = queryOptions({
  queryKey: communicationsQueryKey,
  queryFn: () => apiRequest<Communication[]>("/communications"),
  staleTime: 1000 * 60 * 5,
  retry: retryServerErrors,
});

export const getCommunicationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...communicationsQueryKey, id],
    queryFn: () => apiRequest<Communication>(`/communications/${encodeURIComponent(id)}`),
    retry: retryServerErrors,
  });
