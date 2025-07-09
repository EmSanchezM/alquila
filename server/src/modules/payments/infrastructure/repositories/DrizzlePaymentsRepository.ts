import { eq } from "drizzle-orm";
import type { PaymentsRepository } from "@server/modules/payments/domain/repositories/payments.repository";

import { db } from "@server/database";
import { payments, type Payment } from "@server/database/schema";

export class DrizzlePaymentsRepository implements PaymentsRepository {
  async create(payment: Omit<Payment, 'createdAt' | 'updatedAt'>): Promise<Payment | null> {
    const [newPayment] = await db.insert(payments).values({
      ...payment,
    });

    if(!newPayment) return null;

    return newPayment;
  }
  async findAll(): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.isActive, true));
  }
  
  async findById(id: string): Promise<Payment | null> {
    const [result] = await db.select().from(payments).where(eq(payments.id, id));

    if(!result) return null;

    return result;
  }
  
  async update(id:string, payment: Partial<Payment>): Promise<Payment | null> {
    const [updatedPayment] = await db.update(payments)
      .set({
        ...payment,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();

    if(!updatedPayment) return null;

    return updatedPayment;
  }

  async delete(id: string): Promise<void> {
    await db.update(payments)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id));
  }
}