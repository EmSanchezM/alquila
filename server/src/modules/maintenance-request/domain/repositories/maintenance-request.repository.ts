import type { MaintenanceRequest, NewMaintenanceRequest } from "@server/database/schema";

export interface MaintenanceRequestRepository {
  create(expense: Omit<NewMaintenanceRequest, 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest | null>;
  findAll(userId: string): Promise<MaintenanceRequest[]>;
  findById(id: string, userId: string): Promise<MaintenanceRequest | null>;
  update(id: string, userId: string, maintenanceRequest: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | null>;
  delete(id: string, userId: string): Promise<boolean>;
}