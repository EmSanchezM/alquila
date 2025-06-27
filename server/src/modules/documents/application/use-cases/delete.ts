import type { DocumentsRepository } from "@server/modules/documents/domain/repositories/documents.repository";

export class DeleteDocumentUseCase {
  constructor(private readonly repository: DocumentsRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}