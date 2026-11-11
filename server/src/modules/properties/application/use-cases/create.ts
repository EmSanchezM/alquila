import type { Property, NewProperty } from "@server/database/schema";
import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";
import { generateUuid } from "@server/shared/generate-uuid";
import { assertOwnImages } from "@server/modules/properties/application/assert-own-images";

export class CreatePropertyUseCase {
  constructor(private readonly repository: PropertiesRepository) {}
  async execute(payload: Omit<NewProperty, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Property> {
    assertOwnImages(payload.images, userId);

    const data = {
      ...payload,
      userId,
      id: generateUuid(),
    }
    const createdProperty = await this.repository.create(data);

    if (!createdProperty) throw new Error('Property not created');

    return createdProperty;
  }
}