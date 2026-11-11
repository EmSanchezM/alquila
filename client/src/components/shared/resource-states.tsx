import type { ReactNode } from "react"
import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LoadingState({ children }: { children: ReactNode }) {
  return <p className="p-4 text-blue-800">{children}</p>
}

/** Error banner with a retry button, for a query that failed. */
export function LoadErrorState({ message, onRetry }: { message: string, onRetry: () => void }) {
  return (
    <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between gap-4">
      <p className="text-red-800">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

/** Shown for a 404: the record does not exist or belongs to another account. `action` is usually a link back. */
export function NotFoundState({ title, action }: { title: string, action: ReactNode }) {
  return (
    <div className="text-center py-12">
      <SearchX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">It may have been deleted, or it does not belong to your account.</p>
      {action}
    </div>
  )
}
