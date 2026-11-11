import { and, eq, getTableColumns, sql } from "drizzle-orm";
import type { MaintenanceRequestRepository, MaintenanceRequestWithNames } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";

import { db } from "@server/database";
import { maintenanceRequests, properties, renters, type MaintenanceRequest, type NewMaintenanceRequest } from "@server/database/schema";

// Requests with the names the screens show. The renter is optional, so it is a left join
// and renterName is null without one.
const withNames = () =>
  db.select({
    ...getTableColumns(maintenanceRequests),
    propertyName: properties.name,
    renterName: sql<string | null>`${renters.firstName} || ' ' || ${renters.lastName}`,
  })
    .from(maintenanceRequests)
    .innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
    .leftJoin(renters, eq(maintenanceRequests.renterId, renters.id));

export class DrizzleMaintenanceRequestRepository implements MaintenanceRequestRepository {
  async create(maintenanceRequest: Omit<NewMaintenanceRequest, 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest | null> {
    const [newMaintenanceRequest] = await db.insert(maintenanceRequests).values({
      ...maintenanceRequest,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if(!newMaintenanceRequest) return null;

    return newMaintenanceRequest;
  }
  async findAll(userId: string): Promise<MaintenanceRequestWithNames[]> {
    return await withNames().where(and(eq(maintenanceRequests.userId, userId), eq(maintenanceRequests.isActive, true)));
  }
  
  async findById(id: string, userId: string): Promise<MaintenanceRequestWithNames | null> {
    const [result] = await withNames().where(and(eq(maintenanceRequests.id, id), eq(maintenanceRequests.userId, userId), eq(maintenanceRequests.isActive, true)));

    if(!result) return null;

    return result;
  }
  
  async update(id: string, userId: string, expense: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | null> {
    const [updatedMaintenance] = await db.update(maintenanceRequests)
      .set({
        ...expense,
        updatedAt: new Date(),
      })
      .where(and(eq(maintenanceRequests.id, id), eq(maintenanceRequests.userId, userId), eq(maintenanceRequests.isActive, true)))
      .returning();

    if(!updatedMaintenance) return null;

    return updatedMaintenance;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const deleted = await db.update(maintenanceRequests)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(maintenanceRequests.id, id), eq(maintenanceRequests.userId, userId), eq(maintenanceRequests.isActive, true)))
      .returning({ id: maintenanceRequests.id });

    return deleted.length > 0;
  }
}