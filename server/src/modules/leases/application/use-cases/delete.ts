import { NotFoundError } from "@server/shared/errors";
import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";

export class DeleteLeaseUseCase {
  constructor(private readonly repository: LeasesRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const deleted = await this.repository.delete(id, userId);

    if (!deleted) throw new NotFoundError('Lease not found');
  }
}