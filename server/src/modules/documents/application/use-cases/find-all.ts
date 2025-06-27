import type { Document } from "@server/database/schema";
import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";

export class FindAllDocumentsUseCase {
  constructor(private readonly repository: DocumentsRepository) {}

  async execute(): Promise<Omit<Document[], 'updatedAt'>> {
    return await this.repository.findAll();
  }
}