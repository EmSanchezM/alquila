import { NotFoundError } from "@server/shared/errors";
import type { Expense } from "@server/database/schema";
import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";

export class FindByIdExpensesUseCase {
  constructor(private readonly repository: ExpensesRepository) {}

  async execute(id: string, userId: string): Promise<Expense> {
    const expense = await this.repository.findById(id, userId);
    
    if (!expense) throw new NotFoundError('Expense not found');
    
    return expense;
  }
}