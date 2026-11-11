import { ExternalLink } from "lucide-react"

import FileUpload from "@/components/shared/file-upload"
import { safeFileHref } from "@/lib/services/files"

interface ReceiptInputProps {
  url: string
  name: string
  onChange: (receipt: { url: string, name: string }) => void
}

/** Attach, replace or remove a receipt (an image or a PDF). An empty url means no receipt. */
export function ReceiptInput({ url, name, onChange }: ReceiptInputProps) {
  return (
    <FileUpload
      label="Attach receipt"
      current={url ? { name } : null}
      onUploaded={(file) => onChange({ url: file.url, name: file.name })}
      onRemove={() => onChange({ url: "", name: "" })}
    />
  )
}

/** Opens the receipt in a new tab, or nothing when there is none or its URL is not safe to open. */
export function ReceiptLink({ url }: { url: string | null }) {
  const href = safeFileHref(url)
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
      View receipt
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}
