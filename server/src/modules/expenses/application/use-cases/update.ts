import { NotFoundError } from "@server/shared/errors";
import type { Expense } from "@server/database/schema";
import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";

export class UpdateExpenseUseCase {
  constructor(private readonly repository: ExpensesRepository) {}

  async execute(id: string, payload: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Expense> {
    const updatedExpense = await this.repository.update(id, userId, payload);

    if (!updatedExpense) throw new NotFoundError('Expense not found');

    return updatedExpense;
  }
}