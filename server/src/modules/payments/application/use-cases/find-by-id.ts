import { NotFoundError } from "@server/shared/errors";
import type { Payment } from "@server/database/schema";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";

export class FindByIdPaymentUseCase {
  constructor(private readonly repository: PaymentsRepository) {}

  async execute(id: string): Promise<Payment> {
    const payment = await this.repository.findById(id);
    
    if (!payment) throw new NotFoundError('Payment not found');
    
    return payment;
  }
}