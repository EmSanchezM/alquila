import { eq } from "drizzle-orm";
import type { ExpensesRepository } from "@server/modules/expenses/domain/repositories/expenses.repository";

import { db } from "@server/database";
import { expenses, type Expense } from "@server/database/schema";

export class DrizzleExpensesRepository implements ExpensesRepository {
  async create(expense: Omit<Expense, 'createdAt' | 'updatedAt'>): Promise<Expense | null> {
    const [newExpense] = await db.insert(expenses).values({
      ...expense,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if(!newExpense) return null;

    return newExpense;
  }
  async findAll(): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.isActive, true));
  }
  
  async findById(id: string): Promise<Expense | null> {
    const [result] = await db.select().from(expenses).where(eq(expenses.id, id));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, expense: Partial<Expense>): Promise<Expense | null> {
    const [updatedExpense] = await db.update(expenses)
      .set({
        ...expense,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();

    if(!updatedExpense) return null;

    return updatedExpense;
  }

  async delete(id: string): Promise<void> {
    await db.update(expenses)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id));
  }
}