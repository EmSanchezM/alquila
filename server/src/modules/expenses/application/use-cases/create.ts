import type { OwnershipGuard } from "@server/shared/ownership";
import type { Expense, NewExpense } from "@server/database/schema";
import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";
import { generateUuid } from "@server/shared/generate-uuid";

export class CreateExpenseUseCase {
  constructor(
    private readonly repository: ExpensesRepository,
    private readonly ownership: OwnershipGuard,
  ) {}
  async execute(payload: Omit<NewExpense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Expense> {
    await this.ownership.assertOwns(userId, payload);

    const data = {
      ...payload,
      userId,
      id: generateUuid(),
    }
    const createdExpense = await this.repository.create(data);

    if (!createdExpense) throw new Error('Expense not created');

    return createdExpense;
  }
}