import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReceiptInput } from "@/components/shared/receipt"
import { EXPENSE_CATEGORIES, RECURRING_FREQUENCIES } from "@/lib/services/expenses"
import { getAllPropertiesQueryOptions } from "@/lib/services/properties"
import { ExpenseFormValidation, NO_PROPERTY, type ExpenseFormValues } from "@/lib/validations/expenses"

interface ExpenseFormProps {
  defaultValues: ExpenseFormValues
  submitLabel: string
  pendingLabel: string
  isPending: boolean
  error: string | null
  cancel: { to: "/expenses" } | { to: "/expenses/$expenseId", params: { expenseId: string } }
  onSubmit: (values: ExpenseFormValues) => void
}

type TextFieldName = "description" | "amount" | "expenseDate" | "vendor"
type SelectFieldName = "propertyId" | "category" | "recurringFrequency"

export default function ExpenseForm({ defaultValues, submitLabel, pendingLabel, isPending, error, cancel, onSubmit }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseFormValidation),
    defaultValues,
  })
  const isRecurring = useWatch({ control: form.control, name: "isRecurring" })
  const receipt = useWatch({ control: form.control, name: ["receiptFile", "receiptName"] })

  const properties = useQuery(getAllPropertiesQueryOptions)

  const textField = (name: TextFieldName, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...props} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  const select = (name: SelectFieldName, label: string, options: readonly { value: string, label: string }[], disabled = false) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
            <FormControl>
              <SelectTrigger className="w-full" aria-label={label} onBlur={field.onBlur}>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  const propertyOptions = [
    { value: NO_PROPERTY, label: "No property (general expense)" },
    ...(properties.data ?? []).map((p) => ({ value: p.id, label: p.name })),
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {select("propertyId", "Property", propertyOptions, properties.isLoading)}
          {select("category", "Category", EXPENSE_CATEGORIES)}
        </div>

        {textField("description", "Description", { placeholder: "Water bill" })}

        <div className="grid gap-4 sm:grid-cols-3">
          {textField("amount", "Amount", { inputMode: "decimal" })}
          {textField("expenseDate", "Date", { type: "date" })}
          {textField("vendor", "Vendor (optional)")}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 items-end">
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 pb-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                </FormControl>
                <FormLabel className="!mt-0">Recurring expense</FormLabel>
              </FormItem>
            )}
          />
          {isRecurring && select("recurringFrequency", "Repeats", RECURRING_FREQUENCIES)}
        </div>

        <FormField
          control={form.control}
          name="receiptFile"
          render={() => (
            <FormItem>
              <FormLabel>Receipt (optional)</FormLabel>
              <ReceiptInput
                url={receipt[0]}
                name={receipt[1]}
                onChange={({ url, name }) => {
                  form.setValue("receiptFile", url, { shouldDirty: true })
                  form.setValue("receiptName", name)
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link {...cancel}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
