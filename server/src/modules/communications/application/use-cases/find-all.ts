import type { CommunicationsRepository, CommunicationWithNames } from "@server/modules/communications/domain/repositories/communications.repository";

export class FindAllCommunicationsUseCase {
  constructor(private readonly repository: CommunicationsRepository) {}

  async execute(userId: string): Promise<CommunicationWithNames[]> {
    return await this.repository.findAll(userId);
  }
}
