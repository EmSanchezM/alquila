import type { MaintenanceRequest } from "@server/database/schema";
import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";

export class FindByIdMaintenanceRequestsUseCase {
  constructor(private readonly repository: MaintenanceRequestRepository) {}

  async execute(id: string): Promise<MaintenanceRequest> {
    const maintenanceRequest = await this.repository.findById(id);
    
    if (!maintenanceRequest) throw new Error('Maintenance request not found');
    
    return maintenanceRequest;
  }
}