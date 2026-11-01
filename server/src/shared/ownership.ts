import type { LeasesRepository } from "@server/modules/leases/domain/repositories/leases.repository";
import type { PropertiesRepository } from "@server/modules/properties/domain/repositories/properties.repository";
import type { RentersRepository } from "@server/modules/renters/domain/repositories/renters.repository";
import { NotFoundError } from "@server/shared/errors";

export type References = {
  propertyId?: string | null;
  renterId?: string | null;
  leaseId?: string | null;
};

/**
 * Checks that the records a payload points to belong to the signed-in user,
 * using each module's user-scoped findById.
 */
export class OwnershipGuard {
  constructor(
    private readonly repositories: {
      properties: PropertiesRepository;
      renters: RentersRepository;
      leases: LeasesRepository;
    },
  ) {}

  async assertOwns(userId: string, { propertyId, renterId, leaseId }: References): Promise<void> {
    if (propertyId != null && !(await this.repositories.properties.findById(propertyId, userId))) {
      throw new NotFoundError("Property not found");
    }
    if (renterId != null && !(await this.repositories.renters.findById(renterId, userId))) {
      throw new NotFoundError("Renter not found");
    }
    if (leaseId != null && !(await this.repositories.leases.findById(leaseId, userId))) {
      throw new NotFoundError("Lease not found");
    }
  }
}
