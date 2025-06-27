import type { MaintenanceRequest } from "@server/database/schema";

export interface MaintenanceRequestRepository {
  create(expense: Omit<MaintenanceRequest, 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest | null>;
  findAll(): Promise<MaintenanceRequest[]>;
  findById(id: string): Promise<MaintenanceRequest | null>;
  update(id: string, maintenanceRequest: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | null>;
  delete(id: string): Promise<void>;
}