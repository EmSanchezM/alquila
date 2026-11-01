import type { Payment } from "@server/database/schema";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";

export class FindAllPaymentssUseCase {
  constructor(private readonly repository: PaymentsRepository) {}

  async execute(userId: string): Promise<Omit<Payment[], 'updatedAt'>> {
    return await this.repository.findAll(userId);
  }
}