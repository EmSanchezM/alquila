import type { OwnershipGuard } from "@server/shared/ownership";
import { NotFoundError } from "@server/shared/errors";
import type { MaintenanceRequest } from "@server/database/schema";
import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";

export class UpdateMaintenanceRequestUseCase {
  constructor(
    private readonly repository: MaintenanceRequestRepository,
    private readonly ownership: OwnershipGuard,
  ) {}

  async execute(id: string, payload: Partial<Omit<MaintenanceRequest, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<MaintenanceRequest> {
    await this.ownership.assertOwns(userId, payload);

    const updatedMaintenanceRequest = await this.repository.update(id, userId, payload);

    if (!updatedMaintenanceRequest) throw new NotFoundError('Maintenance request not found');

    return updatedMaintenanceRequest;
  }
}