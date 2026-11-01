import type { Lease, NewLease } from "@server/database/schema";

export interface LeasesRepository {
  create(lease: Omit<NewLease, 'createdAt' | 'updatedAt'>): Promise<Lease | null>;
  findAll(): Promise<Lease[]>;
  findById(id: string): Promise<Lease | null>;
  update(id: string, lease: Partial<Lease>): Promise<Lease | null>;
  delete(id: string): Promise<void>;
}