import type { Expense } from "@server/database/schema";
import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";

export class UpdateExpenseUseCase {
  constructor(private readonly repository: ExpensesRepository) {}

  async execute(id: string, payload: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const updatedExpense = await this.repository.update(id, payload);

    if (!updatedExpense) throw new Error('Expense not updated');

    return updatedExpense;
  }
}