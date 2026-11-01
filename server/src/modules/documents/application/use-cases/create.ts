import type { OwnershipGuard } from "@server/shared/ownership";
import type { Document, NewDocument } from "@server/database/schema";
import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateDocumentUseCase {
  constructor(
    private readonly repository: DocumentsRepository,
    private readonly ownership: OwnershipGuard,
  ) {}
  async execute(payload: Omit<NewDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Document> {
    await this.ownership.assertOwns(userId, payload);

    const data = {
      ...payload,
      userId,
      id: generateUuid(),
    }
    const createdDocument = await this.repository.create(data);

    if (!createdDocument) throw new Error('Document not created');

    return createdDocument;
  }
}