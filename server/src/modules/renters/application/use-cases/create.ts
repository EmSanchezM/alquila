import type { Renter } from "@server/database/schema";
import type { RentersRepository } from "@server/modules/renters/domain/repositories/renters.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateRenterUseCase {
  constructor(private readonly repository: RentersRepository) {}
  async execute(payload: Omit<Renter, 'createdAt' | 'updatedAt'>): Promise<Renter> {
    const data = {
      ...payload,
      id: generateUuid(),
    }
    const createdRenter = await this.repository.create(data);

    if (!createdRenter) throw new Error('Renter not created');

    return createdRenter;
  }
}