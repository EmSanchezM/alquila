import { useState } from "react"

import placeholder from "@/assets/placeholder.svg"

interface PropertyGalleryProps {
  images: string[]
  name: string
}

/** The selected image large, with thumbnails to switch; the placeholder when there are none. */
export default function PropertyGallery({ images, name }: PropertyGalleryProps) {
  const [selected, setSelected] = useState(0)
  const current = images[Math.min(selected, images.length - 1)] ?? placeholder

  return (
    <div className="grid gap-3">
      <img
        src={current}
        alt={name}
        className="w-full aspect-video object-cover rounded-lg border bg-gray-50"
        width={600}
        height={338}
      />
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={index === selected}
              className={`aspect-video rounded-md overflow-hidden border-2 ${index === selected ? "border-blue-600" : "border-transparent"}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
