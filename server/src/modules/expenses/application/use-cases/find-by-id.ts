import type { Expense } from "@server/database/schema";
import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";

export class FindByIdExpensesUseCase {
  constructor(private readonly repository: ExpensesRepository) {}

  async execute(id: string): Promise<Expense> {
    const expense = await this.repository.findById(id);
    
    if (!expense) throw new Error('Expense not found');
    
    return expense;
  }
}