import type { MaintenanceRequest } from "@server/database/schema";
import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateMaintenanceRequestUseCase {
  constructor(private readonly repository: MaintenanceRequestRepository) {}
  async execute(payload: Omit<MaintenanceRequest, 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest> {
    const data = {
      ...payload,
      id: generateUuid(),
    }
    const createdMaintenanceRequest = await this.repository.create(data);

    if (!createdMaintenanceRequest) throw new Error('Maintenance request not created');

    return createdMaintenanceRequest;
  }
}