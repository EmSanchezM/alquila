import { and, eq } from "drizzle-orm";
import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";

import { db } from "@server/database";
import { maintenanceRequests, type MaintenanceRequest, type NewMaintenanceRequest } from "@server/database/schema";

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
  async findAll(userId: string): Promise<MaintenanceRequest[]> {
    return await db.select().from(maintenanceRequests).where(and(eq(maintenanceRequests.userId, userId), eq(maintenanceRequests.isActive, true)));
  }
  
  async findById(id: string, userId: string): Promise<MaintenanceRequest | null> {
    const [result] = await db.select().from(maintenanceRequests).where(and(eq(maintenanceRequests.id, id), eq(maintenanceRequests.userId, userId), eq(maintenanceRequests.isActive, true)));

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