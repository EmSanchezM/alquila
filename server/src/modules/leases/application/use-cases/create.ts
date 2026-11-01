import type { OwnershipGuard } from "@server/shared/ownership";
import type { Lease, NewLease } from "@server/database/schema";
import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateLeaseUseCase {
  constructor(
    private readonly repository: LeasesRepository,
    private readonly ownership: OwnershipGuard,
  ) {}
  async execute(payload: Omit<NewLease, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Lease> {
    await this.ownership.assertOwns(userId, payload);

    const data = {
      ...payload,
      userId,
      id: generateUuid(),
    }
    const createdLease = await this.repository.create(data);

    if (!createdLease) throw new Error('Lease not created');

    return createdLease;
  }
}