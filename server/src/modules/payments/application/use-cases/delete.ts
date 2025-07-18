import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";

export class DeletePaymentUseCase {
  constructor(private readonly repository: PaymentsRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}