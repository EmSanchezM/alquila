import { ConflictError, NotFoundError } from "@server/shared/errors";
import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";

export class DeletePropertyUseCase {
  constructor(private readonly repository: PropertiesRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    if (await this.repository.hasActiveLeases(id, userId)) {
      throw new ConflictError('Property has active leases');
    }

    const deleted = await this.repository.delete(id, userId);

    if (!deleted) throw new NotFoundError('Property not found');
  }
}