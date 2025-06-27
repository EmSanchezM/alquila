import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";

export class DeleteExpenseUseCase {
  constructor(private readonly repository: ExpensesRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}