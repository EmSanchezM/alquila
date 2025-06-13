import type { Property } from "@server/database/schema";
import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";

export class FindByIdPropertiesUseCase {
  constructor(private readonly repository: PropertiesRepository) {}

  async execute(id: string): Promise<Property> {
    const property = await this.repository.findById(id);
    
    if (!property) throw new Error('Property not found');
    
    return property;

  }
}