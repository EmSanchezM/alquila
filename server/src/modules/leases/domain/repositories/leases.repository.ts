import type { Lease, NewLease } from "@server/database/schema";

export type LeaseWithNames = Lease & { propertyName: string; renterName: string };

export interface LeasesRepository {
  create(lease: Omit<NewLease, 'createdAt' | 'updatedAt'>): Promise<Lease | null>;
  findAll(userId: string): Promise<LeaseWithNames[]>;
  findById(id: string, userId: string): Promise<LeaseWithNames | null>;
  update(id: string, userId: string, lease: Partial<Lease>): Promise<Lease | null>;
  delete(id: string, userId: string): Promise<boolean>;
}