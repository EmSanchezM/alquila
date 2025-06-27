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
    try {
      const findAllDocuments = new FindAllDocumentsUseCase(documentRepository);
      const documents = await findAllDocuments.execute();

      return c.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .get("/:id", zValidator('param', findByIdDocumentsSchema), async (c) => {
    try {
      const findByIdDocument = new FindByIdDocumentUseCase(documentRepository);
      const document = await findByIdDocument.execute(c.req.param("id"));

      return c.json({
        success: true,
        data: document,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .post("/",  zValidator('json', createDocumentSchema), async (c) => {
    try {
      const body = await c.req.json();

      const createDocument = new CreateDocumentUseCase(documentRepository);
      const document = await createDocument.execute(body);

      return c.json({
        success: true,
        data: document,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .put("/:id", zValidator('json', updateDocumentsSchema), async (c) => {
    try {
      const body = await c.req.json();
      const updateDocument = new UpdateDocumentUseCase(documentRepository);
      const document = await updateDocument.execute(c.req.param("id"), body);

      return c.json({
        success: true,
        data: document,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .delete("/:id", zValidator('param', findByIdDocumentsSchema), async (c) => {
    try {
      const deleteDocument = new DeleteDocumentUseCase(documentRepository);
      await deleteDocument.execute(c.req.param("id"));

      return c.json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  });
export default documentRouter;