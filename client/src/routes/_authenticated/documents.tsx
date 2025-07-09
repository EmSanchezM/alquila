import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/documents')({
  component: Documents,
})

function Documents() {
  return <div className="p-2">Hello from documents!</div>
}