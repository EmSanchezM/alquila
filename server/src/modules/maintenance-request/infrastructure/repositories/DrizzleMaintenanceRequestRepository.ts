import { eq } from "drizzle-orm";
import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";

import { db } from "@server/database";
import { maintenanceRequests, type MaintenanceRequest } from "@server/database/schema";

export class DrizzleMaintenanceRequestRepository implements MaintenanceRequestRepository {
  async create(maintenanceRequest: Omit<MaintenanceRequest, 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest | null> {
    const [newMaintenanceRequest] = await db.insert(maintenanceRequests).values({
      ...maintenanceRequest,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if(!newMaintenanceRequest) return null;

    return newMaintenanceRequest;
  }
  async findAll(): Promise<MaintenanceRequest[]> {
    return await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.isActive, true));
  }
  
  async findById(id: string): Promise<MaintenanceRequest | null> {
    const [result] = await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, id));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, expense: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | null> {
    const [updatedMaintenance] = await db.update(maintenanceRequests)
      .set({
        ...expense,
        updatedAt: new Date(),
      })
      .where(eq(maintenanceRequests.id, id))
      .returning();

    if(!updatedMaintenance) return null;

    return updatedMaintenance;
  }

  async delete(id: string): Promise<void> {
    await db.update(maintenanceRequests)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(maintenanceRequests.id, id));
  }
}