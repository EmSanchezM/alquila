import { useId, useState } from "react"
import { ImagePlus, Loader2, Star, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { uploadFile } from "@/lib/services/files"

const IMAGE_TYPES = "image/jpeg,image/png,image/webp"
const ONLY_IMAGES = "Only JPEG, PNG or WebP images are allowed"

interface ImageListInputProps {
  value: string[]
  onChange: (urls: string[]) => void
  max?: number
  /** Whether the first image is shown as the cover. */
  withCover?: boolean
}

/** Uploads images as they are picked; they can be removed, and one can be made the cover (first). */
export default function ImageListInput({ value, onChange, max = 10, withCover = true }: ImageListInputProps) {
  const inputId = useId()
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (files.length === 0) return

    setError(null)
    const room = max - value.length
    if (files.length > room) setError(`You can add ${room} more image${room === 1 ? "" : "s"} (${max} at most).`)

    const accepted = files.slice(0, Math.max(room, 0))
    setUploading(accepted.length)
    const uploaded: string[] = []
    for (const file of accepted) {
      try {
        // The file storage also takes PDFs; only images belong here. The server detects the real
        // type from the content, so a renamed file is caught after the upload too.
        if (!IMAGE_TYPES.split(",").includes(file.type)) throw new Error(ONLY_IMAGES)
        const stored = await uploadFile(file)
        if (!stored.mimeType.startsWith("image/")) throw new Error(ONLY_IMAGES)
        uploaded.push(stored.url)
      } catch (e) {
        setError(`${file.name}: ${(e as Error).message}`)
      } finally {
        setUploading((n) => n - 1)
      }
    }
    if (uploaded.length > 0) onChange([...value, ...uploaded])
  }

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {value.map((url, index) => (
          <figure key={url} className="relative aspect-video rounded-md border overflow-hidden bg-gray-50 group">
            <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
            {withCover && index === 0 && (
              <figcaption className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">Cover</figcaption>
            )}
            <div className="absolute right-1 top-1 flex gap-1">
              {withCover && index > 0 && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  aria-label={`Make image ${index + 1} the cover`}
                  onClick={() => onChange([url, ...value.filter((u) => u !== url)])}
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-7 w-7"
                aria-label={`Remove image ${index + 1}`}
                onClick={() => onChange(value.filter((u) => u !== url))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </figure>
        ))}

        {value.length < max && (
          <label
            htmlFor={inputId}
            className="aspect-video rounded-md border border-dashed flex flex-col items-center justify-center gap-1 text-sm text-gray-500 cursor-pointer hover:bg-gray-50"
          >
            {uploading > 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {uploading > 0 ? "Uploading..." : "Add images"}
          </label>
        )}
      </div>
      <input id={inputId} type="file" accept={IMAGE_TYPES} multiple className="sr-only" onChange={handleChange} aria-label="Add images" />
      <p className="text-xs text-gray-500">JPEG, PNG or WebP, up to 10 MB each, {max} at most.</p>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
