import type { Payment, NewPayment } from "@server/database/schema";

export type PaymentWithNames = Payment & { propertyName: string; renterName: string };

export interface PaymentsRepository {
  create(document: Omit<NewPayment, 'createdAt' | 'updatedAt'>): Promise<Payment | null>;
  findAll(userId: string): Promise<PaymentWithNames[]>;
  findById(id: string, userId: string): Promise<PaymentWithNames | null>;
  update(id: string, userId: string, payment: Partial<Payment>): Promise<Payment | null>;
  delete(id: string, userId: string): Promise<boolean>;
}