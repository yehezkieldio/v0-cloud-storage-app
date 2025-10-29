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
      deleteFolder(folder.id)
      toast.success("Folder deleted successfully")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
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
                deleted from localStorage.
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
