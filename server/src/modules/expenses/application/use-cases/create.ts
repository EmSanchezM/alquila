import type { Expense } from "@server/database/schema";
import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateExpenseUseCase {
  constructor(private readonly repository: ExpensesRepository) {}
  async execute(payload: Omit<Expense, 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const data = {
      ...payload,
      id: generateUuid(),
    }
    const createdExpense = await this.repository.create(data);

    if (!createdExpense) throw new Error('Expense not created');

    return createdExpense;
  }
}