import type { Payment } from "@server/database/schema";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreatePaymentUseCase {
  constructor(private readonly repository: PaymentsRepository) {}
  async execute(payload: Omit<Payment, 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const data = {
      ...payload,
      id: generateUuid(),
    }
    const createdPayment = await this.repository.create(data);

    if (!createdPayment) throw new Error('Payment not created');

    return createdPayment;
  }
}