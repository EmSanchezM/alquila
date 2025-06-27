import { z } from "zod";

export const createDocumentSchema = z.object({
  propertyId: z.string(),
  userId: z.string(),
  renterId: z.string(),
  leaseId: z.string(),
  name: z.string(),
  type: z.string(),
  fileUrl: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  expirationDate: z.string(),
  isImportant: z.boolean(),
  tags: z.array(z.string()),
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
    propertyId: z.string().optional(),
    userId: z.string().optional(),
    renterId: z.string().optional(),
    leaseId: z.string().optional(),
    name: z.string().optional(),
    type: z.string().optional(),
    fileUrl: z.string().optional(),
    fileSize: z.number().optional(),
    mimeType: z.string().optional(),
    expirationDate: z.string().optional(),
    isImportant: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export type CreateDocument = z.infer<typeof createDocumentSchema>;
export type UpdateDocument = z.infer<typeof updateDocumentsSchema>;
export type FindAllDocuments = z.infer<typeof findAllDocumentsSchema>;
export type FindByIdDocuments = z.infer<typeof findByIdDocumentsSchema>;
export type DeleteDocument = z.infer<typeof findByIdDocumentsSchema>;

