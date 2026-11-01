import type { Expense, NewExpense } from "@server/database/schema";

export interface ExpensesRepository {
  create(expense: Omit<NewExpense, 'createdAt' | 'updatedAt'>): Promise<Expense | null>;
  findAll(userId: string): Promise<Expense[]>;
  findById(id: string, userId: string): Promise<Expense | null>;
  update(id: string, userId: string, expense: Partial<Expense>): Promise<Expense | null>;
  delete(id: string, userId: string): Promise<boolean>;
}