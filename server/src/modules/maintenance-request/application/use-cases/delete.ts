import { NotFoundError } from "@server/shared/errors";
import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";

export class DeleteMaintenanceRequestUseCase {
  constructor(private readonly repository: MaintenanceRequestRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) throw new NotFoundError('Maintenance request not found');
  }
}