import { Hono } from "hono";
import { DrizzleLeasesRepository } from "@server/modules/leases/infrastructure/repositories/DrizzleLeasesRepository";
import {
  CreateLeaseUseCase,
  DeleteLeaseUseCase,
  FindAllLeasesUseCase,
  FindByIdLeasesUseCase,
  UpdateLeaseUseCase,
} from "@server/modules/leases/application/use-cases";

import { zValidator } from "@server/shared/validator-wrapper";
import { creatLeaseSchema, findByIdLeasesSchema, updateLeaseSchema } from "@server/modules/leases/infrastructure/validations";

const leaseRouter = new Hono();
const leaseRepository = new DrizzleLeasesRepository();

leaseRouter
  .get("/", async (c) => {
    const findAllLeases = new FindAllLeasesUseCase(leaseRepository);
    const leases = await findAllLeases.execute();

    return c.json({
      success: true,
      data: leases,
    });
  })
  .get("/:id", zValidator('param', findByIdLeasesSchema), async (c) => {
    const findByIdLeases = new FindByIdLeasesUseCase(leaseRepository);
    const lease = await findByIdLeases.execute(c.req.param("id"));

    return c.json({
      success: true,
      data: lease,
    });
  })
  .post("/",  zValidator('json', creatLeaseSchema), async (c) => {
    const body = c.req.valid('json');

    const createLease = new CreateLeaseUseCase(leaseRepository);
    const lease = await createLease.execute(body);

    return c.json({
      success: true,
      data: lease,
    });
  })
  .put("/:id", zValidator('param', updateLeaseSchema.shape.param), zValidator('json', updateLeaseSchema.shape.body), async (c) => {
    const body = c.req.valid('json');
    const updateLease = new UpdateLeaseUseCase(leaseRepository);
    const lease = await updateLease.execute(c.req.param("id"), body);

    return c.json({
      success: true,
      data: lease,
    });
  })
  .delete("/:id", zValidator('param', findByIdLeasesSchema), async (c) => {
    const deleteLease = new DeleteLeaseUseCase(leaseRepository);
    await deleteLease.execute(c.req.param("id"));

    return c.json({
      success: true,
      message: "Lease deleted successfully",
    });
  });
export default leaseRouter;