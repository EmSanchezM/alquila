import type { Payment } from "@server/database/schema";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";

export class FindAllPaymentssUseCase {
  constructor(private readonly repository: PaymentsRepository) {}

  async execute(): Promise<Omit<Payment[], 'updatedAt'>> {
    return await this.repository.findAll();
  }
}