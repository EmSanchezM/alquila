import type { Document, NewDocument } from "@server/database/schema";

export interface DocumentsRepository {
  create(document: Omit<NewDocument, 'createdAt' | 'updatedAt'>): Promise<Document | null>;
  findAll(): Promise<Document[]>;
  findById(id: string): Promise<Document | null>;
  update(id: string, document: Partial<Document>): Promise<Document | null>;
  delete(id: string): Promise<boolean>;
}