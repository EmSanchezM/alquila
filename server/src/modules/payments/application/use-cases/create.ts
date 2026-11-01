import type { Payment, NewPayment } from "@server/database/schema";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreatePaymentUseCase {
  constructor(private readonly repository: PaymentsRepository) {}
  async execute(payload: Omit<NewPayment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Payment> {
    const data = {
      ...payload,
      userId,
      id: generateUuid(),
    }
    const createdPayment = await this.repository.create(data);

    if (!createdPayment) throw new Error('Payment not created');

    return createdPayment;
  }
}