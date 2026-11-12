import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TEMPLATE_CATEGORIES, TEMPLATE_TYPES, TEMPLATE_VARIABLES } from "@/lib/services/communication-templates"
import { TemplateFormValidation, type TemplateFormValues } from "@/lib/validations/communication-templates"

interface TemplateFormProps {
  defaultValues: TemplateFormValues
  submitLabel: string
  isPending: boolean
  error: string | null
  onSubmit: (values: TemplateFormValues) => void
}

export default function TemplateForm({ defaultValues, submitLabel, isPending, error, onSubmit }: TemplateFormProps) {
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(TemplateFormValidation),
    defaultValues,
  })

  const select = (name: "type" | "category", label: string, options: readonly { value: string, label: string }[]) => (
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
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Rent reminder" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {select("type", "Type", TEMPLATE_TYPES)}
          {select("category", "Category", TEMPLATE_CATEGORIES)}
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Rent due for {{property_name}}" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea rows={8} placeholder={"Hi {{tenant_name}}, your rent of {{amount}} is due on {{due_date}}."} {...field} />
              </FormControl>
              <FormDescription>
                Variables you can use: {TEMPLATE_VARIABLES.map((v) => `{{${v.value}}}`).join(", ")}. They are filled with the renter's data when you use the template.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to="/renters/communications" search={{ tab: "templates" }}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
