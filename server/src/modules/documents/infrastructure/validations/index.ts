import { z } from "zod";

// Limits mirror the `documents` table, so invalid values answer 400 instead of failing in Postgres.
// The type list in the table is open ("contract, receipt, invoice, certificate, etc.").
export const documentTypes = ["contract", "receipt", "invoice", "certificate", "identification", "insurance", "other"] as const;

// Links and columns that are nullable or have a table default: optional, and null clears the nullable ones.
// fileUrl must also be one of the caller's uploads; the use cases check that, since it needs the user.
const optionalFields = {
  propertyId: z.string().nullable().optional(),
  renterId: z.string().nullable().optional(),
  leaseId: z.string().nullable().optional(),
  fileSize: z.number().int().min(0).max(2_147_483_647).nullable().optional(),
  mimeType: z.string().max(100).nullable().optional(),
  expirationDate: z.iso.date().nullable().optional(),
  isImportant: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(20).nullable().optional(),
};

export const createDocumentSchema = z.object({
  name: z.string().max(200),
  type: z.enum(documentTypes),
  fileUrl: z.string().max(500),
  ...optionalFields,
});

export const findAllDocumentsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sort: z.object({
    field: z.string().optional(),
    order: z.string().optional(),
  }).optional(),
});

export const findByIdDocumentsSchema = z.object({
  id: z.string(),
});

export const updateDocumentsSchema = z.object({
  param: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().max(200).optional(),
    type: z.enum(documentTypes).optional(),
    fileUrl: z.string().max(500).optional(),
    ...optionalFields,
  }),
});

export type CreateDocument = z.infer<typeof createDocumentSchema>;
export type UpdateDocument = z.infer<typeof updateDocumentsSchema>;
export type FindAllDocuments = z.infer<typeof findAllDocumentsSchema>;
export type FindByIdDocuments = z.infer<typeof findByIdDocumentsSchema>;
export type DeleteDocument = z.infer<typeof findByIdDocumentsSchema>;

