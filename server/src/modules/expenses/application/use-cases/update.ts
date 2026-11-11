import { assertUserFile } from "@server/modules/files/application/assert-user-files";
import type { OwnershipGuard } from "@server/shared/ownership";
import { NotFoundError } from "@server/shared/errors";
import type { Expense } from "@server/database/schema";
import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";

export class UpdateExpenseUseCase {
  constructor(
    private readonly repository: ExpensesRepository,
    private readonly ownership: OwnershipGuard,
  ) {}

  async execute(id: string, payload: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Expense> {
    assertUserFile(payload.receiptFile, userId, "receiptFile");
    await this.ownership.assertOwns(userId, payload);

    const updatedExpense = await this.repository.update(id, userId, payload);

    if (!updatedExpense) throw new NotFoundError('Expense not found');

    return updatedExpense;
  }
}