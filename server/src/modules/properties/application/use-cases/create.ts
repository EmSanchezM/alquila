import type { Property } from "@server/database/schema";
import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";

export class CreatePropertyUseCase {
  constructor(private readonly repository: PropertiesRepository) {}

  async execute(payload: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const createdProperty = await this.repository.create(payload);

    if (!createdProperty) throw new Error('Property not created');

    return createdProperty;
  }
}