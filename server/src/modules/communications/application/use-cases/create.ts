import type { OwnershipGuard } from "@server/shared/ownership";
import type { Communication, NewCommunication } from "@server/database/schema";
import type { CommunicationsRepository } from "@server/modules/communications/domain/repositories/communications.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateCommunicationUseCase {
  constructor(
    private readonly repository: CommunicationsRepository,
    private readonly ownership: OwnershipGuard,
  ) {}

  async execute(payload: Omit<NewCommunication, 'id' | 'userId' | 'createdAt'>, userId: string): Promise<Communication> {
    await this.ownership.assertOwns(userId, payload);

    const created = await this.repository.create({ ...payload, userId, id: generateUuid() });

    if (!created) throw new Error('Communication not created');

    return created;
  }
}
