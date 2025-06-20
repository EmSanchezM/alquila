import type { Renter } from "@server/database/schema";
import type { RentersRepository } from "@server/modules/renters/domain/repositories/renters.repository";

export class FindByIdRentersUseCase {
  constructor(private readonly repository: RentersRepository) {}

  async execute(id: string): Promise<Renter> {
    const renter = await this.repository.findById(id);
    
    if (!renter) throw new Error('Renter not found');
    
    return renter;
  }
}