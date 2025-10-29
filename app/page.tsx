"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { FolderSidebar } from "@/components/folder-sidebar"
import { ImageUpload } from "@/components/image-upload"
import { ImageGrid } from "@/components/image-grid"
import { ImageViewer } from "@/components/image-viewer"
import { Separator } from "@/components/ui/separator"
import type { Folder, Image } from "@/lib/types"
import { getFolders, getImages, getImagesByFolder } from "@/lib/storage"

export default function HomePage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [isLoadingFolders, setIsLoadingFolders] = useState(true)
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [viewerOpen, setViewerOpen] = useState(false)

  const loadFolders = () => {
    setIsLoadingFolders(true)
    try {
      const loadedFolders = getFolders()
      setFolders(loadedFolders)
    } catch (error) {
      console.error("Failed to load folders:", error)
    } finally {
      setIsLoadingFolders(false)
    }
  }

  const loadImages = () => {
    setIsLoadingImages(true)
    try {
      const loadedImages = selectedFolderId ? getImagesByFolder(selectedFolderId) : getImages()
      setImages(loadedImages)
    } catch (error) {
      console.error("Failed to load images:", error)
    } finally {
      setIsLoadingImages(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadFolders()
    loadImages()
  }, [])

  // Reload images when folder selection changes
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
          </header>

          <main className="flex flex-1 flex-col gap-6 p-6">
            <ImageUpload
              folderId={selectedFolderId}
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
