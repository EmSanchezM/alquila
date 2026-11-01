import type { Document, NewDocument } from "@server/database/schema";
import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateDocumentUseCase {
  constructor(private readonly repository: DocumentsRepository) {}
  async execute(payload: Omit<NewDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const data = {
      ...payload,
      id: generateUuid(),
    }
    const createdDocument = await this.repository.create(data);

    if (!createdDocument) throw new Error('Document not created');

    return createdDocument;
  }
}