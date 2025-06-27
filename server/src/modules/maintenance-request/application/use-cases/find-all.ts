import type { MaintenanceRequest } from "@server/database/schema";
import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";

export class FindAllMaintenanceRequestsUseCase {
  constructor(private readonly repository: MaintenanceRequestRepository) {}

  async execute(): Promise<Omit<MaintenanceRequest[], 'updatedAt'>> {
    return await this.repository.findAll();
  }
}