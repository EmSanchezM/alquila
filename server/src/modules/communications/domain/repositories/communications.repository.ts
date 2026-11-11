import type { Communication, NewCommunication } from "@server/database/schema";

export type CommunicationWithNames = Communication & { renterName: string | null; propertyName: string | null };

/** The communication log is append-only: the table has no soft delete or update timestamp. */
export interface CommunicationsRepository {
  create(communication: Omit<NewCommunication, 'createdAt'>): Promise<Communication | null>;
  findAll(userId: string): Promise<CommunicationWithNames[]>;
  findById(id: string, userId: string): Promise<CommunicationWithNames | null>;
}
