import type { OwnershipGuard } from "@server/shared/ownership";
import type { MaintenanceRequest, NewMaintenanceRequest } from "@server/database/schema";
import type { MaintenanceRequestRepository } from "@server/modules/maintenance-request/domain/repositories/maintenance-request.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateMaintenanceRequestUseCase {
  constructor(
    private readonly repository: MaintenanceRequestRepository,
    private readonly ownership: OwnershipGuard,
  ) {}
  async execute(payload: Omit<NewMaintenanceRequest, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<MaintenanceRequest> {
    await this.ownership.assertOwns(userId, payload);

    const data = {
      ...payload,
      userId,
      id: generateUuid(),
    }
    const createdMaintenanceRequest = await this.repository.create(data);

    if (!createdMaintenanceRequest) throw new Error('Maintenance request not created');

    return createdMaintenanceRequest;
  }
}