import type { Document } from "@server/database/schema";
import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";

export class UpdateDocumentUseCase {
  constructor(private readonly repository: DocumentsRepository) {}

  async execute(id: string, payload: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const updatedDocument = await this.repository.update(id, payload);

    if (!updatedDocument) throw new Error('Document not updated');

    return updatedDocument;
  }
}