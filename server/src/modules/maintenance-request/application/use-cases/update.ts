import type { MaintenanceRequest } from "@server/database/schema";
import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";

export class UpdateMaintenanceRequestUseCase {
  constructor(private readonly repository: MaintenanceRequestRepository) {}

  async execute(id: string, payload: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest> {
    const updatedMaintenanceRequest = await this.repository.update(id, payload);

    if (!updatedMaintenanceRequest) throw new Error('Maintenance request not updated');

    return updatedMaintenanceRequest;
  }
}