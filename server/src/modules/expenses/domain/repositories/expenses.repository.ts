import type { Expense, NewExpense } from "@server/database/schema";

export type ExpenseWithNames = Expense & { propertyName: string | null };

export interface ExpensesRepository {
  create(expense: Omit<NewExpense, 'createdAt' | 'updatedAt'>): Promise<Expense | null>;
  findAll(userId: string): Promise<ExpenseWithNames[]>;
  findById(id: string, userId: string): Promise<ExpenseWithNames | null>;
  update(id: string, userId: string, expense: Partial<Expense>): Promise<Expense | null>;
  delete(id: string, userId: string): Promise<boolean>;
}