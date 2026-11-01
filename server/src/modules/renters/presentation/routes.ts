import { Hono } from "hono";
import { DrizzleRentersRepository } from "@server/modules/renters/infrastructure/repositories/DrizzleRentersRepository";
import {
  CreateRenterUseCase,
  DeleteRenterUseCase,
  FindAllRentersUseCase,
  FindByIdRentersUseCase,
  UpdateRenterUseCase,
} from "@server/modules/renters/application/use-cases";

import { zValidator } from "@server/shared/validator-wrapper";
import { createRenterSchema, findByIdRentersSchema, updateRenterSchema } from "@server/modules/renters/infrastructure/validations";

const renterRouter = new Hono();
const renterRepository = new DrizzleRentersRepository();

renterRouter
  .get("/", async (c) => {
    try {
      const findAllRenters = new FindAllRentersUseCase(renterRepository);
      const renters = await findAllRenters.execute();

      return c.json({
        success: true,
        data: renters,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .get("/:id", zValidator('param', findByIdRentersSchema), async (c) => {
    try {
      const findByIdRenters = new FindByIdRentersUseCase(renterRepository);
      const renter = await findByIdRenters.execute(c.req.param("id"));

      return c.json({
        success: true,
        data: renter,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .post("/",  zValidator('json', createRenterSchema), async (c) => {
    try {
      const body = await c.req.json();

      const createRenter = new CreateRenterUseCase(renterRepository);
      const renter = await createRenter.execute(body);

      return c.json({
        success: true,
        data: renter,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .put("/:id", zValidator('json', updateRenterSchema), async (c) => {
    try {
      const body = await c.req.json();
      const updateRenter = new UpdateRenterUseCase(renterRepository);
      const renter = await updateRenter.execute(c.req.param("id"), body);

      return c.json({
        success: true,
        data: renter,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .delete("/:id", zValidator('param', findByIdRentersSchema), async (c) => {
    try {
      const deleteRenter = new DeleteRenterUseCase(renterRepository);
      await deleteRenter.execute(c.req.param("id"));

      return c.json({
        success: true,
        message: "Renter deleted successfully",
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  });
export default renterRouter;