import { and, asc, eq } from "drizzle-orm";
import type { CommunicationTemplatesRepository } from "@server/modules/communication-templates/domain/repositories/communication-templates.repository";

import { db } from "@server/database";
import { communicationTemplates, type CommunicationTemplate, type NewCommunicationTemplate } from "@server/database/schema";

const active = (userId: string) => and(eq(communicationTemplates.userId, userId), eq(communicationTemplates.isActive, true));

export class DrizzleCommunicationTemplatesRepository implements CommunicationTemplatesRepository {
  async create(template: Omit<NewCommunicationTemplate, 'createdAt' | 'updatedAt'>): Promise<CommunicationTemplate | null> {
    const [created] = await db.insert(communicationTemplates).values({ ...template, createdAt: new Date(), updatedAt: new Date() }).returning();

    return created ?? null;
  }

  async findAll(userId: string): Promise<CommunicationTemplate[]> {
    return await db.select().from(communicationTemplates).where(active(userId)).orderBy(asc(communicationTemplates.name));
  }

  async findById(id: string, userId: string): Promise<CommunicationTemplate | null> {
    const [result] = await db.select().from(communicationTemplates).where(and(eq(communicationTemplates.id, id), active(userId)));

    return result ?? null;
  }

  async update(id: string, userId: string, template: Partial<CommunicationTemplate>): Promise<CommunicationTemplate | null> {
    const [updated] = await db.update(communicationTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(and(eq(communicationTemplates.id, id), active(userId)))
      .returning();

    return updated ?? null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const deleted = await db.update(communicationTemplates)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(communicationTemplates.id, id), active(userId)))
      .returning({ id: communicationTemplates.id });

    return deleted.length > 0;
  }
}
