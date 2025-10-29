"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { FolderSidebar } from "@/components/folder-sidebar"
import { ImageUpload } from "@/components/image-upload"
import { ImageGrid } from "@/components/image-grid"
import { ImageViewer } from "@/components/image-viewer"
import { Separator } from "@/components/ui/separator"
import { RefreshCwIcon } from "lucide-react"
import type { Folder, Image } from "@/lib/types"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [isLoadingFolders, setIsLoadingFolders] = useState(true)
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [viewerOpen, setViewerOpen] = useState(false)

  const loadFolders = async () => {
    setIsLoadingFolders(true)
    try {
      const response = await fetch("/api/folders")
      if (!response.ok) throw new Error("Failed to load folders")

      const data = await response.json()
      const dbFolders = data.folders

      // Convert to UI format with image counts
      const allImages = await db.images.findAll()
      const foldersWithCounts: Folder[] = dbFolders.map((f: any) => ({
        id: f.id,
        name: f.name,
        imageCount: allImages.filter((img) => img.folder_id === f.id).length,
      }))

      setFolders(foldersWithCounts)
    } catch (error) {
      console.error("[v0] Failed to load folders:", error)
    } finally {
      setIsLoadingFolders(false)
    }
  }

  const loadImages = async () => {
    setIsLoadingImages(true)
    try {
      let dbImages
      if (selectedFolderId) {
        const response = await fetch(`/api/folders/${selectedFolderId}/images`)
        if (!response.ok) throw new Error("Failed to load images")
        const data = await response.json()
        dbImages = data.images
      } else {
        dbImages = await db.images.findAll()
        dbImages = dbImages.map((img) => ({
          id: img.id,
          name: img.name,
          url: img.file_path,
          thumbnailUrl: img.thumbnail_path,
          folderId: img.folder_id,
          size: img.file_size,
          width: img.width,
          height: img.height,
        }))
      }

      setImages(dbImages)
    } catch (error) {
      console.error("[v0] Failed to load images:", error)
    } finally {
      setIsLoadingImages(false)
    }
  }

  useEffect(() => {
    loadFolders()
    loadImages()
  }, [])

  useEffect(() => {
    loadImages()
  }, [selectedFolderId])

  const handleImageClick = (image: Image) => {
    setSelectedImage(image)
    setViewerOpen(true)
  }

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
  }

  const selectedFolder = folders.find((f) => f.id === selectedFolderId)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <FolderSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={handleFolderSelect}
          onFolderCreated={loadFolders}
          onFolderUpdated={loadFolders}
          onFolderDeleted={() => {
            loadFolders()
            setSelectedFolderId(null)
          }}
        />

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {selectedFolderId ? selectedFolder?.name || "Folder" : "All Images"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {images.length} image{images.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                loadFolders()
                loadImages()
              }}
            >
              <RefreshCwIcon className="size-4 mr-2" />
              Refresh
            </Button>
          </header>

          <main className="flex flex-1 flex-col gap-6 p-6">
            <ImageUpload
              folderId={selectedFolderId}
              folderName={selectedFolder?.name || null}
              onUploadComplete={() => {
                loadImages()
                loadFolders()
              }}
            />

            <ImageGrid
              images={images}
              isLoading={isLoadingImages}
              onImageClick={handleImageClick}
              onImageDeleted={() => {
                loadImages()
                loadFolders()
              }}
            />
          </main>
        </SidebarInset>
      </div>

      <ImageViewer image={selectedImage} open={viewerOpen} onOpenChange={setViewerOpen} />
    </SidebarProvider>
  )
}
