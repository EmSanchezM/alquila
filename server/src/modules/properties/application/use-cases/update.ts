import type { Property } from "@server/database/schema";
import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";

export class UpdatePropertyUseCase {
  constructor(private readonly repository: PropertiesRepository) {}

  async execute(id: string, payload: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const updatedProperty = await this.repository.update(id, payload);

    if (!updatedProperty) throw new Error('Property not updated');

    return updatedProperty;
  }
}