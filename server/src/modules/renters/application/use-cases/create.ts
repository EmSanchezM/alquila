import type { Renter, NewRenter } from "@server/database/schema";
import type { RentersRepository } from "@server/modules/renters/domain/repositories/renters.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateRenterUseCase {
  constructor(private readonly repository: RentersRepository) {}
  async execute(payload: Omit<NewRenter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Renter> {
    const data = {
      ...payload,
      userId,
      id: generateUuid(),
    }
    const createdRenter = await this.repository.create(data);

    if (!createdRenter) throw new Error('Renter not created');

    return createdRenter;
  }
}