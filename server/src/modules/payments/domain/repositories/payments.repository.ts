import type { Payment, NewPayment } from "@server/database/schema";

export interface PaymentsRepository {
  create(document: Omit<NewPayment, 'createdAt' | 'updatedAt'>): Promise<Payment | null>;
  findAll(userId: string): Promise<Payment[]>;
  findById(id: string, userId: string): Promise<Payment | null>;
  update(id: string, userId: string, payment: Partial<Payment>): Promise<Payment | null>;
  delete(id: string, userId: string): Promise<boolean>;
}