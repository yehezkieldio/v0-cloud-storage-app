"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { XIcon, DownloadIcon, ExternalLinkIcon } from "lucide-react"
import type { Image } from "@/lib/types"

interface ImageViewerProps {
  image: Image | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageViewer({ image, open, onOpenChange }: ImageViewerProps) {
  if (!image) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = image.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download image")
    }
  }

  const handleOpenInNewTab = () => {
    window.open(image.url, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg font-semibold truncate">{image.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {image.width} × {image.height} • {(image.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon-sm" variant="ghost" onClick={handleDownload}>
              <DownloadIcon />
              <span className="sr-only">Download</span>
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={handleOpenInNewTab}>
              <ExternalLinkIcon />
              <span className="sr-only">Open in new tab</span>
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => onOpenChange(false)}>
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="relative bg-muted flex items-center justify-center p-8 max-h-[80vh] overflow-auto">
          <img
            src={image.url || "/placeholder.svg"}
            alt={image.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
