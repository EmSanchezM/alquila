import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageListInput from "@/components/shared/image-list-input"
import {
  PROPERTY_TYPES,
  PropertyFormValidation,
  type PropertyFormValues,
} from "@/lib/validations/properties"

interface PropertyFormProps {
  defaultValues: PropertyFormValues
  submitLabel: string
  pendingLabel: string
  isPending: boolean
  error: string | null
  cancel: { to: "/properties" } | { to: "/properties/$propertyId", params: { propertyId: string } }
  onSubmit: (values: PropertyFormValues) => void
}

type TextFieldName = Exclude<keyof PropertyFormValues, "propertyType" | "description">

export default function PropertyForm({ defaultValues, submitLabel, pendingLabel, isPending, error, cancel, onSubmit }: PropertyFormProps) {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(PropertyFormValidation),
    defaultValues,
  })

  // Keep a type that existing data uses even if it is not in the list.
  const types = PROPERTY_TYPES.some((t) => t.value === defaultValues.propertyType) || !defaultValues.propertyType
    ? PROPERTY_TYPES
    : [...PROPERTY_TYPES, { value: defaultValues.propertyType, label: defaultValues.propertyType }]

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
          {textField("name", "Property name", { placeholder: "Sunset Apartments" })}
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full" onBlur={field.onBlur}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {textField("address", "Address", { placeholder: "123 Main St" })}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {textField("city", "City")}
          {textField("state", "State (optional)")}
          {textField("zipCode", "ZIP code (optional)")}
          {textField("country", "Country")}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {textField("bedrooms", "Bedrooms (optional)", { inputMode: "numeric" })}
          {textField("bathrooms", "Bathrooms (optional)", { inputMode: "numeric" })}
          {textField("squareMeters", "Square meters (optional)", { inputMode: "decimal" })}
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Property description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images (optional)</FormLabel>
              <ImageListInput value={field.value} onChange={field.onChange} />
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
