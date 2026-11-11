import type { Document, NewDocument } from "@server/database/schema";

export type DocumentWithNames = Document & { propertyName: string | null; renterName: string | null; leaseName: string | null };

export interface DocumentsRepository {
  create(document: Omit<NewDocument, 'createdAt' | 'updatedAt'>): Promise<Document | null>;
  findAll(userId: string): Promise<DocumentWithNames[]>;
  findById(id: string, userId: string): Promise<DocumentWithNames | null>;
  update(id: string, userId: string, document: Partial<Document>): Promise<Document | null>;
  delete(id: string, userId: string): Promise<boolean>;
}