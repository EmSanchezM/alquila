import { and, eq } from "drizzle-orm";
import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";

import { db } from "@server/database";
import { documents, type Document, type NewDocument } from "@server/database/schema";

export class DrizzleDocumentsRepository implements DocumentsRepository {
  async create(document: Omit<NewDocument, 'createdAt' | 'updatedAt'>): Promise<Document | null> {
    const [newDocument] = await db.insert(documents).values({
      ...document,
    }).returning();

    if(!newDocument) return null;

    return newDocument;
  }
  async findAll(): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.isActive, true));
  }
  
  async findById(id: string): Promise<Document | null> {
    const [result] = await db.select().from(documents).where(and(eq(documents.id, id), eq(documents.isActive, true)));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, document: Partial<Document>): Promise<Document | null> {
    const [updatedDocument] = await db.update(documents)
      .set({
        ...document,
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), eq(documents.isActive, true)))
      .returning();

    if(!updatedDocument) return null;

    return updatedDocument;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db.update(documents)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), eq(documents.isActive, true)))
      .returning({ id: documents.id });

    return deleted.length > 0;
  }
}