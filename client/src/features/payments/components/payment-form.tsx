import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReceiptInput } from "@/components/shared/receipt"
import { getAllLeasesQueryOptions } from "@/lib/services/leases"
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/services/payments"
import { NO_METHOD, PaymentFormValidation, type PaymentFormValues } from "@/lib/validations/payments"

interface PaymentFormProps {
  defaultValues: PaymentFormValues
  submitLabel: string
  pendingLabel: string
  isPending: boolean
  error: string | null
  cancel: { to: "/payments" } | { to: "/payments/$paymentId", params: { paymentId: string } }
  onSubmit: (values: PaymentFormValues) => void
}

type TextFieldName = "amount" | "dueDate" | "paidDate" | "reference"

export default function PaymentForm({ defaultValues, submitLabel, pendingLabel, isPending, error, cancel, onSubmit }: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(PaymentFormValidation),
    defaultValues,
  })

  const { data: leases = [], isLoading: leasesLoading } = useQuery(getAllLeasesQueryOptions)
  const receipt = useWatch({ control: form.control, name: ["receiptFile", "receiptName"] })

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

  const select = (name: "paymentMethod" | "status", label: string, options: readonly { value: string, label: string }[]) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
        <FormField
          control={form.control}
          name="leaseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lease</FormLabel>
              <Select
                value={field.value}
                onValueChange={(leaseId) => {
                  field.onChange(leaseId)
                  // Suggest the lease's rent when no amount was typed yet.
                  const lease = leases.find((l) => l.id === leaseId)
                  if (lease && form.getValues("amount").trim() === "") {
                    form.setValue("amount", String(Number(lease.monthlyRent)))
                  }
                }}
                disabled={leasesLoading || leases.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="w-full" aria-label="Lease" onBlur={field.onBlur}>
                    <SelectValue placeholder={leasesLoading ? "Loading..." : "Select lease"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leases.map((lease) => (
                    <SelectItem key={lease.id} value={lease.id}>{lease.propertyName} · {lease.renterName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!leasesLoading && leases.length === 0 && (
                <FormDescription>
                  You have no leases yet. <Link to="/leases/create" className="text-blue-600 underline">Create a lease</Link>
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {textField("amount", "Amount", { inputMode: "decimal" })}
          {textField("dueDate", "Due date", { type: "date" })}
          {textField("paidDate", "Paid date (optional)", { type: "date" })}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {select("status", "Status", PAYMENT_STATUSES)}
          {select("paymentMethod", "Method", [{ value: NO_METHOD, label: "Not set" }, ...PAYMENT_METHODS])}
          {textField("reference", "Reference (optional)")}
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
