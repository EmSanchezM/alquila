import type { Payment } from "@server/database/schema";

export interface PaymentsRepository {
  create(document: Omit<Payment, 'createdAt' | 'updatedAt'>): Promise<Payment | null>;
  findAll(): Promise<Payment[]>;
  findById(id: string): Promise<Payment | null>;
  update(id: string, payment: Partial<Payment>): Promise<Payment | null>;
  delete(id: string): Promise<void>;
}