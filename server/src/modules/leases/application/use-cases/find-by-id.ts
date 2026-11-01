import { NotFoundError } from "@server/shared/errors";
import type { Lease } from "@server/database/schema";
import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";

export class FindByIdLeasesUseCase {
  constructor(private readonly repository: LeasesRepository) {}

  async execute(id: string, userId: string): Promise<Lease> {
    const lease = await this.repository.findById(id, userId);
    
    if (!lease) throw new NotFoundError('Lease not found');
    
    return lease;
  }
}