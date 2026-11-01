import { NotFoundError } from "@server/shared/errors";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";

export class DeletePaymentUseCase {
  constructor(private readonly repository: PaymentsRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) throw new NotFoundError('Payment not found');
  }
}