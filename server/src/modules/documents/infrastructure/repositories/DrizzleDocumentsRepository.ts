import { and, eq, getTableColumns, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { DocumentsRepository, DocumentWithNames } from "@server/modules/documents/domain/repositories/documents.repository";

import { db } from "@server/database";
import { documents, leases, properties, renters, type Document, type NewDocument } from "@server/database/schema";

const leaseProperty = alias(properties, "lease_property");
const leaseRenter = alias(renters, "lease_renter");

// Documents with the names of what they are linked to. Every link is optional, so these are
// left joins and a missing link gives a null name.
const withNames = () =>
  db.select({
    ...getTableColumns(documents),
    propertyName: properties.name,
    renterName: sql<string | null>`${renters.firstName} || ' ' || ${renters.lastName}`,
    leaseName: sql<string | null>`${leaseProperty.name} || ' · ' || ${leaseRenter.firstName} || ' ' || ${leaseRenter.lastName}`,
  })
    .from(documents)
    .leftJoin(properties, eq(documents.propertyId, properties.id))
    .leftJoin(renters, eq(documents.renterId, renters.id))
    .leftJoin(leases, eq(documents.leaseId, leases.id))
    .leftJoin(leaseProperty, eq(leases.propertyId, leaseProperty.id))
    .leftJoin(leaseRenter, eq(leases.renterId, leaseRenter.id));

export class DrizzleDocumentsRepository implements DocumentsRepository {
  async create(document: Omit<NewDocument, 'createdAt' | 'updatedAt'>): Promise<Document | null> {
    const [newDocument] = await db.insert(documents).values({
      ...document,
    }).returning();

    if(!newDocument) return null;

    return newDocument;
  }
  async findAll(userId: string): Promise<DocumentWithNames[]> {
    return await withNames().where(and(eq(documents.userId, userId), eq(documents.isActive, true)));
  }
  
  async findById(id: string, userId: string): Promise<DocumentWithNames | null> {
    const [result] = await withNames().where(and(eq(documents.id, id), eq(documents.userId, userId), eq(documents.isActive, true)));

    if(!result) return null;

    return result;
  }
  
  async update(id: string, userId: string, document: Partial<Document>): Promise<Document | null> {
    const [updatedDocument] = await db.update(documents)
      .set({
        ...document,
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), eq(documents.userId, userId), eq(documents.isActive, true)))
      .returning();

    if(!updatedDocument) return null;

    return updatedDocument;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const deleted = await db.update(documents)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), eq(documents.userId, userId), eq(documents.isActive, true)))
      .returning({ id: documents.id });

    return deleted.length > 0;
  }
}