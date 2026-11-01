import type { MaintenanceRequest, NewMaintenanceRequest } from "@server/database/schema";

export interface MaintenanceRequestRepository {
  create(expense: Omit<NewMaintenanceRequest, 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest | null>;
  findAll(): Promise<MaintenanceRequest[]>;
  findById(id: string): Promise<MaintenanceRequest | null>;
  update(id: string, maintenanceRequest: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | null>;
  delete(id: string): Promise<void>;
}