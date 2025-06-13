import { Hono } from "hono";
import { DrizzlePropertiesRepository } from "@server/modules/properties/infrastructure/repositories/DrizzlePropertiesRepository";
import {
  FindByIdPropertiesUseCase,
  FindAllPropertiesUseCase,
  CreatePropertyUseCase,
  UpdatePropertyUseCase,
  DeletePropertyUseCase,
} from "@server/modules/properties/application/use-cases";

import { zValidator } from "@server/shared/validator-wrapper";
import { createPropertySchema, findByIdPropertiesSchema, updatePropertySchema } from "@server/modules/properties/infrastructure/validations";

const propertyRouter = new Hono();
const propertyRepository = new DrizzlePropertiesRepository();

propertyRouter
  .get("/", async (c) => {
    try {
      const findAllProperties = new FindAllPropertiesUseCase(propertyRepository);
      const properties = await findAllProperties.execute();

      return c.json({
        success: true,
        data: properties,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .get("/:id", zValidator('param', findByIdPropertiesSchema), async (c) => {
    try {
      const findByIdProperties = new FindByIdPropertiesUseCase(propertyRepository);
      const property = await findByIdProperties.execute(c.req.param("id"));

      return c.json({
        success: true,
        data: property,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .post("/",  zValidator('json', createPropertySchema), async (c) => {
    try {
      const body = await c.req.json();

      const createProperty = new CreatePropertyUseCase(propertyRepository);
      const property = await createProperty.execute(body);

      return c.json({
        success: true,
        data: property,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .put("/:id", zValidator('json', updatePropertySchema), async (c) => {
    try {
      const body = await c.req.json();
      const updateProperty = new UpdatePropertyUseCase(propertyRepository);
      const property = await updateProperty.execute(c.req.param("id"), body);

      return c.json({
        success: true,
        data: property,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .delete("/:id", zValidator('param', findByIdPropertiesSchema), async (c) => {
    try {
      const deleteProperty = new DeletePropertyUseCase(propertyRepository);
      await deleteProperty.execute(c.req.param("id"));

      return c.json({
        success: true,
        message: "Property deleted successfully",
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  });
export default propertyRouter;