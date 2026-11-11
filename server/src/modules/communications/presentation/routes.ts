import { Hono } from "hono";
import type { AuthEnv } from "@server/shared/require-auth";
import { ownershipGuard } from "@server/shared/ownership-guard";
import { DrizzleCommunicationsRepository } from "@server/modules/communications/infrastructure/repositories/DrizzleCommunicationsRepository";
import {
  CreateCommunicationUseCase,
  FindAllCommunicationsUseCase,
  FindByIdCommunicationUseCase,
} from "@server/modules/communications/application/use-cases";

import { zValidator } from "@server/shared/validator-wrapper";
import { createCommunicationSchema, findByIdCommunicationSchema } from "@server/modules/communications/infrastructure/validations";

// The communication log is append-only: list, detail and create.
const communicationRouter = new Hono<AuthEnv>();
const communicationRepository = new DrizzleCommunicationsRepository();

communicationRouter
  .get("/", async (c) => {
    const communications = await new FindAllCommunicationsUseCase(communicationRepository).execute(c.get("user").id);

    return c.json({ success: true, data: communications });
  })
  .get("/:id", zValidator('param', findByIdCommunicationSchema), async (c) => {
    const communication = await new FindByIdCommunicationUseCase(communicationRepository).execute(c.req.param("id"), c.get("user").id);

    return c.json({ success: true, data: communication });
  })
  .post("/", zValidator('json', createCommunicationSchema), async (c) => {
    const body = c.req.valid('json');
    const communication = await new CreateCommunicationUseCase(communicationRepository, ownershipGuard).execute(body, c.get("user").id);

    return c.json({ success: true, data: communication });
  });

export default communicationRouter;
