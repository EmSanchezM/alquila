import type { Lease } from "@server/database/schema";
import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";

export class UpdateLeaseUseCase {
  constructor(private readonly repository: LeasesRepository) {}

  async execute(id: string, payload: Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lease> {
    const updatedLease = await this.repository.update(id, payload);

    if (!updatedLease) throw new Error('Lease not updated');

    return updatedLease;
  }
}