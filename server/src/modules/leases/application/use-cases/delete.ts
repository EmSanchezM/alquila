import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";

export class DeleteLeaseUseCase {
  constructor(private readonly repository: LeasesRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}