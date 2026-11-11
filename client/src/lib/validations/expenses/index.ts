import { z } from "zod";

import { EXPENSE_CATEGORIES, RECURRING_FREQUENCIES, type Expense, type ExpenseInput } from "@/lib/services/expenses";

const values = (options: readonly { value: string }[]): string[] => options.map((o) => o.value);

/** Select value for "no property"; a Select item cannot have an empty value. */
export const NO_PROPERTY = "none";

// Form values are strings, as typed in the inputs. Limits mirror the server schema
// and the `expenses` table.
export const ExpenseFormValidation = z
  .object({
    propertyId: z.string(),
    category: z.string().refine((v) => values(EXPENSE_CATEGORIES).includes(v), "Select a category"),
    description: z.string().trim().min(1, "Enter a description").max(200, "Use 200 characters or fewer"),
    amount: z
      .string()
      .trim()
      .min(1, "Enter an amount")
      .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount with up to 2 decimals")
      .refine((v) => Number(v) > 0, "Enter an amount greater than 0")
      .refine((v) => Number(v) <= 99_999_999.99, "Use an amount up to 99999999.99"),
    expenseDate: z.iso.date("Enter a date"),
    vendor: z.string().trim().max(100, "Use 100 characters or fewer"),
    // Set by the upload, not typed: the receipt's URL and a name to show.
    receiptFile: z.string(),
    receiptName: z.string(),
    isRecurring: z.boolean(),
    recurringFrequency: z.string(),
    notes: z.string(),
  })
  .refine((v) => !v.isRecurring || values(RECURRING_FREQUENCIES).includes(v.recurringFrequency), {
    message: "Select how often it repeats",
    path: ["recurringFrequency"],
  });

export type ExpenseFormValues = z.infer<typeof ExpenseFormValidation>;

export const emptyExpenseForm = (today: string): ExpenseFormValues => ({
  propertyId: NO_PROPERTY,
  category: "",
  description: "",
  amount: "",
  expenseDate: today,
  vendor: "",
  isRecurring: false,
  recurringFrequency: "",
  receiptFile: "",
  receiptName: "",
  notes: "",
});

export function toExpenseForm(expense: Expense): ExpenseFormValues {
  const known = (options: readonly { value: string }[], value: string | null) => (value && values(options).includes(value) ? value : "");
  return {
    propertyId: expense.propertyId ?? NO_PROPERTY,
    // Unknown legacy values are left blank so the user picks a valid one instead of them changing silently.
    category: known(EXPENSE_CATEGORIES, expense.category),
    description: expense.description,
    amount: String(Number(expense.amount)),
    expenseDate: expense.expenseDate,
    vendor: expense.vendor ?? "",
    isRecurring: expense.isRecurring ?? false,
    recurringFrequency: known(RECURRING_FREQUENCIES, expense.recurringFrequency),
    receiptFile: expense.receiptFile ?? "",
    receiptName: expense.receiptFile ? "Current receipt" : "",
    notes: expense.notes ?? "",
  };
}

/** Blank optional fields become null, so editing can clear them. A one-off expense has no frequency. */
export function toExpenseInput(values: ExpenseFormValues): ExpenseInput {
  return {
    propertyId: values.propertyId === NO_PROPERTY ? null : values.propertyId,
    category: values.category,
    description: values.description.trim(),
    amount: Number(values.amount),
    expenseDate: values.expenseDate,
    vendor: values.vendor.trim() === "" ? null : values.vendor.trim(),
    isRecurring: values.isRecurring,
    recurringFrequency: values.isRecurring ? values.recurringFrequency : null,
    receiptFile: values.receiptFile === "" ? null : values.receiptFile,
    notes: values.notes.trim() === "" ? null : values.notes,
  };
}
