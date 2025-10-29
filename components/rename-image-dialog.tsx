"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Image } from "@/lib/types"
import { renameImage } from "@/lib/storage"

interface RenameImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: Image
  onSuccess: () => void
}

export function RenameImageDialog({ open, onOpenChange, image, onSuccess }: RenameImageDialogProps) {
  const [imageName, setImageName] = useState(image.name)
  const [isRenaming, setIsRenaming] = useState(false)

  useEffect(() => {
    setImageName(image.name)
  }, [image.name])

  const handleRename = async () => {
    if (!imageName.trim()) {
      toast.error("Please enter an image name")
      return
    }

    if (imageName.trim() === image.name) {
      onOpenChange(false)
      return
    }

    setIsRenaming(true)
    try {
      await renameImage(image.id, imageName.trim())
      toast.success("Image renamed successfully")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename image")
    } finally {
      setIsRenaming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Image</DialogTitle>
          <DialogDescription>Enter a new name for "{image.name}".</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rename-image">Image Name</Label>
            <Input
              id="rename-image"
              placeholder="Enter image name"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename()
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isRenaming}>
            {isRenaming ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
