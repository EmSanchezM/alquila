import { and, eq } from "drizzle-orm";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";

import { db } from "@server/database";
import { payments, type Payment, type NewPayment } from "@server/database/schema";

export class DrizzlePaymentsRepository implements PaymentsRepository {
  async create(payment: Omit<NewPayment, 'createdAt' | 'updatedAt'>): Promise<Payment | null> {
    const [newPayment] = await db.insert(payments).values({
      ...payment,
    }).returning();

    if(!newPayment) return null;

    return newPayment;
  }
  async findAll(userId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(and(eq(payments.userId, userId), eq(payments.isActive, true)));
  }
  
  async findById(id: string, userId: string): Promise<Payment | null> {
    const [result] = await db.select().from(payments).where(and(eq(payments.id, id), eq(payments.userId, userId), eq(payments.isActive, true)));

    if(!result) return null;

    return result;
  }
  
  async update(id: string, userId: string, payment: Partial<Payment>): Promise<Payment | null> {
    const [updatedPayment] = await db.update(payments)
      .set({
        ...payment,
        updatedAt: new Date(),
      })
      .where(and(eq(payments.id, id), eq(payments.userId, userId), eq(payments.isActive, true)))
      .returning();

    if(!updatedPayment) return null;

    return updatedPayment;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const deleted = await db.update(payments)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(payments.id, id), eq(payments.userId, userId), eq(payments.isActive, true)))
      .returning({ id: payments.id });

    return deleted.length > 0;
  }
}