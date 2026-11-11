import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VERIFICATION_STATUSES } from "@/lib/services/renters"
import { RenterFormValidation, type RenterFormValues } from "@/lib/validations/renters"

interface RenterFormProps {
  defaultValues: RenterFormValues
  submitLabel: string
  pendingLabel: string
  isPending: boolean
  error: string | null
  cancel: { to: "/renters" } | { to: "/renters/$renterId", params: { renterId: string } }
  onSubmit: (values: RenterFormValues) => void
}

type TextFieldName = Exclude<keyof RenterFormValues, "verificationStatus" | "notes">

export default function RenterForm({ defaultValues, submitLabel, pendingLabel, isPending, error, cancel, onSubmit }: RenterFormProps) {
  const form = useForm<RenterFormValues>({
    resolver: zodResolver(RenterFormValidation),
    defaultValues,
  })

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {textField("firstName", "First name", { autoComplete: "off" })}
          {textField("lastName", "Last name", { autoComplete: "off" })}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {textField("email", "Email (optional)", { type: "email", placeholder: "renter@example.com" })}
          {textField("phoneNumber", "Phone (optional)", { type: "tel" })}
          {textField("dniNumber", "ID number (optional)")}
        </div>

        <FormField
          control={form.control}
          name="verificationStatus"
          render={({ field }) => (
            <FormItem className="sm:max-w-xs">
              <FormLabel>Verification</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full" onBlur={field.onBlur}>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VERIFICATION_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <fieldset className="grid gap-4">
          <legend className="text-sm font-medium mb-2">Emergency contact (optional)</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            {textField("contactName", "Contact name")}
            {textField("contactPhone", "Contact phone", { type: "tel" })}
            {textField("contactRelationship", "Relationship")}
          </div>
        </fieldset>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
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
