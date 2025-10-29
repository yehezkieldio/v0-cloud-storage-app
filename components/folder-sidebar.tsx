"use client"

import { useState } from "react"
import { FolderIcon, FolderOpenIcon, PlusIcon, MoreVerticalIcon, Trash2Icon, Edit2Icon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Folder } from "@/lib/types"
import { CreateFolderDialog } from "./create-folder-dialog"
import { RenameFolderDialog } from "./rename-folder-dialog"
import { DeleteFolderDialog } from "./delete-folder-dialog"

interface FolderSidebarProps {
  folders: Folder[]
  selectedFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  onFolderCreated: () => void
  onFolderUpdated: () => void
  onFolderDeleted: () => void
}

export function FolderSidebar({
  folders,
  selectedFolderId,
  onFolderSelect,
  onFolderCreated,
  onFolderUpdated,
  onFolderDeleted,
}: FolderSidebarProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)

  const handleRenameClick = (folder: Folder) => {
    setSelectedFolder(folder)
    setRenameDialogOpen(true)
  }

  const handleDeleteClick = (folder: Folder) => {
    setSelectedFolder(folder)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center justify-between px-2 py-2">
            <h2 className="text-lg font-semibold">Folders</h2>
            <Button size="icon-sm" variant="ghost" onClick={() => setCreateDialogOpen(true)}>
              <PlusIcon />
              <span className="sr-only">Create folder</span>
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="flex-1">
            <SidebarGroup>
              <SidebarGroupLabel>All Folders</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* All Images folder */}
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={selectedFolderId === null} onClick={() => onFolderSelect(null)}>
                      <FolderOpenIcon className="text-blue-500" />
                      <span>All Images</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {folders.reduce((sum, f) => sum + f.imageCount, 0)}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* User folders */}
                  {folders.map((folder) => (
                    <SidebarMenuItem key={folder.id}>
                      <SidebarMenuButton
                        isActive={selectedFolderId === folder.id}
                        onClick={() => onFolderSelect(folder.id)}
                      >
                        {selectedFolderId === folder.id ? (
                          <FolderOpenIcon className="text-amber-500" />
                        ) : (
                          <FolderIcon className="text-amber-500" />
                        )}
                        <span className="flex-1 truncate">{folder.name}</span>
                        <span className="text-xs text-muted-foreground">{folder.imageCount}</span>
                      </SidebarMenuButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="absolute top-1 right-1 opacity-0 group-hover/menu-item:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVerticalIcon />
                            <span className="sr-only">Folder actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRenameClick(folder)}>
                            <Edit2Icon />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(folder)}>
                            <Trash2Icon />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>

      <CreateFolderDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={onFolderCreated} />

      {selectedFolder && (
        <>
          <RenameFolderDialog
            open={renameDialogOpen}
            onOpenChange={setRenameDialogOpen}
            folder={selectedFolder}
            onSuccess={onFolderUpdated}
          />
          <DeleteFolderDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            folder={selectedFolder}
            onSuccess={onFolderDeleted}
          />
        </>
      )}
    </>
  )
}
