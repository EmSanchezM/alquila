import { NotFoundError } from "@server/shared/errors";
import { generateUuid } from "@server/shared/generate-uuid";
import type { CommunicationTemplate, NewCommunicationTemplate } from "@server/database/schema";
import type { CommunicationTemplatesRepository } from "@server/modules/communication-templates/domain/repositories/communication-templates.repository";
import { templateVariables } from "@server/modules/communication-templates/domain/template-variables";

type TemplateFields = Pick<NewCommunicationTemplate, 'name' | 'type' | 'category' | 'subject' | 'content'>;

export class CreateTemplateUseCase {
  constructor(private readonly repository: CommunicationTemplatesRepository) {}

  async execute(payload: TemplateFields, userId: string): Promise<CommunicationTemplate> {
    const variables = templateVariables(payload.subject, payload.content);
    const created = await this.repository.create({ ...payload, variables, userId, id: generateUuid() });

    if (!created) throw new Error('Template not created');

    return created;
  }
}

export class FindAllTemplatesUseCase {
  constructor(private readonly repository: CommunicationTemplatesRepository) {}

  execute(userId: string): Promise<CommunicationTemplate[]> {
    return this.repository.findAll(userId);
  }
}

export class FindByIdTemplateUseCase {
  constructor(private readonly repository: CommunicationTemplatesRepository) {}

  async execute(id: string, userId: string): Promise<CommunicationTemplate> {
    const template = await this.repository.findById(id, userId);
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }
}

export class UpdateTemplateUseCase {
  constructor(private readonly repository: CommunicationTemplatesRepository) {}

  async execute(id: string, payload: Partial<TemplateFields>, userId: string): Promise<CommunicationTemplate> {
    const current = await this.repository.findById(id, userId);
    if (!current) throw new NotFoundError('Template not found');

    // Recompute from the texts the template will have after the update.
    const variables = templateVariables(
      payload.subject === undefined ? current.subject : payload.subject,
      payload.content ?? current.content,
    );
    const updated = await this.repository.update(id, userId, { ...payload, variables });
    if (!updated) throw new NotFoundError('Template not found');

    return updated;
  }
}

export class DeleteTemplateUseCase {
  constructor(private readonly repository: CommunicationTemplatesRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    if (!(await this.repository.delete(id, userId))) throw new NotFoundError('Template not found');
  }
}
