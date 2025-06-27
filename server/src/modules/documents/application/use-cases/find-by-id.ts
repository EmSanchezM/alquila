import type { Document } from "@server/database/schema";
import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";

export class FindByIdDocumentUseCase {
  constructor(private readonly repository: DocumentsRepository) {}

  async execute(id: string): Promise<Document> {
    const document = await this.repository.findById(id);
    
    if (!document) throw new Error('Document not found');
    
    return document;
  }
}