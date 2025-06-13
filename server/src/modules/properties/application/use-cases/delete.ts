import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";

export class DeletePropertyUseCase {
  constructor(private readonly repository: PropertiesRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}