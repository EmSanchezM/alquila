import { NotFoundError } from "@server/shared/errors";
import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";

export class DeleteDocumentUseCase {
  constructor(private readonly repository: DocumentsRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const deleted = await this.repository.delete(id, userId);

    if (!deleted) throw new NotFoundError('Document not found');
  }
}