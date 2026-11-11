import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FileUpload from "@/components/shared/file-upload"
import { DOCUMENT_TYPES } from "@/lib/services/documents"
import { getAllLeasesQueryOptions } from "@/lib/services/leases"
import { getAllPropertiesQueryOptions } from "@/lib/services/properties"
import { getAllRentersQueryOptions, renterName } from "@/lib/services/renters"
import { DocumentFormValidation, NO_LINK, type DocumentFormValues } from "@/lib/validations/documents"

interface DocumentFormProps {
  defaultValues: DocumentFormValues
  submitLabel: string
  pendingLabel: string
  isPending: boolean
  error: string | null
  cancel: { to: "/documents" } | { to: "/documents/$documentId", params: { documentId: string } }
  onSubmit: (values: DocumentFormValues) => void
}

type SelectFieldName = "type" | "propertyId" | "renterId" | "leaseId"

export default function DocumentForm({ defaultValues, submitLabel, pendingLabel, isPending, error, cancel, onSubmit }: DocumentFormProps) {
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(DocumentFormValidation),
    defaultValues,
  })
  const [fileUrl, fileName, fileSize] = useWatch({ control: form.control, name: ["fileUrl", "fileName", "fileSize"] })

  const properties = useQuery(getAllPropertiesQueryOptions)
  const renters = useQuery(getAllRentersQueryOptions)
  const leases = useQuery(getAllLeasesQueryOptions)

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
        <FormField
          control={form.control}
          name="fileUrl"
          render={({ fieldState }) => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FileUpload
                current={fileUrl ? { name: fileName, size: fileSize } : null}
                invalid={!!fieldState.error}
                onUploaded={(file) => {
                  form.setValue("fileUrl", file.url, { shouldValidate: true })
                  form.setValue("fileName", file.name)
                  form.setValue("fileSize", file.size)
                  form.setValue("mimeType", file.mimeType)
                  // Suggest a name from the file when none was typed yet.
                  if (form.getValues("name").trim() === "") {
                    form.setValue("name", file.name.replace(/\.[^.]+$/, ""), { shouldValidate: true })
                  }
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Lease contract 2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {select("type", "Type", DOCUMENT_TYPES)}
        </div>

        <fieldset className="grid gap-4">
          <legend className="text-sm font-medium mb-2">Linked to (optional)</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            {select("propertyId", "Property", [none, ...(properties.data ?? []).map((p) => ({ value: p.id, label: p.name }))], properties.isLoading)}
            {select("renterId", "Renter", [none, ...(renters.data ?? []).map((r) => ({ value: r.id, label: renterName(r) }))], renters.isLoading)}
            {select("leaseId", "Lease", [none, ...(leases.data ?? []).map((l) => ({ value: l.id, label: `${l.propertyName} · ${l.renterName}` }))], leases.isLoading)}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2 items-end">
          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires on (optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isImportant"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 pb-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                </FormControl>
                <FormLabel className="!mt-0">Mark as important</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (optional)</FormLabel>
              <FormControl>
                <Input placeholder="2026, signed" {...field} />
              </FormControl>
              <FormDescription>Separate tags with commas.</FormDescription>
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
