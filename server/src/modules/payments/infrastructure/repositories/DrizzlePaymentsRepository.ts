import { and, eq, getTableColumns, sql } from "drizzle-orm";
import type { PaymentsRepository, PaymentWithNames } from "@server/modules/payments/domain/repositories/payments.repository";

import { db } from "@server/database";
import { leases, payments, properties, renters, type Payment, type NewPayment } from "@server/database/schema";

// Payments with the names of their lease's property and renter. Inner joins are safe: every
// reference is NOT NULL, and soft-deleted rows are kept.
const withNames = () =>
  db.select({
    ...getTableColumns(payments),
    propertyName: properties.name,
    renterName: sql<string>`${renters.firstName} || ' ' || ${renters.lastName}`,
  })
    .from(payments)
    .innerJoin(leases, eq(payments.leaseId, leases.id))
    .innerJoin(properties, eq(leases.propertyId, properties.id))
    .innerJoin(renters, eq(leases.renterId, renters.id));

export class DrizzlePaymentsRepository implements PaymentsRepository {
  async create(payment: Omit<NewPayment, 'createdAt' | 'updatedAt'>): Promise<Payment | null> {
    const [newPayment] = await db.insert(payments).values({
      ...payment,
    }).returning();

    if(!newPayment) return null;

    return newPayment;
  }
  async findAll(userId: string): Promise<PaymentWithNames[]> {
    return await withNames().where(and(eq(payments.userId, userId), eq(payments.isActive, true)));
  }
  
  async findById(id: string, userId: string): Promise<PaymentWithNames | null> {
    const [result] = await withNames().where(and(eq(payments.id, id), eq(payments.userId, userId), eq(payments.isActive, true)));

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