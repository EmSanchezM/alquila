import type { Document, NewDocument } from "@server/database/schema";

export interface DocumentsRepository {
  create(document: Omit<NewDocument, 'createdAt' | 'updatedAt'>): Promise<Document | null>;
  findAll(userId: string): Promise<Document[]>;
  findById(id: string, userId: string): Promise<Document | null>;
  update(id: string, userId: string, document: Partial<Document>): Promise<Document | null>;
  delete(id: string, userId: string): Promise<boolean>;
}