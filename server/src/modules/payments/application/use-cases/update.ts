import { NotFoundError } from "@server/shared/errors";
import type { Payment } from "@server/database/schema";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";

export class UpdatePaymentUseCase {
  constructor(private readonly repository: PaymentsRepository) {}

  async execute(id: string, payload: Partial<Omit<Payment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Payment> {
    const updatedPayment = await this.repository.update(id, userId, payload);

    if (!updatedPayment) throw new NotFoundError('Payment not found');

    return updatedPayment;
  }
}