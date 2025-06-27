import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";

export class DeleteMaintenanceRequestUseCase {
  constructor(private readonly repository: MaintenanceRequestRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}