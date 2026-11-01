import { NotFoundError } from "@server/shared/errors";
import type { Document } from "@server/database/schema";
import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";

export class FindByIdDocumentUseCase {
  constructor(private readonly repository: DocumentsRepository) {}

  async execute(id: string, userId: string): Promise<Document> {
    const document = await this.repository.findById(id, userId);
    
    if (!document) throw new NotFoundError('Document not found');
    
    return document;
  }
}