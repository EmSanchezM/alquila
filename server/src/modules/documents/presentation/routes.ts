import { Hono } from "hono";
import { DrizzleDocumentsRepository } from "@server/modules/documents/infrastructure/repositories/DrizzleDocumentsRepository";
import {
  CreateDocumentUseCase,
  DeleteDocumentUseCase,
  FindAllDocumentsUseCase,
  FindByIdDocumentUseCase,
  UpdateDocumentUseCase,
} from "@server/modules/documents/application/use-cases";

import { zValidator } from "@server/shared/validator-wrapper";
import { createDocumentSchema, findByIdDocumentsSchema, updateDocumentsSchema } from "@server/modules/documents/infrastructure/validations";

const documentRouter = new Hono();
const documentRepository = new DrizzleDocumentsRepository();

documentRouter
  .get("/", async (c) => {
    const findAllDocuments = new FindAllDocumentsUseCase(documentRepository);
    const documents = await findAllDocuments.execute();

    return c.json({
      success: true,
      data: documents,
    });
  })
  .get("/:id", zValidator('param', findByIdDocumentsSchema), async (c) => {
    const findByIdDocument = new FindByIdDocumentUseCase(documentRepository);
    const document = await findByIdDocument.execute(c.req.param("id"));

    return c.json({
      success: true,
      data: document,
    });
  })
  .post("/",  zValidator('json', createDocumentSchema), async (c) => {
    const body = c.req.valid('json');

    const createDocument = new CreateDocumentUseCase(documentRepository);
    const document = await createDocument.execute(body);

    return c.json({
      success: true,
      data: document,
    });
  })
  .put("/:id", zValidator('param', updateDocumentsSchema.shape.param), zValidator('json', updateDocumentsSchema.shape.body), async (c) => {
    const body = c.req.valid('json');
    const updateDocument = new UpdateDocumentUseCase(documentRepository);
    const document = await updateDocument.execute(c.req.param("id"), body);

    return c.json({
      success: true,
      data: document,
    });
  })
  .delete("/:id", zValidator('param', findByIdDocumentsSchema), async (c) => {
    const deleteDocument = new DeleteDocumentUseCase(documentRepository);
    await deleteDocument.execute(c.req.param("id"));

    return c.json({
      success: true,
      message: "Document deleted successfully",
    });
  });
export default documentRouter;