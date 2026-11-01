import { NotFoundError } from "@server/shared/errors";
import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";

export class DeleteExpenseUseCase {
  constructor(private readonly repository: ExpensesRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const deleted = await this.repository.delete(id, userId);

    if (!deleted) throw new NotFoundError('Expense not found');
  }
}