import { queryOptions } from "@tanstack/react-query";

import { apiRequest, crudClient, retryServerErrors } from "@/lib/services/api-client";

/** A row of the `documents` table as the API returns it. */
export interface Document {
  id: string;
  userId: string;
  propertyId: string | null;
  renterId: string | null;
  leaseId: string | null;
  name: string;
  type: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  expirationDate: string | null;
  isImportant: boolean | null;
  tags: unknown;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/documents and /:id add the names of what the document is linked to (null without a link). */
export type DocumentWithNames = Document & { propertyName: string | null; renterName: string | null; leaseName: string | null };

export const DOCUMENT_TYPES = [
  { value: "contract", label: "Contract" },
  { value: "receipt", label: "Receipt" },
  { value: "invoice", label: "Invoice" },
  { value: "certificate", label: "Certificate" },
  { value: "identification", label: "Identification" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
] as const;

/** Body accepted by POST and PUT /api/documents. Nullable columns are cleared with null. */
export interface DocumentInput {
  name: string;
  type: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  propertyId: string | null;
  renterId: string | null;
  leaseId: string | null;
  expirationDate: string | null;
  isImportant: boolean;
  tags: string[] | null;
}

const documents = crudClient<DocumentWithNames, DocumentInput>("/documents");

// Create and update answer with the plain row (no names), so callers refetch the detail.
export const createDocument = (input: DocumentInput) =>
  apiRequest<Document>("/documents", { method: "POST", body: JSON.stringify(input) });
/** fileUrl is optional on update: leaving it out keeps the current file. */
export type DocumentUpdateInput = Omit<DocumentInput, "fileUrl"> & { fileUrl?: string };

export const updateDocument = (id: string, input: DocumentUpdateInput) =>
  apiRequest<Document>(`/documents/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
export const deleteDocument = documents.remove;

export const documentsQueryKey = ["documents"] as const;

export const getAllDocumentsQueryOptions = queryOptions({
  queryKey: documentsQueryKey,
  queryFn: documents.getAll,
  staleTime: 1000 * 60 * 5,
  retry: retryServerErrors,
});

export const getDocumentQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...documentsQueryKey, id],
    queryFn: () => documents.get(id),
    retry: retryServerErrors,
  });

/** What the document belongs to, most specific first. */
export const linkedToOf = (document: DocumentWithNames) =>
  document.leaseName ?? document.propertyName ?? document.renterName ?? "General";

export const tagsOf = (document: Document): string[] =>
  Array.isArray(document.tags) ? document.tags.filter((t): t is string => typeof t === "string") : [];

export { expirationStatus } from "./expiration";
