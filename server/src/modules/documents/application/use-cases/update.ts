import type { OwnershipGuard } from "@server/shared/ownership";
import { NotFoundError } from "@server/shared/errors";
import type { Document } from "@server/database/schema";
import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";
import { assertOwnFileUrl } from "@server/modules/documents/application/assert-own-file-url";

export class UpdateDocumentUseCase {
  constructor(
    private readonly repository: DocumentsRepository,
    private readonly ownership: OwnershipGuard,
  ) {}

  async execute(id: string, payload: Partial<Omit<Document, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Document> {
    assertOwnFileUrl(payload.fileUrl, userId);
    await this.ownership.assertOwns(userId, payload);

    const updatedDocument = await this.repository.update(id, userId, payload);

    if (!updatedDocument) throw new NotFoundError('Document not found');

    return updatedDocument;
  }
}