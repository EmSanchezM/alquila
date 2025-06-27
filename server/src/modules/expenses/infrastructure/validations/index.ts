import { z } from "zod";

export const createExpenseSchema = z.object({
  propertyId: z.string(),
  userId: z.string(),
  category: z.string({ required_error: "category is required" }),
  description: z.string(),
  amount: z.number(),
  expenseDate: z.string(),
  receiptFile: z.string(),
  vendor: z.string(),
  isRecurring: z.boolean(),
  recurringFrequency: z.string(),
  notes: z.string(),
});

export const findAllExpensesSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sort: z.object({
    field: z.string().optional(),
    order: z.string().optional(),
  }).optional(),
});

export const findByIdExpensesSchema = z.object({
  id: z.string(),
});

export const updateExpensesSchema = z.object({
  param: z.object({
    id: z.string(),
  }),
  body: z.object({
    propertyId: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    amount: z.number().optional(),
    expenseDate: z.string().optional(),
    receiptFile: z.string().optional(),
    vendor: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurringFrequency: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export type CreateExpense = z.infer<typeof createExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpensesSchema>;
export type FindAllExpenses = z.infer<typeof findAllExpensesSchema>;
export type FindByIdExpenses = z.infer<typeof findByIdExpensesSchema>;
export type DeleteExpense = z.infer<typeof findByIdExpensesSchema>;

