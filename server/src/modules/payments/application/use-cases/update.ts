import type { Payment } from "@server/database/schema";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";

export class UpdatePaymentUseCase {
  constructor(private readonly repository: PaymentsRepository) {}

  async execute(id: string, payload: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const updatedPayment = await this.repository.update(id, payload);

    if (!updatedPayment) throw new Error('Payment not updated');

    return updatedPayment;
  }
}