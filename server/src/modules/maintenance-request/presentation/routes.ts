import { Hono } from "hono";
import { DrizzleMaintenanceRequestRepository } from "@server/modules/maintenance-request/infrastructure/repositories/DrizzleMaintenanceRequestRepository";
import {
  CreateMaintenanceRequestUseCase,
  DeleteMaintenanceRequestUseCase,
  FindAllMaintenanceRequestsUseCase,
  FindByIdMaintenanceRequestsUseCase,
  UpdateMaintenanceRequestUseCase,
} from "@server/modules/maintenance-request/application/use-cases";

import { zValidator } from "@server/shared/validator-wrapper";
import { createMaintenanceRequestSchema, findByIdMaintenanceRequestsSchema, updateMaintenanceRequestsSchema } from "@server/modules/maintenance-request/infrastructure/validations";

const maintenanceRequestRouter = new Hono();
const maintenanceRequestRepository = new DrizzleMaintenanceRequestRepository();

maintenanceRequestRouter
  .get("/", async (c) => {
    const findAllMaintenanceRequest = new FindAllMaintenanceRequestsUseCase(maintenanceRequestRepository);
    const maintenanceRequests = await findAllMaintenanceRequest.execute();

    return c.json({
      success: true,
      data: maintenanceRequests,
    });
  })
  .get("/:id", zValidator('param', findByIdMaintenanceRequestsSchema), async (c) => {
    const findByIdMaintenanceRequest = new FindByIdMaintenanceRequestsUseCase(maintenanceRequestRepository);
    const maintenanceRequest = await findByIdMaintenanceRequest.execute(c.req.param("id"));

    return c.json({
      success: true,
      data: maintenanceRequest,
    });
  })
  .post("/",  zValidator('json', createMaintenanceRequestSchema), async (c) => {
    const body = c.req.valid('json');

    const createMaintenanceRequest = new CreateMaintenanceRequestUseCase(maintenanceRequestRepository);
    const maintenanceRequest = await createMaintenanceRequest.execute(body);

    return c.json({
      success: true,
      data: maintenanceRequest,
    });
  })
  .put("/:id", zValidator('param', updateMaintenanceRequestsSchema.shape.param), zValidator('json', updateMaintenanceRequestsSchema.shape.body), async (c) => {
    const body = c.req.valid('json');
    const updateMaintenanceRequest = new UpdateMaintenanceRequestUseCase(maintenanceRequestRepository);
    const maintenanceRequest = await updateMaintenanceRequest.execute(c.req.param("id"), body);

    return c.json({
      success: true,
      data: maintenanceRequest,
    });
  })
  .delete("/:id", zValidator('param', findByIdMaintenanceRequestsSchema), async (c) => {
    const deleteMaintenanceRequest = new DeleteMaintenanceRequestUseCase(maintenanceRequestRepository);
    await deleteMaintenanceRequest.execute(c.req.param("id"));

    return c.json({
      success: true,
      message: "Maintenance request deleted successfully",
    });
  });
export default maintenanceRequestRouter;