import type { Payment, NewPayment } from "@server/database/schema";

export interface PaymentsRepository {
  create(document: Omit<NewPayment, 'createdAt' | 'updatedAt'>): Promise<Payment | null>;
  findAll(): Promise<Payment[]>;
  findById(id: string): Promise<Payment | null>;
  update(id: string, payment: Partial<Payment>): Promise<Payment | null>;
  delete(id: string): Promise<void>;
}