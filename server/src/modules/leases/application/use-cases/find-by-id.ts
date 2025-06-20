import type { Lease } from "@server/database/schema";
import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";

export class FindByIdLeasesUseCase {
  constructor(private readonly repository: LeasesRepository) {}

  async execute(id: string): Promise<Lease> {
    const lease = await this.repository.findById(id);
    
    if (!lease) throw new Error('Lease not found');
    
    return lease;
  }
}