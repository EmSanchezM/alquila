import type { Lease,  } from "@server/database/schema";
import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";

export class FindAllLeasesUseCase {
  constructor(private readonly repository: LeasesRepository) {}

  async execute(): Promise<Omit<Lease[], 'updatedAt'>> {
    return await this.repository.findAll();
  }
}