import { queryOptions } from "@tanstack/react-query";

import { apiRequest, crudClient, retryServerErrors } from "@/lib/services/api-client";

/** A row of the `expenses` table as the API returns it (decimals as strings, dates as YYYY-MM-DD). */
export interface Expense {
  id: string;
  propertyId: string | null;
  userId: string;
  category: string;
  description: string;
  amount: string;
  expenseDate: string;
  receiptFile: string | null;
  vendor: string | null;
  isRecurring: boolean | null;
  recurringFrequency: string | null;
  notes: string | null;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/expenses and /api/expenses/:id add the property name, null for expenses without a property. */
export type ExpenseWithNames = Expense & { propertyName: string | null };

export const EXPENSE_CATEGORIES = [
  { value: "maintenance", label: "Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "utilities", label: "Utilities" },
  { value: "insurance", label: "Insurance" },
  { value: "tax", label: "Tax" },
  { value: "other", label: "Other" },
] as const;

export const RECURRING_FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

/** Body accepted by POST and PUT /api/expenses. Nullable columns are cleared with null. */
export interface ExpenseInput {
  propertyId: string | null;
  category: string;
  description: string;
  amount: number;
  expenseDate: string;
  vendor: string | null;
  isRecurring: boolean;
  recurringFrequency: string | null;
  /** Left out on edit when unchanged, so the stored receipt is kept. */
  receiptFile?: string | null;
  notes: string | null;
}

const expenses = crudClient<ExpenseWithNames, ExpenseInput>("/expenses");

// Create and update answer with the plain row (no names), so callers refetch the detail.
export const createExpense = (input: ExpenseInput) =>
  apiRequest<Expense>("/expenses", { method: "POST", body: JSON.stringify(input) });
export const updateExpense = (id: string, input: ExpenseInput) =>
  apiRequest<Expense>(`/expenses/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
export const deleteExpense = expenses.remove;

export const expensesQueryKey = ["expenses"] as const;

export const getAllExpensesQueryOptions = queryOptions({
  queryKey: expensesQueryKey,
  queryFn: expenses.getAll,
  staleTime: 1000 * 60 * 5,
  retry: retryServerErrors,
});

export const getExpenseQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...expensesQueryKey, id],
    queryFn: () => expenses.get(id),
    retry: retryServerErrors,
  });
