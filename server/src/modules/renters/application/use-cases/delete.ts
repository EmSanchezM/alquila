import { ConflictError, NotFoundError } from "@server/shared/errors";
import type { RentersRepository } from "@server/modules/renters/domain/repositories/renters.repository";

export class DeleteRenterUseCase {
  constructor(private readonly repository: RentersRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    if (await this.repository.hasActiveLeases(id, userId)) {
      throw new ConflictError('Renter has active leases');
    }

    const deleted = await this.repository.delete(id, userId);

    if (!deleted) throw new NotFoundError('Renter not found');
  }
}