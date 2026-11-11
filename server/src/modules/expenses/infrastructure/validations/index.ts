import { z } from "zod";

// Limits mirror the `expenses` table, so invalid values answer 400 instead of failing in Postgres.
// The category list in the table is open ("maintenance, utilities, insurance, tax, etc."); repair is in use.
export const expenseCategories = ["maintenance", "repair", "utilities", "insurance", "tax", "other"] as const;
export const recurringFrequencies = ["monthly", "yearly"] as const;

// amount is decimal(10, 2); an expense of 0 has no meaning.
const amount = z.number().positive().multipleOf(0.01).max(99_999_999.99).transform(String);
// One-off expenses used to send an empty frequency; it is stored as null.
const frequency = z.preprocess((value) => (value === "" ? null : value), z.enum(recurringFrequencies).nullable().optional());

const frequencyWhenRecurring = (expense: { isRecurring?: boolean, recurringFrequency?: string | null }) =>
  expense.isRecurring !== true || !!expense.recurringFrequency;
const frequencyWhenRecurringIssue = { message: "recurringFrequency is required for a recurring expense", path: ["recurringFrequency"] };

// Columns that are nullable or have a table default: optional, and null clears the nullable ones.
const optionalFields = {
  propertyId: z.string().nullable().optional(),
  receiptFile: z.string().max(500).nullable().optional(),
  vendor: z.string().max(100).nullable().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: frequency,
  notes: z.string().nullable().optional(),
};

export const createExpenseSchema = z.object({
  category: z.enum(expenseCategories, { error: (issue) => (issue.input === undefined ? "category is required" : undefined) }),
  description: z.string().max(200),
  amount,
  expenseDate: z.iso.date(),
  ...optionalFields,
}).refine(frequencyWhenRecurring, frequencyWhenRecurringIssue);

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
    category: z.enum(expenseCategories).optional(),
    description: z.string().max(200).optional(),
    amount: amount.optional(),
    expenseDate: z.iso.date().optional(),
    ...optionalFields,
  }).refine(frequencyWhenRecurring, frequencyWhenRecurringIssue),
});

export type CreateExpense = z.infer<typeof createExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpensesSchema>;
export type FindAllExpenses = z.infer<typeof findAllExpensesSchema>;
export type FindByIdExpenses = z.infer<typeof findByIdExpensesSchema>;
export type DeleteExpense = z.infer<typeof findByIdExpensesSchema>;

