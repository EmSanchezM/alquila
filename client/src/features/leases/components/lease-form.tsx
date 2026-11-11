import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LEASE_STATUSES } from "@/lib/services/leases"
import { getAllPropertiesQueryOptions } from "@/lib/services/properties"
import { getAllRentersQueryOptions, renterName } from "@/lib/services/renters"
import { LeaseFormValidation, type LeaseFormValues } from "@/lib/validations/leases"

interface LeaseFormProps {
  defaultValues: LeaseFormValues
  /** On edit the API does not change the property or the renter; show them instead of a picker. */
  fixedParties?: { propertyName: string, renterName: string }
  submitLabel: string
  pendingLabel: string
  isPending: boolean
  error: string | null
  cancel: { to: "/leases" } | { to: "/leases/$leaseId", params: { leaseId: string } }
  onSubmit: (values: LeaseFormValues) => void
}

type TextFieldName = "startDate" | "endDate" | "monthlyRent" | "securityDeposit" | "paymentDueDay"

export default function LeaseForm({ defaultValues, fixedParties, submitLabel, pendingLabel, isPending, error, cancel, onSubmit }: LeaseFormProps) {
  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(LeaseFormValidation),
    defaultValues,
  })

  const properties = useQuery({ ...getAllPropertiesQueryOptions, enabled: !fixedParties })
  const renters = useQuery({ ...getAllRentersQueryOptions, enabled: !fixedParties })

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

  const picker = (
    name: "propertyId" | "renterId",
    label: string,
    options: { value: string, label: string }[],
    empty: { text: string, link: "/properties/create" | "/renters/create", linkLabel: string },
    isLoading: boolean,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={field.value} onValueChange={field.onChange} disabled={isLoading || options.length === 0}>
            <FormControl>
              <SelectTrigger className="w-full" onBlur={field.onBlur}>
                <SelectValue placeholder={isLoading ? "Loading..." : `Select ${label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isLoading && options.length === 0 && (
            <FormDescription>
              {empty.text} <Link to={empty.link} className="text-blue-600 underline">{empty.linkLabel}</Link>
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
        {fixedParties ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Property</dt>
              <dd className="mt-1 text-sm text-gray-900">{fixedParties.propertyName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Renter</dt>
              <dd className="mt-1 text-sm text-gray-900">{fixedParties.renterName}</dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {picker(
              "propertyId",
              "Property",
              (properties.data ?? []).map((p) => ({ value: p.id, label: p.name })),
              { text: "You have no properties yet.", link: "/properties/create", linkLabel: "Add a property" },
              properties.isLoading,
            )}
            {picker(
              "renterId",
              "Renter",
              (renters.data ?? []).map((r) => ({ value: r.id, label: renterName(r) })),
              { text: "You have no renters yet.", link: "/renters/create", linkLabel: "Add a renter" },
              renters.isLoading,
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {textField("startDate", "Start date", { type: "date" })}
          {textField("endDate", "End date", { type: "date" })}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {textField("monthlyRent", "Monthly rent", { inputMode: "decimal" })}
          {textField("securityDeposit", "Security deposit (optional)", { inputMode: "decimal" })}
          {textField("paymentDueDay", "Payment due day", { inputMode: "numeric" })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 items-end">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full" onBlur={field.onBlur}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LEASE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="autoRenew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 pb-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                </FormControl>
                <FormLabel className="!mt-0">Renews automatically</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms (optional)</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
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
