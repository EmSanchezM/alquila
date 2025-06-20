import type { Renter } from "@server/database/schema";
import type { RentersRepository } from "@server/modules/renters/domain/repositories/renters.repository";

export class FindAllRentersUseCase {
  constructor(private readonly repository: RentersRepository) {}

  async execute(): Promise<Omit<Renter[], 'updatedAt'>> {
    return await this.repository.findAll();;
  }
}