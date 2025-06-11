import { Hono } from "hono";
import { DrizzlePropertiesRepository } from "../infrastructure/repositories/DrizzlePropertiesRepository";
import { FindAllPropertiesUseCase } from "../application/use-cases/find-all";

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
});

export default propertyRouter;