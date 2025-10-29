"use client"

import type React from "react"

import { useState } from "react"
import { ImageIcon, MoreVerticalIcon, DownloadIcon, Trash2Icon, PencilIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { Image } from "@/lib/types"
import { cn } from "@/lib/utils"
import { RenameImageDialog } from "@/components/rename-image-dialog"

interface ImageGridProps {
  images: Image[]
  isLoading?: boolean
  onImageClick: (image: Image) => void
  onImageDeleted: () => void
}

export function ImageGrid({ images, isLoading, onImageClick, onImageDeleted }: ImageGridProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [renameImage, setRenameImage] = useState<Image | null>(null)

  const handleDelete = async (image: Image, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${image.name}"?`)) {
      return
    }

    setDeletingIds((prev) => new Set(prev).add(image.id))

    try {
      const response = await fetch("/api/cloudinary/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: image.publicId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete image")
      }

      onImageDeleted()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete image")
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(image.id)
        return next
      })
    }
  }

  const handleDownload = async (image: Image, e: React.MouseEvent) => {
    e.stopPropagation()

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

  const handleRename = (image: Image, e: React.MouseEvent) => {
    e.stopPropagation()
    setRenameImage(image)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="aspect-square p-0 overflow-hidden">
            <Skeleton className="size-full" />
          </Card>
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon className="size-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No images yet</h3>
        <p className="text-sm text-muted-foreground">Upload your first image to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image) => (
          <Card
            key={image.id}
            className={cn(
              "group relative aspect-square p-0 overflow-hidden cursor-pointer transition-all hover:shadow-lg",
              deletingIds.has(image.id) && "opacity-50 pointer-events-none",
            )}
            onClick={() => onImageClick(image)}
          >
            <img
              src={image.thumbnailUrl || "/placeholder.svg"}
              alt={image.name}
              className="size-full object-cover"
              loading="lazy"
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button size="icon" variant="secondary">
                    <MoreVerticalIcon />
                    <span className="sr-only">Image actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={(e) => handleRename(image, e)}>
                    <PencilIcon />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleDownload(image, e)}>
                    <DownloadIcon />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={(e) => handleDelete(image, e)}>
                    <Trash2Icon />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Image info overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs font-medium truncate">{image.name}</p>
              <p className="text-white/70 text-xs">
                {image.width} × {image.height}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {renameImage && (
        <RenameImageDialog
          open={!!renameImage}
          onOpenChange={(open) => !open && setRenameImage(null)}
          image={renameImage}
          onSuccess={onImageDeleted}
        />
      )}
    </>
  )
}
