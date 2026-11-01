import type { Expense, NewExpense } from "@server/database/schema";

export interface ExpensesRepository {
  create(expense: Omit<NewExpense, 'createdAt' | 'updatedAt'>): Promise<Expense | null>;
  findAll(): Promise<Expense[]>;
  findById(id: string): Promise<Expense | null>;
  update(id: string, expense: Partial<Expense>): Promise<Expense | null>;
  delete(id: string): Promise<boolean>;
}