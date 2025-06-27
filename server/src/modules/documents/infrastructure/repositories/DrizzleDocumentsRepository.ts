import { eq } from "drizzle-orm";
import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";

import { db } from "@server/database";
import { documents, type Document } from "@server/database/schema";

export class DrizzleDocumentsRepository implements DocumentsRepository {
  async create(document: Omit<Document, 'createdAt' | 'updatedAt'>): Promise<Document | null> {
    const [newDocument] = await db.insert(documents).values({
      ...document,
    });

    if(!newDocument) return null;

    return newDocument;
  }
  async findAll(): Promise<Document[]> {
    return await db.select().from(documents);
  }
  
  async findById(id: string): Promise<Document | null> {
    const [result] = await db.select().from(documents).where(eq(documents.id, id));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, document: Partial<Document>): Promise<Document | null> {
    const [updatedDocument] = await db.update(documents)
      .set({
        ...document,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    if(!updatedDocument) return null;

    return updatedDocument;
  }

  async delete(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }
}