import { Hono } from "hono";
import type { AuthEnv } from "@server/shared/require-auth";
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

const propertyRouter = new Hono<AuthEnv>();
const propertyRepository = new DrizzlePropertiesRepository();

propertyRouter
  .get("/", async (c) => {
    const findAllProperties = new FindAllPropertiesUseCase(propertyRepository);
    const properties = await findAllProperties.execute(c.get("user").id);

    return c.json({
      success: true,
      data: properties,
    });
  })
  .get("/:id", zValidator('param', findByIdPropertiesSchema), async (c) => {
    const findByIdProperties = new FindByIdPropertiesUseCase(propertyRepository);
    const property = await findByIdProperties.execute(c.req.param("id"), c.get("user").id);

    return c.json({
      success: true,
      data: property,
    });
  })
  .post("/",  zValidator('json', createPropertySchema), async (c) => {
    const body = c.req.valid('json');

    const createProperty = new CreatePropertyUseCase(propertyRepository);
    const property = await createProperty.execute(body, c.get("user").id);

    return c.json({
      success: true,
      data: property,
    });
  })
  .put("/:id", zValidator('param', updatePropertySchema.shape.param), zValidator('json', updatePropertySchema.shape.body), async (c) => {
    const body = c.req.valid('json');
    const updateProperty = new UpdatePropertyUseCase(propertyRepository);
    const property = await updateProperty.execute(c.req.param("id"), body, c.get("user").id);

    return c.json({
      success: true,
      data: property,
    });
  })
  .delete("/:id", zValidator('param', findByIdPropertiesSchema), async (c) => {
    const deleteProperty = new DeletePropertyUseCase(propertyRepository);
    await deleteProperty.execute(c.req.param("id"), c.get("user").id);

    return c.json({
      success: true,
      message: "Property deleted successfully",
    });
  });
export default propertyRouter;