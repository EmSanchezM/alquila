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
    try {
      const findAllLeases = new FindAllLeasesUseCase(leaseRepository);
      const leases = await findAllLeases.execute();

      return c.json({
        success: true,
        data: leases,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .get("/:id", zValidator('param', findByIdLeasesSchema), async (c) => {
    try {
      const findByIdLeases = new FindByIdLeasesUseCase(leaseRepository);
      const lease = await findByIdLeases.execute(c.req.param("id"));

      return c.json({
        success: true,
        data: lease,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .post("/",  zValidator('json', creatLeaseSchema), async (c) => {
    try {
      const body = await c.req.json();

      const createLease = new CreateLeaseUseCase(leaseRepository);
      const lease = await createLease.execute(body);

      return c.json({
        success: true,
        data: lease,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .put("/:id", zValidator('json', updateLeaseSchema), async (c) => {
    try {
      const body = await c.req.json();
      const updateLease = new UpdateLeaseUseCase(leaseRepository);
      const lease = await updateLease.execute(c.req.param("id"), body);

      return c.json({
        success: true,
        data: lease,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .delete("/:id", zValidator('param', findByIdLeasesSchema), async (c) => {
    try {
      const deleteLease = new DeleteLeaseUseCase(leaseRepository);
      await deleteLease.execute(c.req.param("id"));

      return c.json({
        success: true,
        message: "Lease deleted successfully",
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  });
export default leaseRouter;