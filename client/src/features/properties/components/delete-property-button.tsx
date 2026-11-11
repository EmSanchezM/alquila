import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"

import DeleteResourceButton from "@/components/shared/delete-resource-button"
import { deleteProperty, propertiesQueryKey } from "@/lib/services/properties"

interface DeletePropertyButtonProps {
  propertyId: string
  propertyName: string
}

export default function DeletePropertyButton({ propertyId, propertyName }: DeletePropertyButtonProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <DeleteResourceButton
      title={`Delete ${propertyName}?`}
      description="The property will be removed from your portfolio. This cannot be undone from the app."
      confirmLabel="Delete property"
      onDelete={() => deleteProperty(propertyId)}
      onDeleted={async () => {
        queryClient.removeQueries({ queryKey: [...propertiesQueryKey, propertyId] })
        await queryClient.invalidateQueries({ queryKey: propertiesQueryKey, exact: true })
        await navigate({ to: "/properties" })
      }}
    />
  )
}
