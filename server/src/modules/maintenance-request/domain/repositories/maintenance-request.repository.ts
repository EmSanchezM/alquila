import type { MaintenanceRequest, NewMaintenanceRequest } from "@server/database/schema";

export type MaintenanceRequestWithNames = MaintenanceRequest & { propertyName: string; renterName: string | null };

export interface MaintenanceRequestRepository {
  create(expense: Omit<NewMaintenanceRequest, 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest | null>;
  findAll(userId: string): Promise<MaintenanceRequestWithNames[]>;
  findById(id: string, userId: string): Promise<MaintenanceRequestWithNames | null>;
  update(id: string, userId: string, maintenanceRequest: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | null>;
  delete(id: string, userId: string): Promise<boolean>;
}