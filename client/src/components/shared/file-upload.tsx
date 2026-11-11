import { useId, useState } from "react"
import { FileText, Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ACCEPTED_FILE_TYPES, formatFileSize, MAX_FILE_SIZE, uploadFile, type UploadedFile } from "@/lib/services/files"

interface FileUploadProps {
  /** The file already attached, if any, to show its name. */
  current: { name: string, size?: number | null } | null
  onUploaded: (file: UploadedFile) => void
  label?: string
  invalid?: boolean
}

/** Uploads a file as soon as it is picked and reports the stored file. */
export default function FileUpload({ current, onUploaded, label = "Choose file", invalid = false }: FileUploadProps) {
  const inputId = useId()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setError(null)
    if (file.size > MAX_FILE_SIZE) {
      setError("Files must be 10 MB or smaller")
      return
    }

    setIsUploading(true)
    try {
      onUploaded(await uploadFile(file))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="grid gap-2">
      <div className={`flex flex-wrap items-center gap-3 rounded-md border border-dashed p-4 ${invalid ? "border-red-500" : ""}`}>
        <FileText className="h-5 w-5 text-gray-400 shrink-0" />
        <span className="text-sm text-gray-700 flex-1 min-w-0 truncate" data-testid="file-upload-current">
          {current ? `${current.name}${current.size ? ` · ${formatFileSize(current.size)}` : ""}` : "No file attached"}
        </span>
        <Button type="button" variant="outline" size="sm" disabled={isUploading} asChild>
          <label htmlFor={inputId} className="cursor-pointer">
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {isUploading ? "Uploading..." : current ? "Replace file" : label}
          </label>
        </Button>
        <input id={inputId} type="file" accept={ACCEPTED_FILE_TYPES} className="sr-only" onChange={handleChange} disabled={isUploading} aria-label={label} />
      </div>
      <p className="text-xs text-gray-500">PDF, JPEG, PNG or WebP, up to 10 MB.</p>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
