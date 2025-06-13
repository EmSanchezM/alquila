import type { Property } from "@server/database/schema";
import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreatePropertyUseCase {
  constructor(private readonly repository: PropertiesRepository) {}
  async execute(payload: Omit<Property, 'createdAt' | 'updatedAt'>): Promise<Property> {
    const data = {
      ...payload,
      id: generateUuid(),
    }
    const createdProperty = await this.repository.create(data);

    if (!createdProperty) throw new Error('Property not created');

    return createdProperty;
  }
}