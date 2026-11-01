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
    const findAllRenters = new FindAllRentersUseCase(renterRepository);
    const renters = await findAllRenters.execute();

    return c.json({
      success: true,
      data: renters,
    });
  })
  .get("/:id", zValidator('param', findByIdRentersSchema), async (c) => {
    const findByIdRenters = new FindByIdRentersUseCase(renterRepository);
    const renter = await findByIdRenters.execute(c.req.param("id"));

    return c.json({
      success: true,
      data: renter,
    });
  })
  .post("/",  zValidator('json', createRenterSchema), async (c) => {
    const body = c.req.valid('json');

    const createRenter = new CreateRenterUseCase(renterRepository);
    const renter = await createRenter.execute(body);

    return c.json({
      success: true,
      data: renter,
    });
  })
  .put("/:id", zValidator('param', updateRenterSchema.shape.param), zValidator('json', updateRenterSchema.shape.body), async (c) => {
    const body = c.req.valid('json');
    const updateRenter = new UpdateRenterUseCase(renterRepository);
    const renter = await updateRenter.execute(c.req.param("id"), body);

    return c.json({
      success: true,
      data: renter,
    });
  })
  .delete("/:id", zValidator('param', findByIdRentersSchema), async (c) => {
    const deleteRenter = new DeleteRenterUseCase(renterRepository);
    await deleteRenter.execute(c.req.param("id"));

    return c.json({
      success: true,
      message: "Renter deleted successfully",
    });
  });
export default renterRouter;