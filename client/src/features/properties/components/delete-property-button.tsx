import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteProperty, propertiesQueryKey } from "@/lib/services/properties"

interface DeletePropertyButtonProps {
  propertyId: string
  propertyName: string
}

export default function DeletePropertyButton({ propertyId, propertyName }: DeletePropertyButtonProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteProperty(propertyId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: [...propertiesQueryKey, propertyId] })
      await queryClient.invalidateQueries({ queryKey: propertiesQueryKey, exact: true })
      await navigate({ to: "/properties" })
    },
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (mutation.isPending) return
        if (!next) mutation.reset()
        setOpen(next)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {propertyName}?</AlertDialogTitle>
          <AlertDialogDescription>
            The property will be removed from your portfolio. This cannot be undone from the app.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {mutation.error && (
          <p role="alert" className="text-sm text-red-600">{mutation.error.message}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          {/* A plain button, so the dialog stays open to show an error. */}
          <Button variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Deleting..." : "Delete property"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
