import { DrizzleLeasesRepository } from "@server/modules/leases/infrastructure/repositories/DrizzleLeasesRepository";
import { DrizzlePropertiesRepository } from "@server/modules/properties/infrastructure/repositories/DrizzlePropertiesRepository";
import { DrizzleRentersRepository } from "@server/modules/renters/infrastructure/repositories/DrizzleRentersRepository";
import { OwnershipGuard } from "@server/shared/ownership";

export const ownershipGuard = new OwnershipGuard({
  properties: new DrizzlePropertiesRepository(),
  renters: new DrizzleRentersRepository(),
  leases: new DrizzleLeasesRepository(),
});
