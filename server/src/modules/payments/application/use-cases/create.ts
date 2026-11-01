import type { OwnershipGuard } from "@server/shared/ownership";
import type { Payment, NewPayment } from "@server/database/schema";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreatePaymentUseCase {
  constructor(
    private readonly repository: PaymentsRepository,
    private readonly ownership: OwnershipGuard,
  ) {}
  async execute(payload: Omit<NewPayment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Payment> {
    await this.ownership.assertOwns(userId, payload);

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