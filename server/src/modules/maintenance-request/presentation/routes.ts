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
    try {
      const findAllMaintenanceRequest = new FindAllMaintenanceRequestsUseCase(maintenanceRequestRepository);
      const maintenanceRequests = await findAllMaintenanceRequest.execute();

      return c.json({
        success: true,
        data: maintenanceRequests,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .get("/:id", zValidator('param', findByIdMaintenanceRequestsSchema), async (c) => {
    try {
      const findByIdMaintenanceRequest = new FindByIdMaintenanceRequestsUseCase(maintenanceRequestRepository);
      const maintenanceRequest = await findByIdMaintenanceRequest.execute(c.req.param("id"));

      return c.json({
        success: true,
        data: maintenanceRequest,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .post("/",  zValidator('json', createMaintenanceRequestSchema), async (c) => {
    try {
      const body = await c.req.json();

      const createMaintenanceRequest = new CreateMaintenanceRequestUseCase(maintenanceRequestRepository);
      const maintenanceRequest = await createMaintenanceRequest.execute(body);

      return c.json({
        success: true,
        data: maintenanceRequest,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .put("/:id", zValidator('json', updateMaintenanceRequestsSchema), async (c) => {
    try {
      const body = await c.req.json();
      const updateMaintenanceRequest = new UpdateMaintenanceRequestUseCase(maintenanceRequestRepository);
      const maintenanceRequest = await updateMaintenanceRequest.execute(c.req.param("id"), body);

      return c.json({
        success: true,
        data: maintenanceRequest,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .delete("/:id", zValidator('param', findByIdMaintenanceRequestsSchema), async (c) => {
    try {
      const deleteMaintenanceRequest = new DeleteMaintenanceRequestUseCase(maintenanceRequestRepository);
      await deleteMaintenanceRequest.execute(c.req.param("id"));

      return c.json({
        success: true,
        message: "Maintenance request deleted successfully",
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  });
export default maintenanceRequestRouter;