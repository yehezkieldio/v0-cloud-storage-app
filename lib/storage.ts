import type { Folder, Image } from "./types"

const FOLDERS_KEY = "cloud_storage_folders"
const IMAGES_KEY = "cloud_storage_images"

// Folder operations
export function getFolders(): Folder[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(FOLDERS_KEY)
  return data ? JSON.parse(data) : []
}

export function getFolder(id: string): Folder | null {
  const folders = getFolders()
  return folders.find((f) => f.id === id) || null
}

export function createFolder(name: string): Folder {
  if (typeof window === "undefined") {
    throw new Error("localStorage is only available in the browser")
  }
  const folders = getFolders()
  const newFolder: Folder = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    imageCount: 0,
  }
  folders.push(newFolder)
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
  return newFolder
}

export function updateFolder(id: string, name: string): void {
  if (typeof window === "undefined") return
  const folders = getFolders()
  const index = folders.findIndex((f) => f.id === id)
  if (index !== -1) {
    folders[index].name = name
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
  }
}

export function deleteFolder(id: string): void {
  if (typeof window === "undefined") return
  const folders = getFolders()
  const filtered = folders.filter((f) => f.id !== id)
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(filtered))

  // Also delete all images in this folder
  const images = getImages()
  const filteredImages = images.filter((img) => img.folderId !== id)
  localStorage.setItem(IMAGES_KEY, JSON.stringify(filteredImages))
}

export function updateFolderImageCount(folderId: string): void {
  if (typeof window === "undefined") return
  const folders = getFolders()
  const images = getImages()
  const index = folders.findIndex((f) => f.id === folderId)
  if (index !== -1) {
    folders[index].imageCount = images.filter((img) => img.folderId === folderId).length
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
  }
}

// Image operations
export function getImages(): Image[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(IMAGES_KEY)
  return data ? JSON.parse(data) : []
}

export function getImagesByFolder(folderId: string): Image[] {
  const images = getImages()
  return images.filter((img) => img.folderId === folderId)
}

export function addImage(image: Image): void {
  if (typeof window === "undefined") {
    console.error("[v0] Cannot add image: localStorage not available on server")
    return
  }
  try {
    console.log("[v0] Adding image to localStorage:", image.id)
    const images = getImages()
    images.push(image)
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images))
    console.log("[v0] Image added successfully, total images:", images.length)

    if (image.folderId) {
      updateFolderImageCount(image.folderId)
    }
  } catch (error) {
    console.error("[v0] Failed to add image to localStorage:", error)
    throw error
  }
}

export function deleteImage(id: string): void {
  if (typeof window === "undefined") return
  const images = getImages()
  const image = images.find((img) => img.id === id)
  const filtered = images.filter((img) => img.id !== id)
  localStorage.setItem(IMAGES_KEY, JSON.stringify(filtered))

  if (image) {
    updateFolderImageCount(image.folderId)
  }
}

export function renameImage(id: string, newName: string): void {
  if (typeof window === "undefined") return
  const images = getImages()
  const index = images.findIndex((img) => img.id === id)
  if (index !== -1) {
    images[index].name = newName
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images))
    console.log("[v0] Image renamed successfully:", id, "->", newName)
  }
}

// Sync functions to replace localStorage with Cloudinary data
export function syncFolders(folders: Folder[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
  console.log("[v0] Synced", folders.length, "folders to localStorage")
}

export function syncImages(images: Image[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(IMAGES_KEY, JSON.stringify(images))
  console.log("[v0] Synced", images.length, "images to localStorage")
}

export function hasLocalData(): boolean {
  if (typeof window === "undefined") return false
  const folders = localStorage.getItem(FOLDERS_KEY)
  const images = localStorage.getItem(IMAGES_KEY)
  return !!(folders || images)
}
