import type { CommunicationTemplate, NewCommunicationTemplate } from "@server/database/schema";

export interface CommunicationTemplatesRepository {
  create(template: Omit<NewCommunicationTemplate, 'createdAt' | 'updatedAt'>): Promise<CommunicationTemplate | null>;
  findAll(userId: string): Promise<CommunicationTemplate[]>;
  findById(id: string, userId: string): Promise<CommunicationTemplate | null>;
  update(id: string, userId: string, template: Partial<CommunicationTemplate>): Promise<CommunicationTemplate | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
