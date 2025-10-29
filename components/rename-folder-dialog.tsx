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
import type { Folder } from "@/lib/types"

interface RenameFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: Folder
  onSuccess: () => void
}

export function RenameFolderDialog({ open, onOpenChange, folder, onSuccess }: RenameFolderDialogProps) {
  const [folderName, setFolderName] = useState(folder.name)
  const [isRenaming, setIsRenaming] = useState(false)

  useEffect(() => {
    setFolderName(folder.name)
  }, [folder.name])

  const handleRename = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name")
      return
    }

    if (folderName.trim() === folder.name) {
      onOpenChange(false)
      return
    }

    setIsRenaming(true)
    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to rename folder")
      }

      toast.success("Folder renamed successfully")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("[v0] Rename folder error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to rename folder")
    } finally {
      setIsRenaming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>Enter a new name for "{folder.name}".</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rename-folder">Folder Name</Label>
            <Input
              id="rename-folder"
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
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
