import type { Property } from "@server/database/schema";
import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";

export class FindAllPropertiesUseCase {
  constructor(private readonly repository: PropertiesRepository) {}

  async execute(): Promise<Omit<Property[], 'updatedAt'>> {
    return await this.repository.findAll();;
  }
}