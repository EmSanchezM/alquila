import type { Renter } from "@server/database/schema";
import type { RentersRepository } from "@server/modules/renters/domain/repositories/renters.repository";

export class UpdateRenterUseCase {
  constructor(private readonly repository: RentersRepository) {}

  async execute(id: string, payload: Omit<Renter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Renter> {
    const updatedRenter = await this.repository.update(id, payload);

    if (!updatedRenter) throw new Error('Renter not updated');

    return updatedRenter;
  }
}