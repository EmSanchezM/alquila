import { z } from "zod";

import { DOCUMENT_TYPES, tagsOf, type Document, type DocumentInput } from "@/lib/services/documents";

/** Select value for "no link"; a Select item cannot have an empty value. */
export const NO_LINK = "none";

const types: string[] = DOCUMENT_TYPES.map((t) => t.value);

// Form values are strings, as typed in the inputs. Limits mirror the server schema
// and the `documents` table. The file fields are set by the upload, not typed.
export const DocumentFormValidation = z.object({
  fileUrl: z.string().min(1, "Attach a file"),
  fileName: z.string(),
  fileSize: z.number().nullable(),
  mimeType: z.string().nullable(),
  name: z.string().trim().min(1, "Enter a name").max(200, "Use 200 characters or fewer"),
  type: z.string().refine((v) => types.includes(v), "Select a type"),
  propertyId: z.string(),
  renterId: z.string(),
  leaseId: z.string(),
  expirationDate: z.union([z.literal(""), z.iso.date("Enter a valid date")]),
  isImportant: z.boolean(),
  tags: z
    .string()
    .refine((v) => splitTags(v).every((t) => t.length <= 50), "Keep each tag to 50 characters or fewer")
    .refine((v) => splitTags(v).length <= 20, "Use 20 tags or fewer"),
});

export type DocumentFormValues = z.infer<typeof DocumentFormValidation>;

const splitTags = (value: string) => value.split(",").map((t) => t.trim()).filter(Boolean);

export const emptyDocumentForm: DocumentFormValues = {
  fileUrl: "",
  fileName: "",
  fileSize: null,
  mimeType: null,
  name: "",
  type: "",
  propertyId: NO_LINK,
  renterId: NO_LINK,
  leaseId: NO_LINK,
  expirationDate: "",
  isImportant: false,
  tags: "",
};

export function toDocumentForm(document: Document): DocumentFormValues {
  return {
    fileUrl: document.fileUrl,
    fileName: document.name,
    fileSize: document.fileSize,
    mimeType: document.mimeType,
    name: document.name,
    // An unknown legacy type is left blank so the user picks a valid one instead of it changing silently.
    type: types.includes(document.type) ? document.type : "",
    propertyId: document.propertyId ?? NO_LINK,
    renterId: document.renterId ?? NO_LINK,
    leaseId: document.leaseId ?? NO_LINK,
    expirationDate: document.expirationDate ?? "",
    isImportant: document.isImportant ?? false,
    tags: tagsOf(document).join(", "),
  };
}

/** Blank optional fields become null, so editing can clear them. */
export function toDocumentInput(values: DocumentFormValues): DocumentInput {
  const link = (value: string) => (value === NO_LINK ? null : value);
  const tags = splitTags(values.tags);
  return {
    name: values.name.trim(),
    type: values.type,
    fileUrl: values.fileUrl,
    fileSize: values.fileSize,
    mimeType: values.mimeType,
    propertyId: link(values.propertyId),
    renterId: link(values.renterId),
    leaseId: link(values.leaseId),
    expirationDate: values.expirationDate === "" ? null : values.expirationDate,
    isImportant: values.isImportant,
    tags: tags.length > 0 ? tags : null,
  };
}
