import type { MaintenanceRequest } from "@server/database/schema";
import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";

export class FindAllMaintenanceRequestsUseCase {
  constructor(private readonly repository: MaintenanceRequestRepository) {}

  async execute(userId: string): Promise<Omit<MaintenanceRequest[], 'updatedAt'>> {
    return await this.repository.findAll(userId);
  }
}