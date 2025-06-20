import type { RentersRepository } from "@server/modules/renters/domain/repositories/renters.repository";

export class DeleteRenterUseCase {
  constructor(private readonly repository: RentersRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}