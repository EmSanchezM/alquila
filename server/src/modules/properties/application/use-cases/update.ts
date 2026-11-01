import { NotFoundError } from "@server/shared/errors";
import type { Property } from "@server/database/schema";
import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";

export class UpdatePropertyUseCase {
  constructor(private readonly repository: PropertiesRepository) {}

  async execute(id: string, payload: Partial<Omit<Property, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Property> {
    const updatedProperty = await this.repository.update(id, userId, payload);

    if (!updatedProperty) throw new NotFoundError('Property not found');

    return updatedProperty;
  }
}