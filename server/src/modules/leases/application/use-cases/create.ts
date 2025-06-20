import type { Lease } from "@server/database/schema";
import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateLeaseUseCase {
  constructor(private readonly repository: LeasesRepository) {}
  async execute(payload: Omit<Lease, 'createdAt' | 'updatedAt'>): Promise<Lease> {
    const data = {
      ...payload,
      id: generateUuid(),
    }
    const createdLease = await this.repository.create(data);

    if (!createdLease) throw new Error('Lease not created');

    return createdLease;
  }
}