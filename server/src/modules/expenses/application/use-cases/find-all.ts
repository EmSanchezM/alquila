import type { Expense } from "@server/database/schema";
import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";

export class FindAllExpensesUseCase {
  constructor(private readonly repository: ExpensesRepository) {}

  async execute(): Promise<Omit<Expense[], 'updatedAt'>> {
    return await this.repository.findAll();
  }
}