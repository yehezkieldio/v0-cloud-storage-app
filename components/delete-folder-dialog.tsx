"use client"

import { useState } from "react"
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
import type { Folder } from "@/lib/types"
import { AlertTriangleIcon } from "lucide-react"
import { deleteFolder } from "@/lib/storage"

interface DeleteFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: Folder
  onSuccess: () => void
}

export function DeleteFolderDialog({ open, onOpenChange, folder, onSuccess }: DeleteFolderDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      console.log("[v0] Deleting folder from Cloudinary:", folder.name)
      const response = await fetch("/api/cloudinary/delete-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: folder.id,
          folderName: folder.name,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete folder from Cloudinary")
      }

      const result = await response.json()
      console.log("[v0] Cloudinary deletion complete, deleted", result.deletedImages, "images")

      // Now delete from localStorage
      deleteFolder(folder.id)
      toast.success("Folder and images deleted successfully")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("[v0] Delete folder error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete folder")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            <DialogTitle>Delete Folder</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete "{folder.name}"?
            {folder.imageCount > 0 && (
              <span className="block mt-2 text-destructive">
                This folder contains {folder.imageCount} image{folder.imageCount !== 1 ? "s" : ""}. All images will be
                permanently deleted from Cloudinary and localStorage.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
