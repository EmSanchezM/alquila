// file: validator-wrapper.ts
import { ZodSchema } from 'zod'
import type { ValidationTargets } from 'hono'
import { zValidator as zv } from '@hono/zod-validator'

export const zValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      throw new Error("Validation fields failed: " + result.error.issues.map(e => e.message).join(', '), { cause: result.error })
    }
  })
