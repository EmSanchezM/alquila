import { Hono } from "hono";
import type { AuthEnv } from "@server/shared/require-auth";
import { DrizzleCommunicationTemplatesRepository } from "@server/modules/communication-templates/infrastructure/repositories/DrizzleCommunicationTemplatesRepository";
import {
  CreateTemplateUseCase,
  DeleteTemplateUseCase,
  FindAllTemplatesUseCase,
  FindByIdTemplateUseCase,
  UpdateTemplateUseCase,
} from "@server/modules/communication-templates/application/use-cases";

import { zValidator } from "@server/shared/validator-wrapper";
import { createTemplateSchema, findByIdTemplateSchema, updateTemplateSchema } from "@server/modules/communication-templates/infrastructure/validations";

const templateRouter = new Hono<AuthEnv>();
const repository = new DrizzleCommunicationTemplatesRepository();

templateRouter
  .get("/", async (c) => {
    const templates = await new FindAllTemplatesUseCase(repository).execute(c.get("user").id);
    return c.json({ success: true, data: templates });
  })
  .get("/:id", zValidator('param', findByIdTemplateSchema), async (c) => {
    const template = await new FindByIdTemplateUseCase(repository).execute(c.req.param("id"), c.get("user").id);
    return c.json({ success: true, data: template });
  })
  .post("/", zValidator('json', createTemplateSchema), async (c) => {
    const template = await new CreateTemplateUseCase(repository).execute(c.req.valid('json'), c.get("user").id);
    return c.json({ success: true, data: template });
  })
  .put("/:id", zValidator('param', updateTemplateSchema.shape.param), zValidator('json', updateTemplateSchema.shape.body), async (c) => {
    const template = await new UpdateTemplateUseCase(repository).execute(c.req.param("id"), c.req.valid('json'), c.get("user").id);
    return c.json({ success: true, data: template });
  })
  .delete("/:id", zValidator('param', findByIdTemplateSchema), async (c) => {
    await new DeleteTemplateUseCase(repository).execute(c.req.param("id"), c.get("user").id);
    return c.json({ success: true, message: "Template deleted successfully" });
  });

export default templateRouter;
