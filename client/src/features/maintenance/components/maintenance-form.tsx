import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageListInput from "@/components/shared/image-list-input"
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES } from "@/lib/services/maintenance"
import { getAllPropertiesQueryOptions } from "@/lib/services/properties"
import { getAllRentersQueryOptions, renterName } from "@/lib/services/renters"
import { MaintenanceFormValidation, NO_RENTER, type MaintenanceFormValues } from "@/lib/validations/maintenance"

interface MaintenanceFormProps {
  defaultValues: MaintenanceFormValues
  submitLabel: string
  pendingLabel: string
  isPending: boolean
  error: string | null
  cancel: { to: "/maintenance" } | { to: "/maintenance/$requestId", params: { requestId: string } }
  onSubmit: (values: MaintenanceFormValues) => void
}

type TextFieldName = "title" | "reportedDate" | "scheduledDate" | "completedDate" | "assignedTo" | "estimatedCost" | "actualCost"
type SelectFieldName = "propertyId" | "renterId" | "category" | "priority" | "status"

export default function MaintenanceForm({ defaultValues, submitLabel, pendingLabel, isPending, error, cancel, onSubmit }: MaintenanceFormProps) {
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(MaintenanceFormValidation),
    defaultValues,
  })

  const properties = useQuery(getAllPropertiesQueryOptions)
  const renters = useQuery(getAllRentersQueryOptions)

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

  const select = (name: SelectFieldName, label: string, options: readonly { value: string, label: string }[], extra?: React.ReactNode, disabled = false) => (
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
          {extra}
          <FormMessage />
        </FormItem>
      )}
    />
  )

  const propertyOptions = (properties.data ?? []).map((p) => ({ value: p.id, label: p.name }))
  const renterOptions = [{ value: NO_RENTER, label: "No renter" }, ...(renters.data ?? []).map((r) => ({ value: r.id, label: renterName(r) }))]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {select(
            "propertyId",
            "Property",
            propertyOptions,
            !properties.isLoading && propertyOptions.length === 0 && (
              <FormDescription>
                You have no properties yet. <Link to="/properties/create" className="text-blue-600 underline">Add a property</Link>
              </FormDescription>
            ),
            properties.isLoading || propertyOptions.length === 0,
          )}
          {select("renterId", "Reported by (optional)", renterOptions, undefined, renters.isLoading)}
        </div>

        {textField("title", "Title", { placeholder: "Kitchen sink leak" })}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {select("category", "Category", MAINTENANCE_CATEGORIES)}
          {select("priority", "Priority", MAINTENANCE_PRIORITIES)}
          {select("status", "Status", MAINTENANCE_STATUSES)}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {textField("reportedDate", "Reported", { type: "date" })}
          {textField("scheduledDate", "Scheduled (optional)", { type: "date" })}
          {textField("completedDate", "Completed (optional)", { type: "date" })}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {textField("assignedTo", "Assigned to (optional)")}
          {textField("estimatedCost", "Estimated cost (optional)", { inputMode: "decimal" })}
          {textField("actualCost", "Actual cost (optional)", { inputMode: "decimal" })}
        </div>

        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos (optional)</FormLabel>
              <ImageListInput value={field.value} onChange={field.onChange} withCover={false} />
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
