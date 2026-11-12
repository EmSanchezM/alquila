import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COMMUNICATION_DIRECTIONS, COMMUNICATION_STATUSES, COMMUNICATION_TYPES } from "@/lib/services/communications"
import { getAllPropertiesQueryOptions } from "@/lib/services/properties"
import { getAllRentersQueryOptions, renterName } from "@/lib/services/renters"
import { CommunicationFormValidation, NO_LINK, type CommunicationFormValues } from "@/lib/validations/communications"

interface CommunicationFormProps {
  defaultValues: CommunicationFormValues
  isPending: boolean
  error: string | null
  cancel: { to: "/renters/communications" } | { to: "/renters/$renterId", params: { renterId: string } }
  onSubmit: (values: CommunicationFormValues) => void
}

type SelectFieldName = "type" | "direction" | "status" | "renterId" | "propertyId"

export default function CommunicationForm({ defaultValues, isPending, error, cancel, onSubmit }: CommunicationFormProps) {
  const form = useForm<CommunicationFormValues>({
    resolver: zodResolver(CommunicationFormValidation),
    defaultValues,
  })

  const properties = useQuery(getAllPropertiesQueryOptions)
  const renters = useQuery(getAllRentersQueryOptions)

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

  const none = { value: NO_LINK, label: "None" }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {select("type", "Type", COMMUNICATION_TYPES)}
          {select("direction", "Direction", COMMUNICATION_DIRECTIONS)}
          {select("status", "Status", COMMUNICATION_STATUSES)}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {select("renterId", "Renter", [none, ...(renters.data ?? []).map((r) => ({ value: r.id, label: renterName(r) }))], renters.isLoading)}
          {select("propertyId", "Property", [none, ...(properties.data ?? []).map((p) => ({ value: p.id, label: p.name }))], properties.isLoading)}
          <FormField
            control={form.control}
            name="sentAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>When</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder="What was said or sent..." {...field} />
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
            {isPending ? "Saving..." : "Log communication"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
