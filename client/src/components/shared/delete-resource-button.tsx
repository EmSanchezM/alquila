import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
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

interface DeleteResourceButtonProps {
  title: string
  description: string
  confirmLabel: string
  onDelete: () => Promise<unknown>
  onDeleted: () => Promise<unknown> | void
}

/** Delete button with a confirmation dialog. Server errors (e.g. a 409) stay visible in the dialog. */
export default function DeleteResourceButton({ title, description, confirmLabel, onDelete, onDeleted }: DeleteResourceButtonProps) {
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: onDelete,
    onSuccess: async () => {
      await onDeleted()
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
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {mutation.error && (
          <p role="alert" className="text-sm text-red-600">{mutation.error.message}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          {/* A plain button, so the dialog stays open to show an error. */}
          <Button variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Deleting..." : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
