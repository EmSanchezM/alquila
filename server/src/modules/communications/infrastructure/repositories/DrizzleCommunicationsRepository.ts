import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import type { CommunicationsRepository, CommunicationWithNames } from "@server/modules/communications/domain/repositories/communications.repository";

import { db } from "@server/database";
import { communications, properties, renters, type Communication, type NewCommunication } from "@server/database/schema";

// Communications with the names of their renter and property. Both links are optional, so these are
// left joins and a missing link gives a null name.
const withNames = () =>
  db.select({
    ...getTableColumns(communications),
    renterName: sql<string | null>`${renters.firstName} || ' ' || ${renters.lastName}`,
    propertyName: properties.name,
  })
    .from(communications)
    .leftJoin(renters, eq(communications.renterId, renters.id))
    .leftJoin(properties, eq(communications.propertyId, properties.id));

export class DrizzleCommunicationsRepository implements CommunicationsRepository {
  async create(communication: Omit<NewCommunication, 'createdAt'>): Promise<Communication | null> {
    const [created] = await db.insert(communications).values(communication).returning();

    return created ?? null;
  }

  async findAll(userId: string): Promise<CommunicationWithNames[]> {
    return await withNames().where(eq(communications.userId, userId)).orderBy(desc(communications.sentAt));
  }

  async findById(id: string, userId: string): Promise<CommunicationWithNames | null> {
    const [result] = await withNames().where(and(eq(communications.id, id), eq(communications.userId, userId)));

    return result ?? null;
  }
}
