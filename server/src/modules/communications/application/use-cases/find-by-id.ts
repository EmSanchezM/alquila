import { NotFoundError } from "@server/shared/errors";
import type { CommunicationsRepository, CommunicationWithNames } from "@server/modules/communications/domain/repositories/communications.repository";

export class FindByIdCommunicationUseCase {
  constructor(private readonly repository: CommunicationsRepository) {}

  async execute(id: string, userId: string): Promise<CommunicationWithNames> {
    const communication = await this.repository.findById(id, userId);

    if (!communication) throw new NotFoundError('Communication not found');

    return communication;
  }
}
