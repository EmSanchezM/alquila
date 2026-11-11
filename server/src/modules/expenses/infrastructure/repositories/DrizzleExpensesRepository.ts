import { and, eq, getTableColumns } from "drizzle-orm";
import type { ExpensesRepository, ExpenseWithNames } from "@server/modules/expenses/domain/repositories/expenses.repository";

import { db } from "@server/database";
import { expenses, properties, type Expense, type NewExpense } from "@server/database/schema";

// Expenses with the property name. The property is optional, so it is a left join
// and propertyName is null without one.
const withNames = () =>
  db.select({
    ...getTableColumns(expenses),
    propertyName: properties.name,
  })
    .from(expenses)
    .leftJoin(properties, eq(expenses.propertyId, properties.id));

export class DrizzleExpensesRepository implements ExpensesRepository {
  async create(expense: Omit<NewExpense, 'createdAt' | 'updatedAt'>): Promise<Expense | null> {
    const [newExpense] = await db.insert(expenses).values({
      ...expense,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if(!newExpense) return null;

    return newExpense;
  }
  async findAll(userId: string): Promise<ExpenseWithNames[]> {
    return await withNames().where(and(eq(expenses.userId, userId), eq(expenses.isActive, true)));
  }
  
  async findById(id: string, userId: string): Promise<ExpenseWithNames | null> {
    const [result] = await withNames().where(and(eq(expenses.id, id), eq(expenses.userId, userId), eq(expenses.isActive, true)));

    if(!result) return null;

    return result;
  }
  
  async update(id: string, userId: string, expense: Partial<Expense>): Promise<Expense | null> {
    const [updatedExpense] = await db.update(expenses)
      .set({
        ...expense,
        updatedAt: new Date(),
      })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId), eq(expenses.isActive, true)))
      .returning();

    if(!updatedExpense) return null;

    return updatedExpense;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const deleted = await db.update(expenses)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId), eq(expenses.isActive, true)))
      .returning({ id: expenses.id });

    return deleted.length > 0;
  }
}